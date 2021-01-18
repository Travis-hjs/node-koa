// 类型提示用（运行时不会引用）
/// <reference path="./index.d.ts" />
/// <reference path="./utils.js" />

/** 本地的IP地址+端口；端口跟后台设置的一致 */
const BASE_URL = location.host ? location.origin : "http://192.168.89.177:1995";

const cache = window.sessionStorage;

/**
 * 本地储存用户数据
 * @param {object} data 对应的数据
 */
function saveUserInfo(data) {
    cache.setItem("userInfo", JSON.stringify(data));
}

/**
 * 获取用户数据
 */
function fetchUserInfo() {
    let data = cache.getItem("userInfo") ? JSON.parse(cache.getItem("userInfo")) : null;
    return data;
}

/**
 * `XMLHttpRequest`请求 [MDN文档](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
 * @param {object} param 传参对象
 * @param {string} param.url 请求路径
 * @param {"GET"|"POST"|"PUT"|"DELETE"} param.method 请求方法
 * @param {object?} param.data 传参对象
 * @param {FormData?} param.file 上传图片`FormData`对象
 * @param {number?} param.overtime 超时检测毫秒数
 * @param {(result?: any) => void} param.success 成功回调 
 * @param {(error?: XMLHttpRequest) => void} param.fail 失败回调 
 * @param {(info?: XMLHttpRequest) => void} param.timeout 超时回调
 * @param {(res?: ProgressEvent<XMLHttpRequestEventTarget>) => void} param.progress 进度回调 貌似没什么用 
 */
function ajax(param) {
    if (typeof param !== "object") return console.error("ajax 缺少请求传参");
    if (!param.method) return console.error("ajax 缺少请求类型 GET 或者 POST");
    if (!param.url) return console.error("ajax 缺少请求 url");
    if (typeof param.data !== "object") return console.error("请求参数类型必须为 object");

    /** XMLHttpRequest */
    const XHR = new XMLHttpRequest();
    /** 请求方法 */
    const method = param.method;
    /** 超时检测 */
    const overtime = typeof param.overtime === "number" ? param.overtime : 0;
    /** 请求链接 */
    let url = param.url;
    /** 非`GET`请求传参 */
    let payload = null;
    /** GET请求传参 */
    let query = "";

    // 传参处理
    if (method === "GET") {
        // 解析对象传参
        for (const key in param.data) {
            query += "&" + key + "=" + param.data[key];
        }
        if (query) {
            query = "?" + query.slice(1);
            url += query;
        }
    } else {
        // 若后台没设置接收 JSON 则不行 需要跟 GET 一样的解析对象传参
        payload = JSON.stringify(param.data);
    }

    // 监听请求变化
    // XHR.status learn: http://tool.oschina.net/commons?type=5
    XHR.onreadystatechange = function () {
        if (XHR.readyState !== 4) return;
        if (XHR.status === 200 || XHR.status === 304) {
            typeof param.success === "function" && param.success(JSON.parse(XHR.response));
        } else {
            typeof param.fail === "function" && param.fail(XHR);
        }
    }

    // 判断请求进度
    if (param.progress) {
        XHR.addEventListener("progress", param.progress, false);
    }

    // XHR.responseType = "json";
    // 是否Access-Control应使用cookie或授权标头等凭据进行跨站点请求。
    // XHR.withCredentials = true;	
    XHR.open(method, url, true);

    // 判断是否上传文件通常用于上传图片，上传图片时不需要设置头信息
    if (param.file) {
        payload = param.file;
    } else {
        /**
         * @example 
         * XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
         * XHR.setRequestHeader("Content-Type", "application/json")
         */
        XHR.setRequestHeader("Content-Type", "application/json");
        // 设置token
        const token = fetchUserInfo() ? fetchUserInfo().token : "";
        XHR.setRequestHeader("Authorization", token);
    }

    // 在IE中，超时属性只能在调用 open() 方法之后且在调用 send() 方法之前设置。
    if (overtime > 0) {
        XHR.timeout = overtime;
        XHR.ontimeout = function () {
            console.warn("XMLHttpRequest 请求超时 !!!");
            XHR.abort();
            typeof param.timeout === "function" && param.timeout(XHR);
        }
    }

    XHR.send(payload);
}

/**
 * 基础请求
 * @param {"GET"|"POST"} method post | get
 * @param {string} url 请求接口
 * @param {object} data 请求数据 
 * @param {successFn} success 成功回调
 * @param {failFn} fail 失败回调
 * @param {FormData} upload 上传图片 FormData
 */
