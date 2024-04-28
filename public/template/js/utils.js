
const zIndex = (function(){
  let _zIndex = 1000;

  function useZIndex() {
    const val = _zIndex;
    _zIndex++;
    return val;
  }

  return {
    get message() {
      return useZIndex() + 20;
    },
    get dialog() {
      return useZIndex() + 10;
    }
  }
})();

/**
 * 
 * @param {object} params 
 * @param {number} params.duration 持续时间（毫秒），默认`3000`
 */
function useMessage(params = {}) {
  const doc = document;
  const cssModule = `__${Math.random().toString(36).slice(2, 7)}`;
  const className = {
    box: `msg-box${cssModule}`,
    hide: `hide${cssModule}`,
    text: `msg-text${cssModule}`,
    icon: `msg-icon${cssModule}`
  }
  const style = doc.createElement("style");
  style.textContent = `
  .${className.box}, .${className.icon}, .${className.text} {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
  .${className.box} {
    position: fixed;
    top: 0;
    left: 50%;
    display: flex;
    padding: 12px 16px;
    border-radius: 2px;
    background-color: #fff;
    box-shadow: 0 3px 3px -2px rgba(0,0,0,.2),0 3px 4px 0 rgba(0,0,0,.14),0 1px 8px 0 rgba(0,0,0,.12);
    white-space: nowrap;
    animation: ${className.box}-move .4s;
    transition: .4s all;
    transform: translate3d(-50%, 0%, 0);
    opacity: 1;
    overflow: hidden;
  }
  .${className.box}::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
  }
  @keyframes ${className.box}-move {
    0% {
      opacity: 0;
      transform: translate3d(-50%, -100%, 0);
    }
    100% {
      opacity: 1;
      transform: translate3d(-50%, 0%, 0);
    }
  }
  .${className.box}.${className.hide} {
    opacity: 0;
    /* transform: translate3d(-50%, -100%, 0); */
    transform: translate3d(-50%, -100%, 0) scale(0);
  }
  .${className.icon} {
    display: inline-block;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 6px;
    position: relative;
  }
  .${className.text} {
    font-size: 14px;
    line-height: 18px;
    color: #555;
  }
  .${className.icon}::after,
  .${className.icon}::before {
    position: absolute;
    content: "";
    background-color: #fff;
  }
  .${className.box}.info .${className.icon}, .${className.box}.info::after {
    background-color: #1890ff;
  }
  .${className.box}.success .${className.icon}, .${className.box}.success::after {
    background-color: #52c41a;
  }
  .${className.box}.warning .${className.icon}, .${className.box}.warning::after {
    background-color: #faad14;
  }
  .${className.box}.error .${className.icon}, .${className.box}.error::after {
    background-color: #ff4d4f;
  }
  .${className.box}.info .${className.icon}::after,
  .${className.box}.warning .${className.icon}::after {
    top: 15%;
    left: 50%;
    margin-left: -1px;
    width: 2px;
    height: 2px;
    border-radius: 50%;
  }
  .${className.box}.info .${className.icon}::before,
  .${className.box}.warning .${className.icon}::before {
    top: calc(15% + 4px);
    left: 50%;
    margin-left: -1px;
    width: 2px;
    height: 40%;
  }
  .${className.box}.error .${className.icon}::after, 
  .${className.box}.error .${className.icon}::before {
    top: 20%;
    left: 50%;
    width: 2px;
    height: 60%;
    margin-left: -1px;
    border-radius: 1px;
  }
  .${className.box}.error .${className.icon}::after {
    transform: rotate(-45deg);
  }
  .${className.box}.error .${className.icon}::before {
    transform: rotate(45deg);
  }
  .${className.box}.success .${className.icon}::after {
    box-sizing: content-box;
    background-color: transparent;
    border: 2px solid #fff;
    border-left: 0;
    border-top: 0;
    height: 50%;
    left: 35%;
    top: 13%;
    transform: rotate(45deg);
    width: 20%;
    transform-origin: center;
  }
  `.replace(/(\n|\t|\s)*/ig, "$1").replace(/\n|\t|\s(\{|\}|\,|\:|\;)/ig, "$1").replace(/(\{|\}|\,|\:|\;)\s/ig, "$1");
  doc.head.appendChild(style);
  /**
   * 消息队列
   * @type {Array<HTMLElement>}
   */
  const messageList = [];

  /**
   * 获取指定`item`的定位`top`
   * @param {HTMLElement=} el 
   */
  function getItemTop(el) {
    let top = 10;
    for (let i = 0; i < messageList.length; i++) {
      const item = messageList[i];
      if (el && el === item) {
        break;
      }
      top += item.clientHeight + 20;
    }
    return top;
  }

  /**
   * 删除指定列表项
   * @param {HTMLElement} el 
   */
  function removeItem(el) {
    for (let i = 0; i < messageList.length; i++) {
      const item = messageList[i];
      if (item === el) {
        messageList.splice(i, 1);
        break;
      }
    }
    el.classList.add(className.hide);
    messageList.forEach(function(item) {
      item.style.top = `${getItemTop(item)}px`;
    });
  }

  /**
   * 显示一条消息
   * @param {string} content 内容
   * @param {"info"|"success"|"warning"|"error"} type 消息类型
   * @param {number} duration 持续时间，优先级比默认值高
   */
  function show(content, type = "info", duration) {
    const el = doc.createElement("div");
    el.className = `${className.box} ${type}`;
    el.style.top = `${getItemTop()}px`;
    el.style.zIndex = zIndex.message;;
    el.innerHTML = `
    <span class="${className.icon}"></span>
    <span class="${className.text}">${content}</span>
    `;
    messageList.push(el);
    doc.body.appendChild(el);
    // 添加动画监听事件
    function animationEnd() {
      el.removeEventListener("animationend", animationEnd);
      setTimeout(removeItem, duration || params.duration || 3000, el);
    }
    el.addEventListener("animationend", animationEnd);
    function transitionEnd() {
      if (getComputedStyle(el).opacity !== "0") return;
      el.removeEventListener("transitionend", transitionEnd);
      el.remove();
    }
    el.addEventListener("transitionend", transitionEnd);
  }
  
  return {
    show,
    /**
     * 普通描述提示
     * @param {string} msg 
     */
    info(msg) {
      show(msg, "info");
    },
    /**
     * 成功提示
     * @param {string} msg 
     */
    success(msg) {
      show(msg, "success");
    },
    /**
     * 警告提示
     * @param {string} msg 
     */
    warning(msg) {
      show(msg, "warning");
    },
    /**
     * 错误提示
     * @param {string} msg 
     */
    error(msg) {
      show(msg, "error");
    }
  }
}

