import utils from "../utils";
import { query } from "../utils/mysql";
import { TableUserInfo } from "../types/user";
import { BaseObj } from "../types/base";

class ModuleUser {
  constructor() {
    this.update();
  }

  /** 用户缓存表格数据 */
  table = new Map<string, TableUserInfo>();

  /** 用户总数 */
  get total() {
    return this.table.size;
  }

  /** 从数据库中更新缓存用户表 */
  async update() {
    const res = await query("select * from user_table")
    if (res.state === 1) {
      const list: Array<TableUserInfo> = res.results || [];
      this.table.clear();
      for (let i = 0; i < list.length; i++) {
        const item = utils.objectToHump(list[i]) as TableUserInfo;
        item.createTime = utils.formatDate(item.createTime);
        this.table.set(item.id.toString(), item);
      }
      console.log("\x1B[42m 更新用户表缓存 \x1B[0m", this.total, "条数据");
    } else {
      console.log("用户表更新失败 >>", res.msg, res.error);
    }
  }

  /**
   * 新增用户
   * @param id 
   * @param value 用户信息
   */
  add(id: number, value: TableUserInfo) {
    this.table.set(id.toString(), value);
    console.log("\x1B[42m 新增用户 \x1B[0m", value);
  }

  /**
   * 通过用户`id`获取对应用户信息
   * @param id 用户`id`
   */
  getUserById(id: number | string) {
    return this.table.get(id.toString());
  }

  /**
   * 通过`id`删除用户记录
   * @param id 
   */
  remove(id: number) {
    this.table.delete(id.toString());
  }

  /**
   * 通过`id`更新指定用户信息
   * @param id 
   * @param value 用户信息
   */
  updateById(id: number, value: Partial<TableUserInfo>) {
    const user = this.getUserById(id);
    if (user) {
      utils.modifyData(user, value);
    }
  }

  /**
   * 【单个对象】匹配用户名，包括：创建用户名、编辑用户名
   * - 并返回新的驼峰数据对象
   * @param item 
   */
  matchName(item: BaseObj) {
    const createId = item["create_user_id"] as number;
    const updateId = item["update_user_id"] as number;
    item["create_user_name"] = this.getUserById(createId)?.name || "";
    if (updateId) {
      item["update_user_name"] = this.getUserById(updateId)?.name || "";
    }
    return utils.objectToHump(item);
  }

  /**
   * 【数组】匹配用户名，包括：创建用户名、编辑用户名
   * - 并返回驼峰数据对象
   * @param list 
   * @returns 
   */
  matchNameArray<T extends BaseObj>(list: Array<T>) {
    const result = [];
    for (let i = 0; i < list.length; i++) {
      const item = this.matchName(list[i]);
      result.push(item);
    }
    return result;
  }
}

/**
 * 用户表数据
 * - 缓存一份到内存里面，方便读取使用
 */
const tableUser = new ModuleUser();

export default tableUser;
