import type { Sql } from "./common.js";

export namespace User {
  /**
   * 用户信息
   * - 表结构
   */
  export interface Row extends Partial<Sql.CommonRow> {
    /**
     * 用户`id`
     * - 表字段
     */
    id: number;
    /**
     * `token`分配的对比字段
     * - 由登录相关接口分配的字段
     */
    tokenVersion: string;
    /**
     * 账号
     * - 表字段
     */
    account?: string;
    /**
     * 密码
     * - 表字段
     */
    password?: string;
    /**
     * 用户名
     * - 表字段
     */
    name?: string;
    /**
     * 用户类型
     * - 表字段
     */
    type?: number;
    /**
     * 用户分组`id`
     * - 表字段
     */
    groupId?: number;
  }

  /** 查询参数 */
  export interface Search extends Pick<Row, "id" | "account"> {}

  /**
   * `getUserInfo`响应结果
   */
  export interface SqlRes {
    /**
     * 用户数据
     * - 如果存在多条的情况下，为数据第一条
     */
    data: Row;
    /** 查询到的用户列表 */
    list: Array<Row>;
    /** 错误信息 */
    error: any;
    /** 提示 */
    tips: string;
  }
}