/**
 * 对话框控件
 */
function useDialog() {
  const doc = document;
  const cssModule = `__${Math.random().toString(36).slice(2, 7)}`;
  const className = {
    mask: `dialog-mask${cssModule}`,
    popup: `dialog-popup${cssModule}`,
    title: `dialog-title${cssModule}`,
    content: `dialog-content${cssModule}`,
    footer: `dialog-footer${cssModule}`,
    confirm: `confirm${cssModule}`,
    fade: `fade${cssModule}`,
    show: `show${cssModule}`,
    hide: `hide${cssModule}`
  }
  const cssText = `
  .${className.mask} {
    --time: .3s;
    --transition: .3s all;
    --black: #333;
    --text-color: #555;
    --confirm-bg: #2ec1cb;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
    animation: ${className.fade} var(--time);
  }
  .${className.mask} * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .${className.popup} {
    width: 74%;
    max-width: 375px;
    padding: 16px;
    border-radius: 10px;
    background-color: #fff;
    transition: var(--transition);
    animation: ${className.show} var(--time);
  }
  .${className.title} {
    font-size: 18px;
    color: var(--black);
    text-align: center;
  }
  .${className.content} {
    padding: 16px 0;
    font-size: 15px;
    color: var(--text-color);
    text-align: center;
  }
  .${className.footer} {
    width: 100%;
    padding-top: 8px;
    display: flex;
    justify-content: center;
  }
  .${className.footer} button {
    font-size: 15px;
    height: 40px;
    border-radius: 20px;
    padding: 0 20px;
    background-color: #f8f8f8;
    color: var(--black);
    line-height: 1;
    letter-spacing: 1px;
    margin: auto; border: none; outline: none;
    transition: .2s all;
  }
  .${className.footer} button:active {
    opacity: 0.8;
  }
  .${className.footer} .${className.confirm} {
    color: #fff;
    background-color: var(--confirm-bg);
  }
  @keyframes ${className.fade} {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes ${className.show} {
    0% { transform: translate3d(var(--x), var(--y), 0) scale(0); }
    100% { transform: translate3d(0, 0, 0) scale(1); }
  }
  .${className.mask}.${className.hide} {
    opacity: 0;
  }
  .${className.mask}.${className.hide} .${className.popup} {
    transform: translate3d(var(--x), var(--y), 0) scale(0);
  }
  `;
  const style = doc.createElement("style");
  style.textContent = cssText.replace(/(\n|\t|\s)*/ig, "$1").replace(/\n|\t|\s(\{|\}|\,|\:|\;)/ig, "$1").replace(/(\{|\}|\,|\:|\;)\s/ig, "$1");
  doc.head.appendChild(style);
  /** 点击记录坐标 */
  const clickSize = {
    x: "0vw",
    y: "0vh",
    time: 0
  }
  // 添加点击事件，并记录每次点击坐标
  doc.addEventListener("click", function(e) {
    const { innerWidth, innerHeight } = window;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    const pageY = e.clientY - centerY;
    const pageX = e.clientX - centerX;
    clickSize.x = `${pageX / innerWidth * 100}vw`;
    clickSize.y = `${pageY / innerHeight * 100}vh`;
    clickSize.time = Date.now();
  }, true);
  /**
   * 输出节点
   * @param {object} option
   * @param {string=} option.title 弹框标题，传`""`则不显示标题，默认为`"提示"`（可传html）
   * @param {string} option.content 提示内容（可传html）
   * @param {() => void=} option.confirm 确认回调
   * @param {string=} option.confirmText 确认按钮文字，默认为`"确认"`
   * @param {() => void=} option.cancel 取消回调
   * @param {string=} option.cancelText 取消按钮文字，不传则没有取消操作
   */
  function show(option) {
    const el = doc.createElement("section");
    el.className = className.mask;
    el.style.zIndex = zIndex.dialog;
    const isAsync = Date.now() - clickSize.time > 50;
    // 设置起始偏移位置
    el.style.setProperty("--x", isAsync ? "0vw" : clickSize.x);
    el.style.setProperty("--y", isAsync ? "0vh" : clickSize.y);
    // 设置完之后还原坐标位置
    clickSize.x = "0vw";
    clickSize.y = "0vh";
    const cancelBtn = option.cancelText ? `<button>${option.cancelText}</button>` : "";
    el.innerHTML = `
    <div class="${className.popup}">
      <h2 class="${className.title}">${ typeof option.title === "string" ? option.title : "提示"}</h2>
      <div class="${className.content}">${option.content}</div>
      <div class="${className.footer}">
        ${cancelBtn}
        <button class="${className.confirm}">${option.confirmText || "确认"}</button>
      </div>
    </div>
    `;
    doc.body.appendChild(el);
    el.addEventListener("transitionend", function(e) {
      e.target === el && el.classList.contains(className.hide) && el.remove();
    });
    function hide() {
      el.classList.add(className.hide);
    }
    if (option.cancelText) {
      el.querySelector(`.${className.footer} button`).onclick = function() {
        hide();
        option.cancel && option.cancel();
      }
    }
    el.querySelector(`.${className.confirm}`).onclick = function() {
      hide();
      option.confirm && option.confirm();
    }
  }

  return {
    show
  }
}

