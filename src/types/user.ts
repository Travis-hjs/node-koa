import { MysqlOption } from "./base";

/** 用户表数据 */
export interface TableUserInfo extends MysqlOption {
    /** 表`id` */
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