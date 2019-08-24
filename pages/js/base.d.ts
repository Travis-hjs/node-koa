/**
 * XMLHttpRequest 请求 
 * @param params 传参信息
 */
declare function ajax(params: {
    /** 请求路径 */
    url: string
    /** 请求方法 */
    method: 'GET' | 'POST'
    /** 传参对象 */
    data: object
    /** 上传文件 */
    file?: FormData
    /** 成功回调 */
    success?: Function
    /** 失败回调 */
    fail?: Function
    /** 超时检测毫秒数 */
    overtime?: number
    /** 超时回调 */
    timeout?: Function
    /** 进度回调 貌似没什么用 */
    progress?: Function
}): void 

/**
 * 基础请求
 * @param method 请求方法
 * @param url 请求接口
 * @param data 请求数据
 * @param success 成功回调
 * @param fail 失败回调
 * @param upload 上传图片
 */
declare function baseRequest(method: 'GET'|'POST', url: string, data: object, success?: Function, fail?: Function, upload?: FormData): void

interface userInfo {
    /** 账号 */
    account: string
    /** 密码 */
    password: string
    /** 用户名 */
    name: string
    /** token */
    token: string
}

/**
 * 本地储存用户数据
 * @param data 对应的数据
 */
declare function saveUserInfo(data: userInfo): void

/**
 * 获取用户数据
 */
declare function fetchUserInfo(): userInfo | null