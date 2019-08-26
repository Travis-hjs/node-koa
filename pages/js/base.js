/**
 * XMLHttpRequest 请求 
 * learn: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 * @param {object} param 传参对象
 * @param {string} param.url 请求路径
 * @param {'GET'|'POST'} param.method 请求方法 => 这里我只枚举了常用的两种
 * @param {object} param.data 传参对象
 * @param {FromData} param.file 上传图片 FromData
 * @param {Function} param.success 成功回调 
 * @param {Function} param.fail 失败回调 
 * @param {number} param.overtime 超时检测毫秒数
 * @param {Function} param.timeout 超时回调
 * @param {Function} param.progress 进度回调 貌似没什么用 
 */
function ajax(param) {
    if (typeof param !== 'object') return console.error('ajax 缺少请求传参');
    if (!param.method) return console.error('ajax 缺少请求类型 GET 或者 POST');
    if (!param.url) return console.error('ajax 缺少请求 url');
    if (typeof param.data !== 'object') return console.error('请求参数类型必须为 object');

    /** XMLHttpRequest */
    var XHR = new XMLHttpRequest();
    /** 请求方法 */
    var method = param.method.toUpperCase();
    /** 请求链接 */
    var url = param.url;
    /** 请求数据 */
    var data = null;
    /** 超时检测 */
    var overtime = typeof param.overtime === 'number' ? param.overtime : 0;

    // 传参处理
    switch (method) {
        case 'POST':
            data = JSON.stringify(param.data);
            break;

        case 'GET':
            // 判断是否一个空对象
            if (JSON.stringify(param.data) != '{}') {
                // 解析对象传参
                var send_data = '';
                for (var key in param.data) send_data += '&' + key + '=' + param.data[key];
                send_data = '?' + send_data.slice(1);
                url += send_data;
            }
            break;
    }

    // 监听请求变化
    // XHR.status learn: http://tool.oschina.net/commons?type=5
    XHR.onreadystatechange = function () {
        if (XHR.readyState !== 4) return;
        if (XHR.status === 200 || XHR.status === 304) {
            if (typeof param.success === 'function') param.success(JSON.parse(XHR.response));
        } else {
            if (typeof param.fail === 'function') param.fail(XHR);
        }
    }

    // 判断请求进度
    if (param.progress) {
        XHR.addEventListener('progress', param.progress, false);
    }

    // XHR.responseType = 'json';
    // 是否Access-Control应使用cookie或授权标头等凭据进行跨站点请求。
    // XHR.withCredentials = true;	
    XHR.open(method, url, true);

    // 判断是否上传文件通常用于上传图片
    if (param.file) {
        data = param.file;
    } else {
        // XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XHR.setRequestHeader('Content-Type', 'application/json'); 
        // 设置token
        var token = fetchUserInfo() ? fetchUserInfo().token : '';
        XHR.setRequestHeader('Authorization', token);
    }
    
    // 在IE中，超时属性只能在调用 open() 方法之后且在调用 send() 方法之前设置。
    if (overtime > 0) {
        XHR.timeout = overtime;
        XHR.ontimeout = function () {
            console.warn('ajax 请求超时 !!!');
            XHR.abort();
            if (typeof param.timeout === 'function') param.timeout(XHR);
        }
    }

    XHR.send(data);
}

const BASE_URL = 'http://10.0.18.116:1995';

/**
 * 基础请求
 * @param {'GET'|'POST'} method post | get
 * @param {string} url 请求接口
 * @param {object} data 请求数据 
 * @param {Function} success 成功回调
 * @param {Function} fail 失败回调
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
            // console.log('请求成功', res);
            if (res.code == 200) {
                if (typeof success === 'function') success(res);
            } else {
                if (typeof fail === 'function') fail(res);
            }
        },
        fail(err) {
            // console.log('请求失败', err);
            /** 返回错误消息 */
            let error = {
                message: '接口报错'
            };
            if (err.response.charAt(0) == '{') {
                error = JSON.parse(err.response);
            }
            if (typeof fail === 'function') fail(error);
        },
        timeout() {
            console.warn('XMLHttpRequest 请求超时 !!!');
            let error = {
                message: '请求超时'
            }
            if (typeof fail === 'function') fail(error);
        }
    });
}

const cache = window.sessionStorage;

/**
 * 本地储存用户数据
 * @param {object} data 对应的数据
 */
function saveUserInfo(data) {
    cache.setItem('userInfo', JSON.stringify(data));
}

/**
 * 获取用户数据
 */
function fetchUserInfo() {
    let data = cache.getItem('userInfo') ? JSON.parse(cache.getItem('userInfo')) : null;
    return data;
}