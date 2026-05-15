import type { RouterContext } from "@koa/router";
import type { User } from "./user.js";

export interface HandleResult<T> {
  /** 路由上下文 */
  ctx: App.Ctx;
  /** 响应结果 */
  data: T;
  /** 提示文案 */
  tips?: string;
  /**
   * 响应码
   * - 不传则拿`status`代替
   */
  code?: number;
  /**
   * 状态码
   * - 不传默认为`200`
   */
  status?: number;
}

/**
 * `JavaScript`类型映射表
 * - 这里只枚举一些常见类型，后续根据使用场景自行添加即可
 */
export interface JavaScriptType {
  string: string;
  number: number;
  boolean: boolean;
  null: null;
  undefined: undefined;
  array: Array<any>;
  object: object;
  regexp: RegExp;
  function: Function;
  promise: Promise<any>;
  formdata: FormData;
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
  toJSON: () => Record<string, any>;
  toString: () => string;
}

/** 服务端请求响应结果 */
export interface ServeRequestResult {
  /** 状态标记 `state === 1`时为成功 */
  state: number;
  /** 状态描述信息 */
  msg: string;
  /** 结果对象 */
  result: any;
}

/** 当前应用类型集合 */
export namespace App {
  export interface RouterState {
    /**
     * `token`验证通过后用户数据
     * - 权限验证通过后才会赋值
     */
    user: User.Row;
  }

  export interface RouterCtx {
    // 可以为上下文设置任意值
  }

  export type Ctx = RouterContext<RouterState, RouterCtx>;
}

/** `sql`相关 */
export namespace Sql {
  /** 查询语句类型 */
  export interface Search {
    /** 数据库表名 */
    name: string;
    /**
     * 查询的字段
     * - 不传或者传控则为`select *`
     * - 内部会将驼峰转下划线
     */
    keys?: Array<string>;
    /**
     * 模糊查询对象
     * - 内部会将驼峰转下划线
     */
    vague?: Record<string, string | number>;
    /**
     * 精确查询对象
     * - 内部会将驼峰转下划线
     */
    accurate?: Record<string, string | number>;
    /**
     * 升序，支持多个字段
     * - 从小到大
     * - 内部会将驼峰转下划线
     */
    asc?: Array<string>;
    /**
     * 排降序，支持多个字段
     * - 从大到小
     * - 内部会将驼峰转下划线
     */
    desc?: Array<string>;
    /**
     * 页码（一页多少条）
     * - 默认`10`
     */
    size?: number;
    /**
     * 当前页数
     * - 默认`1`
     */
    page?: number;
    /** 日期范围查询 */
    dateRange?: {
      /**
       * 时间字段
       * - 内部会将驼峰转下划线
       */
      key: string;
      /** 范围开始值 */
      start?: string;
      /** 范围结束值 */
      end?: string;
    };
  }

  /** 通用表字段 */
  export interface CommonRow {
    /** 创建时间 */
    createTime: string;
    /** 创建用户`id` */
    createUserId: number;
    /** 更新时间 */
    updateTime?: string;
    /** 更新用户`id` */
    updateUserId?: number;
  }
}
