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
    const dpiDefines = {
        mdpi: 160,
        hdpi: 240,
        xhdpi: 320,
        xxhdpi: 480,
        xxxhdpi: 640,
    }
    const statusDefines = {
        isOn: false,
        resolution: {
            width: 1920,
            height: 1080
        },
        dpi: dpiDefines.xhdpi,
    }
    /**
     * 状态变化监听 function(oldValue, newValue)
     */
    const statusChangeListeners = {
        isOn: [],
        resolution: [],
        dpi: [],
    }

    const status = {};
    for (let key in statusDefines) {
        let tmpValue = undefined;
        Object.defineProperty(status, key, {
            get: function () {
                if (tmpValue === undefined) {
                    tmpValue = store.get(key);
                }
                if (tmpValue === undefined) {
                    tmpValue = statusDefines[key];
                }
                return tmpValue;
            },
            set: function (value) {
                if (tmpValue === value) {
                    return;
                }
                const oldValue = tmpValue;
                tmpValue = value;
                store.set(key, value);
                const listeners = statusChangeListeners[key];
                for (let i = 0; i < listeners.length; i++) {
                    listeners[i](oldValue, value);
                }
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
        const labelLine = document.createElement("div");
        labelLine.style.display = "block";
        labelLine.style.borderBottom = "1px solid #FFFFFF";
        labelLine.style.marginBottom = "5px";
        labelLine.style.marginRight = "30px";
        // 输入设计分辨率
        const labelResolution = document.createElement("label");
        labelResolution.innerText = "设计分辨率";
        labelResolution.style.display = "inline-block";
        labelResolution.style.color = "#FFFFFF";
        labelLine.appendChild(labelResolution);
        const resetButton = document.createElement("div");
        resetButton.innerText = "重置";
        resetButton.style.display = "inline-block";
        resetButton.style.color = "#FFFFFF";
        resetButton.style.border = "1px solid #FFFFFF";
        resetButton.style.borderRadius = "5px";
        resetButton.style.padding = "0px 5px";
        resetButton.style.marginLeft = "5px";
        resetButton.style.cursor = "pointer";
        resetButton.style.userSelect = "none";
        resetButton.style.textAlign = "center";
        resetButton.style.fontSize = "12px";
        resetButton.style.backgroundColor = "#FF6633";
        resetButton.style.marginBottom = "2px";
        labelLine.appendChild(resetButton);
        mainContent.appendChild(labelLine);
        const lineResolution = document.createElement("div");
        lineResolution.style.display = "flex";
        lineResolution.style.alignItems = "center";
        lineResolution.style.marginBottom = "10px";
        lineResolution.style.marginRight = "30px";
        lineResolution.style.justifyContent = "space-between";
        mainContent.appendChild(lineResolution);
        const inputResolutionWidth = document.createElement("input");
        inputResolutionWidth.type = "number";
        inputResolutionWidth.style.width = "100px";
        inputResolutionWidth.style.marginRight = "5px";
        inputResolutionWidth.style.border = "1px solid #FFFFFF";
        inputResolutionWidth.style.borderRadius = "5px";
        inputResolutionWidth.style.padding = "2px";
        inputResolutionWidth.style.color = "#FFFFFF";
        inputResolutionWidth.style.backgroundColor = "#333333";
        inputResolutionWidth.style.textAlign = "center";
        inputResolutionWidth.style.fontSize = "16px";
        inputResolutionWidth.style.userSelect = "none";
        inputResolutionWidth.style.outline = "none";
        inputResolutionWidth.value = status.resolution.width;
        lineResolution.appendChild(inputResolutionWidth);
        const labelResolutionX = document.createElement("label");
        labelResolutionX.innerText = "x";
        labelResolutionX.style.color = "#FFFFFF";
        lineResolution.appendChild(labelResolutionX);
        const inputResolutionHeight = document.createElement("input");
        inputResolutionHeight.type = "number";
        inputResolutionHeight.style.width = "100px";
        inputResolutionHeight.style.marginLeft = "5px";
        inputResolutionHeight.style.border = "1px solid #FFFFFF";
        inputResolutionHeight.style.borderRadius = "5px";
        inputResolutionHeight.style.padding = "2px";
        inputResolutionHeight.style.color = "#FFFFFF";
        inputResolutionHeight.style.backgroundColor = "#333333";
        inputResolutionHeight.style.textAlign = "center";
        inputResolutionHeight.style.fontSize = "16px";
        inputResolutionHeight.style.userSelect = "none";
        inputResolutionHeight.style.outline = "none";
        inputResolutionHeight.value = status.resolution.height;
        lineResolution.appendChild(inputResolutionHeight);
        // 选择 dpi 值
        const labelDpi = document.createElement("label");
        labelDpi.innerText = "dpi";
        labelDpi.style.display = "block";
        labelDpi.style.color = "#FFFFFF";
        labelDpi.style.borderBottom = "1px solid #FFFFFF";
        labelDpi.style.marginBottom = "5px";
        mainContent.appendChild(labelDpi);
        const lineDpi = document.createElement("div");
        lineDpi.style.display = "flex";
        lineDpi.style.alignItems = "center";
        lineDpi.style.marginBottom = "10px";
        lineDpi.style.justifyContent = "space-between";
        mainContent.appendChild(lineDpi);
        const selectDpi = document.createElement("select");
        selectDpi.style.width = "100%";
        selectDpi.style.border = "1px solid #FFFFFF";
        selectDpi.style.borderRadius = "5px";
        selectDpi.style.padding = "2px";
        selectDpi.style.color = "#FFFFFF";
        selectDpi.style.backgroundColor = "#333333";
        selectDpi.style.textAlign = "center";
        selectDpi.style.fontSize = "16px";
        selectDpi.style.userSelect = "none";
        selectDpi.style.outline = "none";
        for (let key in dpiDefines) {
            const option = document.createElement("option");
            option.value = dpiDefines[key];
            option.innerText = key;
            selectDpi.appendChild(option);
        }
        selectDpi.value = status.dpi;
        console.log(selectDpi, selectDpi.value, status.dpi);
        lineDpi.appendChild(selectDpi);
        const checkSwitch = function (isOn) {
            if (isOn) {
                switchButton.innerText = "关";
                mainContent.style.display = "block";
            } else {
                switchButton.innerText = "开";
                mainContent.style.display = "none";
            }
        }
        statusChangeListeners.isOn.push(function (oldValue, newValue) {
            checkSwitch(newValue);
        });
        checkSwitch(status.isOn);
        statusChangeListeners.resolution.push(function (oldValue, newValue) {
            inputResolutionWidth.value = newValue.width;
            inputResolutionHeight.value = newValue.height;
        });
        statusChangeListeners.dpi.push(function (oldValue, newValue) {
            selectDpi.value = newValue;
        });
        resetButton.addEventListener("click", function () {
            for (let key in statusDefines) {
                status[key] = statusDefines[key];
            }
        });
        switchButton.addEventListener("click", function () {
            status.isOn = !status.isOn;
        });
        inputResolutionWidth.addEventListener("change", function () {
            // todo
        });
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
