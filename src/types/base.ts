import * as Koa from "koa";
import { TableUserInfo } from "./user";

/** 基础对象 */
export interface BaseObj<T = string | number> {
  [key: string]: T
}

/** 接口响应数据，返回给前端用 */
export interface ApiResult<T = any> {
  /** 状态提示 */
  message: string
  /** 状态码 */
  code: number
  /** 返回数据 */
  result: T
}

/** JavaScript类型 */
export type JavaScriptTypes = "string" | "number" | "array" | "object" | "function" | "null" | "undefined" | "regexp";

/** 运算符号 */
export type NumberSymbols = "+" | "-" | "*" | "/";

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

/** 自定义的请求上下文返回信息接口 */
export interface TheContext extends Koa.ParameterizedContext {
  /**
   * 请求时自定义设置的一个`token`信息
   * @description 具体看: src/module/Jwt.ts
   */
  theToken?: TableUserInfo
}
