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

/**
 * 本地储存数据
 * @param key 对应的 key 值
 * @param data 对应的数据
 */
declare function saveData(key: string, data: object): void

/**
 * 获取本地数据
 * @param key 对应的 key 值
 */
declare function fetchData(key: string): object | null