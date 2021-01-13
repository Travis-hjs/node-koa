
function theToast() {
    const styleId = "the_toast_style";
    function outputStyle() {
        const cssText = `
        .the_toast{ 
            position: fixed; 
            z-index: 999; 
            bottom: 20%; 
            left: 0; 
            text-align: center; 
            width: 100%; 
        }
        .the_toast_text{ 
            padding: 6px 15px; 
            box-sizing: border-box;
            max-width: 300px; 
            font-size: 14px; 
            color: #fff; 
            text-align: center; 
            border-radius: 2px; 
            background-color: rgba(0,0,0,0.45); 
            display: inline-block; 
            line-height: 26px; 
            animation: showToast 0.26s ease; 
            transition: 0.26s all;
        }
        @keyframes showToast {
            0% { opacity: 0; transform: translateY(100px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .the_toast_text_hide{ 
            opacity: 0; 
            transform: translateY(-80px); 
        }`;
        const styleLabel = document.createElement("style");
        styleLabel.textContent = cssText.replace(/(\n|\t|\s)*/ig, "$1").replace(/\n|\t|\s(\{|\}|\,|\:|\;)/ig, "$1").replace(/(\{|\}|\,|\:|\;)\s/ig, "$1");
        // console.log(cssText, styleLabel.textContent);
        styleLabel.id = styleId;
        document.head.appendChild(styleLabel);
    }

    /** 创建节点 */
    function createToast() {
        const node = document.createElement("div");
        const nodeText = document.createElement("div");
        node.className = "the_toast";
        nodeText.className = "the_toast_text";
        function removeToast() {
            nodeText.removeEventListener("transitionend", removeToast);
            node.parentNode.removeChild(node);
        }
        nodeText.addEventListener("transitionend", removeToast);
        node.appendChild(nodeText);
        return {
            node,
            nodeText
        }
    }

    if (!document.getElementById(styleId)) {
        outputStyle();
    }

    return {
        /**
         * 显示提示条
         * @param {string} value 内容
         * @param {number} duration 提示的时间 
         */
        showToast(value, duration = 1000) {
            const toast = createToast();
            toast.nodeText.textContent = value;
            toast.nodeText.addEventListener("animationend", function () {
                setTimeout(function () {
                    toast.nodeText.classList.add("the_toast_text_hide");
                }, duration);
            });
            document.body.appendChild(toast.node);
        }
    }
}

class ModuleUtils {
    constructor() {

        const toast = theToast();

        /** 显示提示条 */
        this.showToast = toast.showToast;
    }

    /**
     * 查到单个元素
     * @param {string} name 
     * @returns {HTMLElement}
     */
    find(name) {
        return document.querySelector(name);
    }

    /**
     * 多个元素查找
     * @param {string} name class | id | label <div> <p>
     * @returns {Array<HTMLElement>}
     */
    findAll(name) {
        let nodes = document.querySelectorAll(name);
        if (Array.from) {
            nodes = Array.from(nodes);
        } else {
            nodes = [].slice.call(nodes);
        }
        return nodes;
    }