function baseRequest(method, url, data, success, fail, upload) {
    ajax({
        url: BASE_URL + url,
        method: method,
        data: data,
        file: upload,
        overtime: 5000,
        success(res) {
            // console.log("请求成功", res);
            if (res.code == 200) {
                if (typeof success === "function") success(res);
            } else {
                if (typeof fail === "function") fail(res);
                utils.showToast(res.message || "code 不为200");
            }
        },
        fail(err) {
            // console.log("请求失败", err);
            /** 返回错误消息 */
            let error = {
                message: "接口报错"
            };
            if (err.response.charAt(0) == "{") {
                error = JSON.parse(err.response);
            }
            if (typeof fail === "function") fail(error);
            utils.showToast(error.message || "接口报错");
        },
        timeout() {
            console.warn("XMLHttpRequest 请求超时 !!!");
            let error = {
                message: "请求超时"
            }
            if (typeof fail === "function") fail(error);
            utils.showToast("请求超时");
        }
    });
}

class ModuleApi {
    /**
     * 测试`get`请求
     * @param {string|number} id 
     * @param {successFn} success 
     * @param {failFn} fail 
     */
    testGet(id = 12, success, fail) {
        baseRequest("GET", "/getData", {
            id
        }, success, fail);
    }

    /**
     * 测试`post`请求
     * @param {{ name: string, age: string }} data 
     * @param {successFn} success 
     * @param {failFn} fail 
     */
    testPost(data, success, fail) {
        baseRequest("POST", "/postData", data, success, fail);
    }

    /**
     * 获取天气信息
     * @param {string} city 城市名
     * @param {successFn} success 
     * @param {failFn} fail 
     */
    getWeather(city,  success, fail) {
        baseRequest("GET", "/getWeather", { city }, success, fail)
    }

    /**
     * 登录
     * @param {object} info 注册传参
     * @param {string} info.account 账户
     * @param {string} info.password 密码 
     * @param {successFn} success
     * @param {failFn} fail
     */
    login(info, success, fail) {
        baseRequest("POST", "/login", info, res => {
            if (res.code == 200) {
                if (typeof success === "function") success(res);
            } else {
                if (typeof fail === "function") fail(res);
            }
        }, fail);
    }

    /**
     * 获取用户信息
     * @param {successFn} success 
     * @param {failFn} fail 
     */
    logout(success, fail) {
        baseRequest("GET", "/logout", {}, success, fail);
    }

    /**
     * 注册
     * @param {object} info 注册传参
     * @param {string} info.account 账户
     * @param {string} info.password 密码 
     * @param {string} info.name 用户名 
     * @param {successFn} success
     * @param {failFn} fail
     */
    register(info, success, fail) {
        baseRequest("POST", "/register", info, res => {
            if (res.code == 200) {
                if (typeof success === "function") success(res);
            } else {
                if (typeof fail === "function") fail(res);
            }
        }, fail);
    }

    /**
     * 上传图片
     * @param {FormData} formdata 
     * @param {successFn} success 
     * @param {failFn} fail 
     */
    upload(formdata, success, fail) {
        baseRequest("POST", "/uploadImg", {}, success, fail, formdata);
    }

    /**
     * 获取用户信息
     * @param {successFn} success 
     * @param {failFn} fail 
     */
    getUserInfo(success, fail) {
        baseRequest("GET", "/getUserInfo", {}, success, fail);
    }

    /**
     * 获取todo列表数据
     * @param {successFn} success 
     * @param {failFn} fail 
     */
    getTodoList(success, fail) {
        baseRequest("GET", "/getList", {}, success, fail);
    }
    
    /**
     * 修改todo列表item
     * @param {{ content: string, id: string|number }} data
     * @param {successFn} success 
     * @param {failFn} fail 
     */
    modifyListItem(data, success, fail) {
        baseRequest("POST", "/modifyList", data, success, fail);
    }

    /**
     * 删除一条列表
     * @param {string} id
     * @param {successFn} success 
     * @param {failFn} fail 
     */
    deleteListItem(id, success, fail) {
        baseRequest("POST", "/deleteList", {
            id
        }, success, fail);
    }

    /**
     * 添加一条列表
     * @param {string} value
     * @param {successFn} success 
     * @param {failFn} fail 
     */
    addListItem(value, success, fail) {
        baseRequest("POST", "/addList", {
            content: value
        }, success, fail);
    }
}

/** api模块 */
const api = new ModuleApi();




