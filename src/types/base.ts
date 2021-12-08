import * as Koa from "koa"; 
import { TableUserInfo } from "user";

/** 接口返回数据 */
export interface ApiResult<T> {
    /** 状态提示 */
    message: string
    /** 状态码 */
    code: number
    /** 返回数据 */
    result: T
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
    /** 登录时`token` */
    token?: string
    /** 用户id */
    id?: number
}

/** 用户`token`纪录类型 */
export interface UserRecordType {
    /** `token`信息对象 */
    [key: string]: UserInfoType
}

/** `token`返回结果类型 */
export interface JwtResultType {
    /** `token`状态描述 */
    message: string
    /** `token`是否可用 */
    success: boolean
    /** `token`信息 */
    info: UserInfoType
}

/** JavaScript类型 */
export type JavaScriptTypes = "string" | "number" | "array" | "object" | "function" | "null" | "undefined" | "regexp";

/** 运算符号 */
export type NumberSymbols = "+" | "-"| "*" | "/";

/** 自定义的请求上下文返回信息接口 */
export interface TheContext extends Koa.ParameterizedContext {
    /**
     * 请求时自定义设置的一个`token`信息
     * @description 具体看: src/module/Jwt.ts
     */
    theToken?: TableUserInfo
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

/** `mysql`数据操作类型 */
export interface MysqlOption {
    /** 创建时间 */
    createTime: string
    /** 创建用户`id` */
    createUserId: number
    /** 更新时间 */
    updateTime: string
    /** 更新用户`id` */
    updateUserId: number
}