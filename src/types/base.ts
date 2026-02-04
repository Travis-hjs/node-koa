import type { TableUserInfo } from "./user";
import type { RouterContext } from "@koa/router";

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
  data: T
}

/**
 * `JavaScript`类型映射表
 * - 这里只枚举一些常见类型，后续根据使用场景自行添加即可
 */
export interface JavaScriptType {
  string: string
  number: number
  boolean: boolean
  null: null
  undefined: undefined
  array: Array<any>
  object: object
  regexp: RegExp
  function: Function
  promise: Promise<any>
  formdata: FormData
}

/** `JavaScript`类型 */
export type JavaScriptTypes = keyof JavaScriptType;

/** 运算符号 */
export type NumberSymbols = "+" | "-" | "*" | "/";

/** 上传文件类型 */
export interface UploadFile {
  /**
   * The size of the uploaded file in bytes. If the file is still being uploaded (see `'fileBegin'`
   * event), this property says how many bytes of the file have been written to disk yet.
   */
  size: number;
  /**
   * The path this file is being written to. You can modify this in the `'fileBegin'` event in case
   * you are unhappy with the way formidable generates a temporary path for your files.
   */
  filepath: string;
  /**
   * The name this file had according to the uploading client.
   */
  originalFilename?: string;
  /**
   * Calculated based on options provided
   */
  newFilename: string;
  /**
   * The mime type of this file, according to the uploading client.
   */
  mimetype?: string;
  /**
   * A Date object (or `null`) containing the time this file was last written to. Mostly here for
   * compatibility with the [W3C File API Draft](http://dev.w3.org/2006/webapi/FileAPI/).
   */
  mtime?: Date;
  hashAlgorithm: false | "sha1" | "md5" | "sha256";
  /**
   * If `options.hashAlgorithm` calculation was set, you can read the hex digest out of this var
   * (at the end it will be a string).
   */
  hash?: string;
  /**
   * This method returns a JSON-representation of the file, allowing you to JSON.stringify() the
   * file which is useful for logging and responding to requests.
   *
   * @link https://github.com/node-formidable/formidable#filetojson
   */
  toJSON(): Record<string, any>;
  toString(): string;
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
  updateTime?: string
  /** 更新用户`id` */
  updateUserId?: number
}

export interface AppState {
  // 待补充
}

/** 自定义的请求上下文返回信息接口 */
export interface AppContext {
  /**
   * 请求时自定义设置的一个`token`信息
   * @description 具体看: src/module/Jwt.ts
   */
  theToken?: TableUserInfo
}

export type TheContext = RouterContext<AppState, AppContext>;
