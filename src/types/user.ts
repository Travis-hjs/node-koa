import { MysqlOption } from "./base";

/** 用户必有数据 */
interface UserData {
  /** 用户`id` */
  id: number
  /** 账号 */
  account: string
  /** 密码 */
  password: string
  /** 用户名 */
  name: string
  /** 用户类型 */
  type: number
  /** 用户分组`id` */
  groupId: number
}

/** 用户信息 */
export interface UserInfo extends UserData, Partial<MysqlOption> {
  /** 请求域名 */
  host?: string
  /** 登录时`token` */
  token?: string
}

/** 用户表数据 */
export interface TableUserInfo extends UserData, Partial<MysqlOption> {
  /** 处理过的字段 */
  updateUserName?: string
}

/** `token`信息对象 */
export interface UserInfoToken {
  /** 对标`UserInfo.id` */
  i: number
  /** 对标`UserInfo.account` */
  a: string
  /** 对标`UserInfo.password` */
  p: string
  /** 对标`UserInfo.type` */
  t: number
  /** 对标`UserInfo.groupId` */
  g: number
  /** 在线时间（毫秒） */
  o: number
}