    /**
     * 显示提示框
     * @param {object} options 传参信息
     * @param {string} options.title 标题内容
     * @param {string} options.content 提示内容
     * @param {string} options.confirmText 确认文字
     * @param {() => void} options.callback 点击回调
     */
    showAlert(options) {
        const componentName = ".alert_component";
        /** 
         * 组件节点 
         * @type {HTMLElement}
        */
        let alertBox = document.querySelector(componentName);
        if (!alertBox) {
            const time = `0.3s`;
            const cssText = `
            ${componentName} { 
                position: fixed; 
                top: 0; 
                left: 0; 
                z-index: 999; 
                width: 100%; 
                height: 100vh; 
                display: flex; 
                background-color: rgba(0,0,0,0.45); 
                z-index: 99; transition: ${time} all; 
                animation: showAlert ${time} ease;
            }
            .alert_box{ 
                width: 80%; 
                max-width: 375px; 
                margin: auto; 
                background-color: #fff; 
                border-radius: 2px;
                overflow: hidden;
                text-align: center; 
                box-shadow: 1px 1px 40px rgba(0,0,0,.25); 
                transition: ${time} all; 
                animation: showAlertContent ${time} ease;
            }
            .alert_content{ 
                padding: 0 10px 16px; 
                box-sizing: border-box;
                font-size: 16px; 
                color: #333; 
            }
            .alert_title{ 
                text-align: center; 
                font-size: 18px; 
                font-weight: 500;
                color: #333; 
                line-height: 44px; 
                padding-top: 4px;
                box-sizing: border-box;
            }
            .alert_btn{ 
                width: 100%; 
                background-color: #eee; 
                height: 48px; 
                color: #1BBC9B; 
                font-size: 15px; 
                border: none; 
                outline: none; 
                line-height: 1; 
                cursor: pointer; 
            }
            .alert_hide{ 
                visibility: hidden; 
                opacity: 0; 
            }
            .alert_hide .alert_box{ 
                transform: translateY(80px); 
            }
            @keyframes showAlert {
                0%{ opacity: 0;  }
                100%{ opacity: 1;  }
            }
            @keyframes showAlertContent {
                0%{ transform: translateY(80px); }
                100%{ transform: translateY(0px); }
            }
            `;
            const template = `
            <div class="alert_box">
                <div class="alert_title"></div>
                <div class="alert_content"></div>
                <button class="alert_btn"></button>
            </div>
            `
            const style = document.createElement("style");
            style.textContent = cssText.replace(/(\n|\t|\s)*/ig, "$1").replace(/\n|\t|\s(\{|\}|\,|\:|\;)/ig, "$1").replace(/(\{|\}|\,|\:|\;)\s/ig, "$1");
            document.head.appendChild(style);
            // ====================== 创建节点 ======================
            alertBox = document.createElement("div");
            alertBox.className = componentName.slice(1);
            alertBox.innerHTML = template;
            document.body.appendChild(alertBox);
        }
        // ====================== 显示并设置内容 ======================
        alertBox.classList.remove("alert_hide");
        const box = alertBox.children[0];
        box.children[0].innerHTML = options.title || "提示";
        box.children[1].innerHTML = options.content || "未设置内容";
        box.children[2].innerHTML = options.confirmText || "确定";
        // ====================== 重置点击事件 ======================
        box.children[2].onclick = function () {
            alertBox.classList.add("alert_hide");
            typeof options.callback === "function" && options.callback();
        }
    }

    /**
     * 复制文本
     * @param {string} text 复制的内容
     * @param {() => void} success 成功回调
     * @param {(error: string) => void} fail 出错回调
     */
    copyText(text, success = null, fail = null) {
        text = text.replace(/(^\s*)|(\s*$)/g, "");
        if (!text) {
            typeof fail === "function" && fail("复制的内容不能为空！");
            return;
        }
        const id = "the-clipboard";
        /**
         * 粘贴板节点
         * @type {HTMLTextAreaElement}
         */
        let clipboard = document.getElementById(id);
        if (!clipboard) {
            clipboard = document.createElement("textarea");
            clipboard.id = id;
            clipboard.style.cssText = "font-size: 15px; position: fixed; top: -1000%; left: -1000%;";
            document.body.appendChild(clipboard);
        }
        clipboard.value = text;
        clipboard.select();
        clipboard.setSelectionRange(0, clipboard.value.length);
        document.execCommand("copy");
        clipboard.blur();
        typeof success === "function" && success();
    }

    /**
     * 检测类型
     * @param {any} target 检测的目标
     * @returns {"string"|"number"|"array"|"object"|"function"|"null"|"undefined"} 只枚举一些常用的类型
     */
    checkType(target) {
        /** @type {string} */
        const value = Object.prototype.toString.call(target);
        const result = value.match(/\[object (\S*)\]/)[1];
        return result.toLocaleLowerCase();
    }
}

/** 工具类 */
const utils = new ModuleUtils;