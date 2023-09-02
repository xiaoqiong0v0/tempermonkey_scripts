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
        set: async function (key, value) {
            localStorage.setItem(STORE_PRE + key, JSON.stringify(value));
        }
    }

    const status = {};
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
    const statusNames = {}
    /**
     * 状态变化监听 function(oldValue, newValue)
     */
    const statusChangeListeners = {
        isOn: [],
        resolution: [],
        dpi: [],
    }
    const invokeStatusChangeListeners = function (key, oldValue, newValue) {
        const listeners = statusChangeListeners[key];
        for (let i = 0; i < listeners.length; i++) {
            listeners[i](oldValue, newValue);
        }
        store.set(key, newValue);
    }

    for (let key in statusDefines) {
        statusNames[key] = key;
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
                if (typeof value !== typeof statusDefines[key]) {
                    throw new Error("status." + key + " 类型错误");
                }
                if (tmpValue === value) {
                    return;
                }
                const oldValue = tmpValue;
                tmpValue = value;
                invokeStatusChangeListeners(key, oldValue, value);
            }
        });
    }
    /**
     * 目标元素变化监听 function(element)
     */
    const onTargetChangeActions = [];
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
        mainUI.style.border = "1px solid #666666";
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
        mainContent.style.display = "flex";
        mainContent.style.flexDirection = "column";
        mainContent.style.padding = "10px";
        mainContent.style.color = "#FFFFFF";
        mainContent.style.minHeight = "300px";
        mainContent.style.width = "300px"
        mainContent.style.height = "auto";
        mainContent.style.maxHeight = "calc(100vh - 100px)";
        mainContent.style.backgroundColor = "#333333";
        mainContent.style.borderRadius = "10px 0 0 10px";
        mainUI.appendChild(mainContent);
        const blockMargin = "5px";
        const newFlexLine = function (alignItems, justifyContent) {
            const line = document.createElement("div");
            line.style.display = "flex";
            line.style.alignItems = undefined === alignItems ? "flex-start" : alignItems;
            line.style.justifyContent = undefined === justifyContent ? "flex-start" : justifyContent;
            line.style.marginBottom = blockMargin;
            line.style.paddingTop = "2px";
            line.style.paddingBottom = "2px";
            return line;
        }
        const newLabel = function (text) {
            const label = document.createElement("label");
            label.innerText = text;
            label.style.display = "inline-block";
            label.style.color = "#FFFFFF";
            label.style.fontSize = "14px";
            label.style.fontWeight = "bold";
            return label;
        }
        const newLabelLine = function (text) {
            const line = document.createElement("div");
            line.style.display = "block";
            line.style.marginTop = blockMargin;
            line.style.marginBottom = blockMargin;
            line.style.borderBottom = "1px solid #FFFFFF";
            line.style.paddingBottom = "2px";
            line.appendChild(newLabel(text));
            return line;
        };
        const newMiniButton = function (text, color) {
            const button = document.createElement("div");
            button.innerText = text;
            button.style.display = "inline-block";
            button.style.color = "#FFFFFF";
            button.style.border = "1px solid #FFFFFF";
            button.style.borderRadius = "5px";
            button.style.padding = "0px 5px";
            button.style.marginLeft = "5px";
            button.style.cursor = "pointer";
            button.style.userSelect = "none";
            button.style.textAlign = "center";
            button.style.fontSize = "12px";
            button.style.backgroundColor = color;
            return button;
        };
        const newInput = function (type, width) {
            const input = document.createElement("input");
            input.type = undefined === type ? "text" : type;
            input.style.width = undefined === width ? "auto" : width;
            input.style.border = "1px solid #FFFFFF";
            input.style.borderRadius = "5px";
            input.style.padding = "2px";
            input.style.color = "#FFFFFF";
            input.style.backgroundColor = "#333333";
            input.style.textAlign = "center";
            input.style.fontSize = "16px";
            input.style.userSelect = "none";
            input.style.outline = "none";
            return input;
        }
        const newSelect = function (width) {
            const select = document.createElement("select");
            select.style.width = undefined === width ? "auto" : width;
            select.style.border = "1px solid #FFFFFF";
            select.style.borderRadius = "5px";
            select.style.padding = "2px";
            select.style.color = "#FFFFFF";
            select.style.backgroundColor = "#333333";
            select.style.textAlign = "center";
            select.style.fontSize = "16px";
            select.style.userSelect = "none";
            select.style.outline = "none";
            return select;
        }
        // 输入设计分辨率
        const labelLine = newLabelLine("设计分辨率");
        labelLine.style.marginRight = "30px";
        mainContent.appendChild(labelLine);
        const resetButton = newMiniButton("重置", "#FF6633");
        labelLine.appendChild(resetButton);
        mainContent.appendChild(labelLine);
        const lineResolution = newFlexLine("center", "space-between");
        lineResolution.style.marginRight = "30px";
        mainContent.appendChild(lineResolution);
        const inputResolutionWidth = newInput("number", "100px");
        lineResolution.appendChild(inputResolutionWidth);
        const labelResolutionX = newLabel("x")
        lineResolution.appendChild(labelResolutionX);
        const inputResolutionHeight = newInput("number", "100px");
        lineResolution.appendChild(inputResolutionHeight);
        // 选择 dpi 值
        const labelDpi = newLabelLine("dpi");
        mainContent.appendChild(labelDpi);
        const selectDpi = newSelect("100%");
        selectDpi.style.marginBottom = blockMargin;
        for (let key in dpiDefines) {
            const option = document.createElement("option");
            option.value = dpiDefines[key];
            option.innerText = key;
            selectDpi.appendChild(option);
        }
        mainContent.appendChild(selectDpi);
        const resultContent = document.createElement("div");
        resultContent.style.marginTop = blockMargin;
        resultContent.style.marginBottom = blockMargin;
        resultContent.style.overflowY = "auto";
        resultContent.style.flex = "1";
        mainContent.appendChild(resultContent);
        let oldHtml = undefined;
        const loadResult = function (element) {
            if (element.innerHTML === oldHtml) {
                return;
            }
            oldHtml = element.innerHTML;
            console.log("content change");
            resultContent.innerHTML = "";
            // 拷贝 element
            const copyElement = element.cloneNode(true);
            resultContent.appendChild(copyElement);
        }
        onTargetChangeActions.push(loadResult);
        const checkSwitch = function (isOn) {
            if (isOn) {
                switchButton.innerText = "关";
                mainContent.style.display = "flex";
            } else {
                switchButton.innerText = "开";
                mainContent.style.display = "none";
            }
        };
        const updateResolution = function (resolution) {
            inputResolutionWidth.value = resolution.width;
            inputResolutionHeight.value = resolution.height;
        };
        const updateDpi = function (dpi) {
            selectDpi.value = dpi;
        };
        statusChangeListeners.isOn.push(function (oldValue, newValue) {
            checkSwitch(newValue);
        });
        statusChangeListeners.resolution.push(function (oldValue, newValue) {
            updateResolution(newValue);
        });
        statusChangeListeners.dpi.push(function (oldValue, newValue) {
            updateDpi(newValue);
        });
        checkSwitch(status.isOn);
        updateResolution(status.resolution);
        updateDpi(status.dpi);
        resetButton.addEventListener("click", function () {
            for (let key in statusDefines) {
                status[key] = statusDefines[key];
            }
        });
        switchButton.addEventListener("click", function () {
            status.isOn = !status.isOn;
        });
        inputResolutionWidth.addEventListener("change", function () {
            status.resolution.width = Number(inputResolutionWidth.value);
            invokeStatusChangeListeners(statusNames.resolution, undefined, status.resolution);
        });
        inputResolutionHeight.addEventListener("change", function () {
            status.resolution.height = Number(inputResolutionHeight.value);
            invokeStatusChangeListeners(statusNames.resolution, undefined, status.resolution);
        });
        selectDpi.addEventListener("change", function () {
            status.dpi = Number(selectDpi.value);
        });
    })();
    const openHelper = function (element) {
        // 监听 element 内容变化
        const observer = new MutationObserver(function () {
            for (let i = 0; i < onTargetChangeActions.length; i++) {
                onTargetChangeActions[i](element);
            }
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
