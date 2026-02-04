// 类型提示用（运行时不会引用）
/// <reference path="./index.d.ts" />
import { checkType, message } from "./utils.js";

/** 本地的IP地址+端口；端口跟后台设置的一致 */
const BASE_URL = location.host ? location.origin : "http://192.168.0.24:1995";

/** 用户缓存模块 */
export const user = {
  /**
   * 缓存用户数据
   * @param {object} data 
   */
  update(data) {
    sessionStorage.setItem("userInfo", JSON.stringify(data));
  },
  getInfo() {
    const value = sessionStorage.getItem("userInfo");
    if (value) {
      return JSON.parse(sessionStorage.getItem("userInfo"));
    }
    return undefined;
  },
  remove() {
    sessionStorage.removeItem("userInfo");
  }
}

/**
 * 基于`fetch`请求 [MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
 * @param {"GET"|"POST"|"PUT"|"DELETE"} method 请求方法
 * @param {string} url 请求路径
 * @param {object|FormData|string=} data 传参对象，json、formdata、普通表单字符串
 * @param {{ timeout?: number, responseType?: "arraybuffer"|"blob"|"document"|"json"|"text" }} option 其他配置
 * @returns {Promise<ApiResult>}
 */
function request(method, url, data = {}, option = {}) {
  const userInfo = user.getInfo();
  /** 非`GET`请求传参 */
  let body = undefined;
  /** `GET`请求传参 */
  let query = "";
  /** 默认请求头 */
  const headers = {
    "authorization": userInfo ? userInfo.token : "",
  };
  /** 超时毫秒 */
  const timeout = option.timeout || 8000;
  /** 传参数据类型 */
  const dataType = checkType(data);
  // 传参处理
  if (method === "GET") {
    // 解析对象传参
    if (dataType === "object") {
      for (const key in data) {
        query += "&" + key + "=" + data[key];
      }
    } else {
      console.warn("fetch 传参处理 GET 传参有误，需要的请求参数应为 object 类型");
    }
    if (query) {
      query = "?" + query.slice(1);
      url += query;
    }
  } else {
    body = dataType === "object" ? JSON.stringify(data) : data;
  }
  // 设置对应的传参请求头，GET 方法不需要
  if (method !== "GET") {
    switch (dataType) {
      case "object":
        headers["Content-Type"] = "application/json";
        break;

      case "string":
        headers["Content-Type"] = "application/x-www-form-urlencoded"; // 表单请求，`id=1&type=2` 非`new FormData()`
        break;

      default:
        break;
    }
  }
  const controller = new AbortController();
  let timer;
  return new Promise(function(resolve, reject) {
    /**
     * @type {ApiResult}
     */
    const result = {
      code: -1,
      data: null,
      msg: "" 
    }
    fetch(`${BASE_URL}/api${url}`, {
      method,
      body,
      headers,
      signal: controller.signal,
      ...option,
    }).then(response => {
      if (response.status !== 200) {
        result.code = response.status;
        switch (response.status) {
          case 404:
            result.msg = "请求的地址不存在！";
            break;

          case 500:
            // console.log(response);
            result.msg = response.statusText;
            break;

          default:
            break;
        }
        message.error(result.msg);
        resolve(result);
        return;
      }
      if (option.responseType === "blob") {
        return response.blob();
      }
      // 默认响应的信息转为`json`
      return response.json();
    }).then(res => {
      clearTimeout(timer);
      if (option.responseType === "blob") {
        result.code = 1;
        result.data = res;
        resolve(result);
      } else {
        if (res.code === 1) {
          result.code = 1;
          result.data = res.data;
          result.msg = res.message || "ok";
        } else {
          message.error(res.message);
        }
        resolve(result);
      }
    }).catch(error => {
      clearTimeout(timer);
      if (result.code === -1) {
        result.msg = `${error}`;
      }
      resolve(result);
    });
    timer = setTimeout(function() {
      result.msg = "fetch is timeout";
      resolve(result);
      controller.abort();
      message.warning("网络响应超时~");
    }, timeout);
  });
}

class ModuleApi {
  /**
   * 测试`get`请求
   * @param {string|number} id 
   */
  testGet(id = 12) {
    return request("GET", "/getData", {
      id
    });
  }

  /**
   * 测试`post`请求
   * @param {{ name: string, age: string }} data 
   */
  testPost(data) {
    return request("POST", "/postData", data);
  }

  /**
   * 获取天气信息
   * @param {string} cityCode 城市`adcode`，[城市编码表](https://lbs.amap.com/api/webservice/download)
   */
  getWeather(cityCode) {
    return request("GET", "/getWeather", { cityCode })
  }

  /**
   * 登录
   * @param {object} info 注册传参
   * @param {string} info.account 账户
   * @param {string} info.password 密码 
   */
  login(info) {
    return request("POST", "/login", info);
  }

  /**
   * 退出登录
   */
  logout() {
    return request("GET", "/logout", {});
  }

  /**
   * 注册
   * @param {object} info 注册传参
   * @param {string} info.account 账户
   * @param {string} info.password 密码 
   * @param {string} info.name 用户名 
   */
  register(info) {
    return request("POST", "/register", info);
  }

  /**
   * 上传文件
   * @param {FormData} formData 
   * @param {(event: ProgressEvent<XMLHttpRequestEventTarget>) => void} progress
   * @returns {Promise<ApiResult>}
   */
  upload(formData, progress) {
    // return request("POST", "/uploadFile", formData);
    /**
     * @type {ApiResult}
     */
    const result = {
      code: -1,
      data: null,
      msg: "" 
    }
    return new Promise(function(resolve) {
      const XHR = new XMLHttpRequest();
      XHR.onreadystatechange = function () {
        if (XHR.readyState !== 4) return;
        if (XHR.status === 200 || XHR.status === 304) {
          const res = JSON.parse(XHR.response);
          result.data = res.data;
          result.code = 1;
          resolve(result);
        } else {
          try {
            const res = JSON.parse(XHR.response);
            result.msg = res.message;
          } catch (error) {
            console.warn(error);
          }
          message.error(result.msg);
          resolve(result);
        }
      }
      progress && XHR.upload.addEventListener("progress", progress);
      XHR.open("POST", `${BASE_URL}/api/uploadFile`, true);
      XHR.send(formData);
    })
  }

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return request("GET", "/getUserInfo", {});
  }

  /**
   * 获取todo列表数据
   */
  getTodoList() {
    return request("GET", "/getList", {});
  }

  /**
   * 修改todo列表item
   * @param {{ content: string, id: string|number }} data
   */
  modifyListItem(data) {
    return request("POST", "/editList", data);
  }

  /**
   * 删除一条列表
   * @param {string} id
   */
  deleteListItem(id) {
    return request("POST", "/deleteList", {
      id
    });
  }

  /**
   * 添加一条列表
   * @param {string} value
   */
  addListItem(value) {
    return request("POST", "/addList", {
      content: value
    });
  }

  /**
   * 
   * @param {"video"|"excel"} type 
   * @returns 
   */
  getFile(type) {
    return request("GET", type === "video" ? "/getVideo" : "/getExcel", {}, {
      responseType: "blob"
    })
  }
}

/** api模块 */
export const api = new ModuleApi();



