/**
 * 查到单个元素
 * @param {string} name 
 * @returns {HTMLElement}
 */
export function find(name) {
    return document.querySelector(name);
}

/**
 * 多个元素查找
 * @param {string} name class | id | label <div> <p>
 * @returns {Array<HTMLElement>}
 */
export function findAll(name) {
    let nodes = document.querySelectorAll(name);
    if (Array.from) {
        nodes = Array.from(nodes);
    } else {
        nodes = [].slice.call(nodes);
    }
    return nodes;
}

/**
 * 设置提示框
 * @param {string} content 内容
 * @param {string} confirmText 确认文字
 * @param {Function} callback 点击回调
 */
export function showAlert(content, confirmText, callback) {
    /** 弹框id */
    const alertId = 'the-alert';
    /** 弹框子节点变量名 */
    const nodes = ['_box', '_content_box', '_confirm_box'];
    /** 弹出层整体 */
    let alertBox = document.getElementById(alertId);
    if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.id = alertId;
        alertBox[nodes[0]] = document.createElement('div');
        alertBox[nodes[1]] = document.createElement('div');
        alertBox[nodes[2]] = document.createElement('div');

        alertBox.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 999; width: 100%; height: 100vh; background-color: rgba(0,0,0,0.45)';
        alertBox[nodes[0]].style.cssText = 'width: 84%; max-width: 375px; margin: auto; background-color: #fafafc; text-align: center; border-radius: 3px; font-family: arial; animation: alertMove 0.25s ease; box-shadow: 1px 1px 40px rgba(0,0,0,.25);';
        alertBox[nodes[1]].style.cssText = 'padding: 20px 20px 30px; font-size: 16px; color: #000; word-wrap: break-word; word-break: break-all';
        alertBox[nodes[2]].style.cssText = 'width: 100%; height: 50px; padding-bottom: 1px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; color: #1BBC9B; font-size: 16px; border-top: solid 1px #dadada; cursor: pointer;';

        alertBox[nodes[0]].appendChild(alertBox[nodes[1]]);
        alertBox[nodes[0]].appendChild(alertBox[nodes[2]]);
        alertBox.appendChild(alertBox[nodes[0]]);
        document.body.appendChild(alertBox);
    }
    alertBox.style.display = 'flex';
    alertBox[nodes[1]].innerHTML = content;
    alertBox[nodes[2]].innerHTML = confirmText || '确定';
    alertBox[nodes[2]].onclick = function () {
        alertBox.style.display = 'none';
        if (typeof callback === 'function') {
            callback();
        }
    }
}

/**
 * 复制文本
 * @param {string} text 复制的内容
 * @param {() => void} success 成功回调
 * @param {(error: string) => void} fail 出错回调
 */
export function copyText(text, success = null, fail = null) {
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
export function checkType(target) {
    /** @type {string} */
    const value = Object.prototype.toString.call(target);
    const result = value.match(/\[object (\S*)\]/)[1];
    return result.toLocaleLowerCase();
}

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
            toast.nodeText.addEventListener("animationend", function() {
                setTimeout(function() {
                    toast.nodeText.classList.add("the_toast_text_hide");
                }, duration);
            });
            document.body.appendChild(toast.node);
        }
    }
}

export const toast = theToast();