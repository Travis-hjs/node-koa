import * as Koa from "koa"; 

/** 接口返回数据 */
export interface ApiResult {
    /** 状态提示 */
    message: string
    /** 状态码 */
    code: number
    /** 返回数据 */
    result: any
}

/** 失败返回提示数据 */
export interface ResultFail {
    /** 状态错误提示 */
    message: string
    /** 状态错误码 */
    code: number
    /** 返回数据 */
    result: any
}

/** 用户信息类型 */
export interface UserInfoType {
    /** 账号 */
    account: string
    /** 密码 */
    password: string
    /** 用户名 */
    name?: string
    /** 在线时间（毫秒） */
    online?: number
    /** 请求域名 */
    host?: string
    /** token */
    token?: string
    /** 用户id */
    id?: number
}

/** 用户 token 纪录类型 */
export interface UserRecordType {
    /** token 信息对象 */
    [key: string]: UserInfoType
}

/** session返回结果类型 */
export interface SessionResultType {
    /** token 状态描述 */
    message: string
    /** token 是否可用 */
    success: boolean
    /** koken 信息 */
    info: UserInfoType
}

/** JavaScript类型 */
export type JavaScriptTypes = "string" | "number" | "array" | "object" | "function" | "null" | "undefined";

/** 运算符号 */
export type NumberSymbols = "+" | "-"| "*" | "/";

/** 自定义的请求上下文返回信息接口 */
export interface TheContext extends Koa.ParameterizedContext {
    /** 请求时自定义设置的一个状态 (see)[src/module/Session.ts] */
    theState?: SessionResultType
}

/** 上传文件类型 */
export interface UploadFile {
    size: number;
    path: string;
    name: string;
    type: string;
    lastModifiedDate?: Date;
    hash?: string;
    toJSON(): Object;
}

/** 服务端请求响应结果 */
export interface ServeRequestResult {
    /** 状态标记 `state === 1`时为成功 */
    state: number
    /** 状态描述信息 */
    msg: string
    /** 结果对象 */
    result: any
}