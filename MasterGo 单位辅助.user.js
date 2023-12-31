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
        autoDpi: -4,
        ldpi: 120,
        mdpi: 160,
        hdpi: 240,
        xhdpi: 320,
        xxhdpi: 480,
        xxxhdpi: 640,
        vw: -1,
        vh: -2,
        vwvh: -3,
        px: -5,
    }
    const screenSizeDefines = [
        [240, 320, dpiDefines.ldpi],
        [320, 480, dpiDefines.mdpi],
        [480, 800, dpiDefines.hdpi],
        [720, 1280, dpiDefines.xhdpi],
        [1080, 1920, dpiDefines.xxhdpi],
        [1440, 2560, dpiDefines.xxxhdpi],
    ]
    /**
     * 根据屏幕尺寸获取 dpi 宽高会根据大小进行交换 宽为小边 高为大边
     * @param width 宽度
     * @param height 高度
     * @returns {{width: number, height: number}|*} width 对应安卓宽度，height 对应安卓高度
     */
    const getDpiByScreenSize = function (width, height) {
        if (width > height) {
            // 交换
            const tmp = width;
            // noinspection JSSuspiciousNameCombination
            width = height;
            height = tmp;
        }
        // ldpi 240x320 120dpi 0.75
        // mdpi 320x480 160dpi 1
        // hdpi 480x800 240dpi 1.5
        // xhdpi 720x1280 320dpi 2
        // xxhdpi 1080x1920 480dpi 3
        // xxxhdpi 1440x2560 640dpi 4
        let dpi = dpiDefines.ldpi;
        for (let i = 0; i < screenSizeDefines.length; i++) {
            const screenSize = screenSizeDefines[i];
            if (!(width >= screenSize[0] && height >= screenSize[1])) {
                if (i === 0) {
                    dpi = screenSize[2];
                } else {
                    dpi = screenSizeDefines[i - 1][2];
                }
                break;
            }
        }
        return {
            width: dpi,
            height: dpi * (height / width)
        };
    }
    const statusDefines = {
        isOn: false,
        resolution: {
            width: 1920,
            height: 1080
        },
        targetResolution: {
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
        targetResolution: [],
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
        mainUI.style.zIndex = "9998";
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
        const labelLine = newLabelLine("单位辅助");
        labelLine.style.marginRight = "30px";
        mainContent.appendChild(labelLine);
        const resetButton = newMiniButton("重置配置", "#FF6633");
        labelLine.appendChild(resetButton);
        mainContent.appendChild(labelLine);
        // 输入设计分辨率
        const labelResolution = newLabelLine("设计分辨率");
        mainContent.appendChild(labelResolution);
        const lineResolution = newFlexLine("center", "space-between");
        mainContent.appendChild(lineResolution);
        const inputResolutionWidth = newInput("number", "100px");
        lineResolution.appendChild(inputResolutionWidth);
        const labelResolutionX = newLabel("x")
        lineResolution.appendChild(labelResolutionX);
        const inputResolutionHeight = newInput("number", "100px");
        lineResolution.appendChild(inputResolutionHeight);
        // 输入目标分辨率
        const labelTargetResolution = newLabelLine("目标分辨率");
        mainContent.appendChild(labelTargetResolution);
        const lineTargetResolution = newFlexLine("center", "space-between");
        mainContent.appendChild(lineTargetResolution);
        const inputTargetResolutionWidth = newInput("number", "100px");
        lineTargetResolution.appendChild(inputTargetResolutionWidth);
        const labelTargetResolutionX = newLabel("x")
        lineTargetResolution.appendChild(labelTargetResolutionX);
        const inputTargetResolutionHeight = newInput("number", "100px");
        lineTargetResolution.appendChild(inputTargetResolutionHeight);
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
        const setClipboard = async function (text) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                return false;
            }
        }
        // 点击拷贝对象innerText 鼠标浮动时显示点击复制
        const clickToCopy = function (element) {
            const tipPopup = document.createElement("div");
            tipPopup.style.position = "absolute";
            tipPopup.style.width = "auto";
            tipPopup.style.height = "auto";
            tipPopup.style.padding = "2px 5px";
            tipPopup.style.backgroundColor = "#000";
            tipPopup.style.borderRadius = "5px";
            tipPopup.style.color = "#FFFFFF";
            tipPopup.style.fontSize = "12px";
            element.addEventListener("mouseover", function () {
                tipPopup.innerText = "点击复制";
                const rect = element.getBoundingClientRect();
                tipPopup.style.left = rect.left - 80 + "px";
                tipPopup.style.top = rect.top + "px";
                tipPopup.style.zIndex = "9999";
                document.body.appendChild(tipPopup);
            });
            element.addEventListener("mouseout", function () {
                document.body.removeChild(tipPopup);
            });
            element.addEventListener("click", function () {
                setClipboard(element.innerText).then(function (isSuccess) {
                    if (isSuccess) {
                        tipPopup.innerText = "复制成功";
                    } else {
                        tipPopup.innerText = "复制失败";
                    }
                }).catch(function (error) {
                    tipPopup.innerText = "复制失败";
                });
            });
        }
        const toF2 = function (value) {
            // 如果是整数，直接返回
            if (value === parseInt(value)) {
                return value;
            }
            value = value.toFixed(2);
            // 小数点后两位是 0 返回整数
            if (value.endsWith(".00")) {
                return parseInt(value);
            }
            return value;
        }
        const toInt = function (value) {
            return Math.round(value);
        }
        const covertPx = function (px, isY, isPortrait) {
            let scaleW = 1;
            let scaleH = 1;
            if (isPortrait) {
                if (isY) {
                    scaleH = status.targetResolution.width / status.resolution.height;
                    px = px * scaleH;
                } else {
                    scaleW = status.targetResolution.height / status.resolution.width;
                    px = px * scaleW;
                }
            } else {
                if (isY) {
                    scaleH = status.targetResolution.height / status.resolution.height;
                    px = px * scaleH;
                } else {
                    scaleW = status.targetResolution.width / status.resolution.width;
                    px = px * scaleW;
                }
            }
            switch (status.dpi) {
                case dpiDefines.vw:
                    return toInt(px / status.resolution.width * 100) + "vw";
                case dpiDefines.vh:
                    return toInt(px / status.resolution.height * 100) + "vh";
                case dpiDefines.vwvh:
                    if (isY) {
                        return toInt(px / status.resolution.height * 100) + "vh";
                    } else {
                        return toInt(px / status.resolution.width * 100) + "vw";
                    }
                case dpiDefines.autoDpi:
                    const screenDpi = getDpiByScreenSize(status.resolution.width, status.resolution.height);
                    if (isPortrait) {
                        // 竖屏
                        if (isY) {
                            const percent = px / status.resolution.height;
                            return toF2(percent * screenDpi.width) + "dp";
                        } else {
                            const percent = px / status.resolution.width;
                            return toF2(percent * screenDpi.height) + "dp";
                        }
                    } else {
                        // 横屏
                        if (isY) {
                            const percent = px / status.resolution.width
                            return toF2(percent * screenDpi.height) + "dp";
                        } else {
                            const percent = px / status.resolution.height;
                            return toF2(percent * screenDpi.width) + "dp";
                        }
                    }
                case dpiDefines.px:
                    return toInt(px) + "px";
                default:
                    const width = status.dpi;
                    const height = width * (status.resolution.height / status.resolution.width);
                    if (isPortrait) {
                        // 竖屏
                        if (isY) {
                            const percent = px / status.resolution.height;
                            return toF2(percent * width) + "dp";
                        } else {
                            const percent = px / status.resolution.width;
                            return toF2(percent * height) + "dp";
                        }
                    } else {
                        // 横屏
                        if (isY) {
                            const percent = px / status.resolution.width;
                            return toF2(percent * height) + "dp";
                        } else {
                            const percent = px / status.resolution.height;
                            return toF2(percent * width) + "dp";
                        }
                    }
            }
        }
        const convertPxElement = function (element) {
            const blocks = element.children;
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i].firstChild;
                const label = block.children[0].innerText;
                clickToCopy(block.children[1]);
                const value = block.children[1].innerText;
                switch (label) {
                    case "X":
                    case "W":
                        // todo portrait
                        const valeX = covertPx(parseFloat(value), false, false);
                        console.log("valeX", valeX);
                        block.children[1].innerHTML = block.children[1].innerHTML.replace(value, valeX);
                        clickToCopy(block.children[1]);
                        break
                    case "Y":
                    case "H":
                        // todo portrait
                        const valeY = covertPx(parseFloat(value), true, false);
                        console.log("valeY", valeY);
                        block.children[1].innerHTML = block.children[1].innerHTML.replace(value, valeY);
                        clickToCopy(block.children[1]);
                        break
                }
            }
        }
        const convertLayer = function (layer) {
            const cells = layer.children;
            for (let i = 1; i < cells.length; i++) {
                let values = cells[i].children;
                let label = values[0].innerText;
                switch (label) {
                    case "位置":
                    case "尺寸":
                        convertPxElement(values[1]);
                        break;
                }
            }
        }
        const convertInfos = function (infos) {
            for (let i = 0; i < infos.children.length; i++) {
                const info = infos.children[i];
                if (info.firstChild === null || info.firstChild.firstChild === null) {
                    continue;
                }
                const title = info.firstChild.firstChild;
                switch (title.innerText) {
                    case "图层":
                        convertLayer(info);
                        break;
                }
            }
        }
        const convertBlocks = function (element) {
            if (element.children.length < 1) {
                return;
            }
            const infos = element.children[0];
            convertInfos(infos);
            if (element.children.length < 2) {
                return;
            }
            const code = element.children[1];
        }
        let oldHtml = undefined;
        let oldElement = undefined;
        const loadResult = function (element) {
            if (element.innerHTML === oldHtml) {
                return;
            }
            oldHtml = element.innerHTML;
            resultContent.innerHTML = "";
            // 拷贝 element
            const copyElement = element.cloneNode(true);
            oldElement = element.cloneNode(true);
            resultContent.appendChild(copyElement);
            convertBlocks(copyElement);
        }
        const refreshBlock = function () {
            if (oldElement === undefined) {
                return;
            }
            resultContent.innerHTML = "";
            var copyElement = oldElement.cloneNode(true);
            resultContent.appendChild(copyElement);
            convertBlocks(copyElement);
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
        const updateTargetResolution = function (resolution) {
            inputTargetResolutionWidth.value = resolution.width;
            inputTargetResolutionHeight.value = resolution.height;
        };
        const updateDpi = function (dpi) {
            selectDpi.value = dpi;
        };
        statusChangeListeners.isOn.push(function (oldValue, newValue) {
            checkSwitch(newValue);
        });
        statusChangeListeners.resolution.push(function (oldValue, newValue) {
            updateResolution(newValue);
            refreshBlock();
        });
        statusChangeListeners.targetResolution.push(function (oldValue, newValue) {
            updateTargetResolution(newValue);
            refreshBlock();
        });
        statusChangeListeners.dpi.push(function (oldValue, newValue) {
            updateDpi(newValue);
            refreshBlock();
        });
        checkSwitch(status.isOn);
        updateResolution(status.resolution);
        updateTargetResolution(status.targetResolution);
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
        inputTargetResolutionWidth.addEventListener("change", function () {
            status.targetResolution.width = Number(inputTargetResolutionWidth.value);
            invokeStatusChangeListeners(statusNames.targetResolution, undefined, status.targetResolution);
        });
        inputTargetResolutionHeight.addEventListener("change", function () {
            status.targetResolution.height = Number(inputTargetResolutionHeight.value);
            invokeStatusChangeListeners(statusNames.targetResolution, undefined, status.targetResolution);
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
