import * as Koa from "koa"; 

/** 成功返回提示数据 */
export interface ResultSuccess {
    /** 状态提示 */
    message: string
    /** 状态成功码 */
    code: 200
    /** 成功返回数据 */
    result: any
}

/** 失败返回提示数据 */
export interface ResultFail {
    /** 状态错误提示 */
    message: string
    /** 状态错误码 */
    code: number
}

interface MysqlErrorInfoType {
    code: string | number
    errno: number
    sqlMessage: string
    sqlState: string
    index: number
    sql: string
}

/** mysql错误数据类型 */
export interface MysqlErrorType {
    /** 错误信息 */
    info: MysqlErrorInfoType
    /** 信息描述 */
    message: string
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
    /** 请求时自定义设置的一个状态 (see)[src/index.ts] */
    the_state?: SessionResultType
}