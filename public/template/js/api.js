// 类型提示用（运行时不会引用）
/// <reference path="./index.d.ts" />
/// <reference path="./utils.js" />

/** 本地的IP地址+端口；端口跟后台设置的一致 */
const BASE_URL = location.host ? location.origin : "http://192.168.0.24:1995";

/** 用户缓存模块 */
const user = {
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
 * 基础请求
 * @param {"GET"|"POST"} method 
 * @param {string} url 请求接口
 * @param {string | object | FormData} data 请求数据 
 * @returns {Promise<ApiResult>}
 */
function request(method, url, data) {
  const userInfo = user.getInfo();
  return new Promise(function(resolve) {
    ajax({
      url: BASE_URL + url,
      method: method,
      data: data,
      headers: {
        "authorization": userInfo ? userInfo.token : "",
      },
      overtime: 5000,
      success(res) {
        // console.log("请求成功", res);
        if (res.code !== 1) {
          utils.showToast(res.message || "code 不为 1");
        }
        resolve(res);
      },
      fail(err) {
        // console.log("请求失败", err);
        let error = {
          code: -1,
          message: "接口报错",
          result: err
        };
        if (err.response.charAt(0) == "{") {
          error = JSON.parse(err.response);
        }
        utils.showToast(error.message || "接口报错");
        resolve(error);
      },
      timeout() {
        console.warn("XMLHttpRequest 请求超时 !!!");
        const error = {
          code: -1,
          message: "请求超时"
        }
        utils.showToast("请求超时");
        resolve(error);
      }
    });
  })
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
   * @param {string} city 城市名
   */
  getWeather(city) {
    return request("GET", "/getWeather", { city })
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
   * 上传图片
   * @param {FormData} formdata 
   */
  upload(formdata) {
    return request("POST", "/uploadImg", formdata);
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
    return request("POST", "/modifyList", data);
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
}

/** api模块 */
const api = new ModuleApi();