class ModuleUtils {
  constructor() {

  }

  /** 消息条控件 */
  message = useMessage();

  /** 对话框控件 */
  dialog = useDialog();

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
   * @template T
   * @param {T} target 检测的目标
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

/**
 * `XMLHttpRequest`请求 [MDN文档](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
 * @param {object} params 传参对象
 * @param {string} params.url 请求路径
 * @param {"GET"|"POST"|"PUT"|"DELETE"} params.method 请求方法
 * @param {object|FormData|string} params.data 传参对象，json、formdata、普通表单字符串
 * @param {{ [key: string]: string }} params.headers `XMLHttpRequest.header`设置对象
 * @param {number?} params.overtime 超时检测毫秒数
 * @param {(result?: any, response: XMLHttpRequest) => void} params.success 成功回调 
 * @param {(error?: XMLHttpRequest) => void} params.fail 失败回调 
 * @param {(info?: XMLHttpRequest) => void} params.timeout 超时回调
 * @param {(res?: ProgressEvent<XMLHttpRequestEventTarget>) => void} params.progress 进度回调（暂时没用到）
 * @param {"arraybuffer"|"blob"|"document"|"json"|"text"} params.responseType 响应结果类型，默认`json`
 */
function ajax(params) {
  const XHR = new XMLHttpRequest();
  /** 请求方法 */
  const method = params.method;
  /** 超时检测 */
  const overtime = utils.checkType(params.overtime) === "number" ? params.overtime : 0;
  /** 请求链接 */
  let url = params.url;
  /** 非`GET`请求传参 */
  let body = "";
  /** `GET`请求传参 */
  let query = "";
  /** 传参数据类型 */
  const dataType = utils.checkType(params.data);

  // 传参处理
  if (method === "GET") {
    // 解析对象传参
    if (dataType === "object") {
      for (const key in params.data) {
        query += "&" + key + "=" + params.data[key];
      }
    } else {
      console.warn("ajax 传参处理 GET 传参有误，需要的请求参数应为 object 类型");
    }
    if (query) {
      query = "?" + query.slice(1);
      url += query;
    }
  } else {
    body = dataType === "object" ? JSON.stringify(params.data) : params.data;
  }

  // 监听请求变化；XHR.status learn: http://tool.oschina.net/commons?type=5
  XHR.onreadystatechange = function () {
    if (XHR.readyState !== 4) return;
    if (XHR.status === 200 || XHR.status === 304) {
      typeof params.success === "function" && params.success(XHR.response, XHR);
    } else {
      typeof params.fail === "function" && params.fail(XHR);
    }
  }

  // 判断请求进度
  if (params.progress) {
    XHR.addEventListener("progress", params.progress);
  }
  
  XHR.responseType = params.responseType || "json"; // TODO: 设置响应结果为`json`这个一般由后台返回指定格式，前端无配置
  // XHR.withCredentials = true;	// 是否Access-Control应使用cookie或授权标头等凭据进行跨站点请求。
  XHR.open(method, url, true);

  // 设置对应的传参请求头，GET 方法不需要
  if (params.method !== "GET") {
    switch (dataType) {
      case "object":
        XHR.setRequestHeader("Content-Type", "application/json"); // `json`请求
        break;

      case "string":
        XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // 表单请求，非`new FormData`
        break;

      default:
        break;
    }
  }

  // 判断设置配置头信息
  if (params.headers) {
    for (const key in params.headers) {
      const value = params.headers[key];
      XHR.setRequestHeader(key, value);
    }
  }

  // 在IE中，超时属性只能在调用 open() 方法之后且在调用 send() 方法之前设置。
  if (overtime > 0) {
    XHR.timeout = overtime;
    XHR.ontimeout = function () {
      console.warn("XMLHttpRequest 请求超时 !!!");
      XHR.abort();
      typeof params.timeout === "function" && params.timeout(XHR);
    }
  }

  XHR.send(body);
}
