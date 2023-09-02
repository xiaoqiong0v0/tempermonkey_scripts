// ==UserScript==
// @name         MasterGo 单位辅助
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  masterGo 单位转换
// @author       You
// @match        https://mastergo.com/file/*
// @icon         https://mastergo.com/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    const STORE_PRE = "masterGoUnitHelper";
    const mainUI = document.createElement("div");
    const store = {
        get: function (key) {
            const value = localStorage.getItem(STORE_PRE + key);
            if (value === null) {
                return undefined;
            }
            return JSON.parse(value);
        },
        set: function (key, value) {
            localStorage.setItem(STORE_PRE + key, JSON.stringify(value));
        }
    }
    const statusDefines = {
        isOn: false
    }
    const status = {};
    for (let key in statusDefines) {
        Object.defineProperty(status, key, {
            get: function () {
                if (this.value === undefined) {
                    this.value = store.get(key);
                }
                if (this.value === undefined) {
                    this.value = statusDefines[key];
                }
                return this.value;
            },
            set: function (value) {
                this.value = value;
                store.set(key, value);
            }
        });
    }

    // ui初始化
    (function () {
        // 初始化 mainUI
        // 靠右侧垂直居中
        mainUI.style.position = "fixed";
        mainUI.style.right = "0";
        mainUI.style.top = "80px";
        mainUI.style.zIndex = "9999";
        mainUI.style.width = "auto";
        mainUI.style.height = "auto";
        mainUI.style.backgroundColor = "#333333";
        mainUI.style.borderRadius = "10px 0 0 10px";
        const switchButton = document.createElement("div");
        switchButton.style.position = "absolute";
        switchButton.style.right = "0";
        switchButton.style.top = "0";
        switchButton.style.width = "auto";
        switchButton.style.height = "auto";
        switchButton.style.backgroundColor = "#666666";
        switchButton.style.borderRadius = "5px 0 0 5px";
        switchButton.style.cursor = "pointer";
        switchButton.style.userSelect = "none";
        switchButton.style.padding = "2px";
        switchButton.style.textAlign = "center";
        switchButton.style.lineHeight = "30px";
        switchButton.style.fontSize = "20px";
        switchButton.style.border = "1px solid #FFFFFF";
        switchButton.style.color = "#FFFFFF";
        mainUI.appendChild(switchButton);
        const mainContent = document.createElement("div");
        mainContent.style.padding = "10px";
        mainContent.style.color = "#FFFFFF";
        mainContent.style.width = "300px"
        mainContent.style.minHeight = "300px";
        mainContent.style.height = "auto";
        mainContent.style.backgroundColor = "#333333";
        mainContent.style.borderRadius = "10px 0 0 10px";
        mainUI.appendChild(mainContent);
        const newLine = function () {
            const line = document.createElement("div");
            line.style.width = "100%";
            line.style.height = "1px";
            line.style.backgroundColor = "#FFFFFF";
            return line;
        }
        const inputResolutionWidth = document.createElement("input");
        inputResolutionWidth.type = "number";
        inputResolutionWidth.style.width = "100px";
        const checkSwitch = function () {
            if (status.isOn) {
                switchButton.innerText = "关";
                mainContent.style.display = "block";
            } else {
                switchButton.innerText = "开";
                mainContent.style.display = "none";
            }
        }
        switchButton.addEventListener("click", function () {
            status.isOn = !status.isOn;
            checkSwitch();
        });
        checkSwitch();

    })();
    const openHelper = function (element) {
        // 监听 element 内容变化
        const observer = new MutationObserver(function () {
            console.log("element 内容变化");
        });
        observer.observe(element, {childList: true, subtree: true});
        document.body.appendChild(mainUI);
    }
    const closeHelper = function () {
        document.body.removeChild(mainUI);
    }
    let lastElement = undefined;
    const findObserveInfo = function () {
        const className = "observe-info__layout";
        const observeInfo = document.getElementsByClassName(className)[0];
        if (observeInfo === lastElement) {
            return;
        }
        lastElement = observeInfo;
        if (observeInfo !== undefined) {
            openHelper(observeInfo);
        } else {
            closeHelper();
        }
    }
    // 监听 body 任意内容变化
    const observer = new MutationObserver(function () {
        findObserveInfo();
    });
    observer.observe(document.body, {childList: true, subtree: true});
})();
