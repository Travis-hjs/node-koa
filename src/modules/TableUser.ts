import utils from "../utils";
import query from "../utils/mysql";
import {
    TableUserInfo,
} from "../types/user";

class ModuleUser {
    constructor() {
        this.update();
    }
    
    /** 缓存表格数据 */
    private _table: { [id: number]: TableUserInfo } = {};

    /** 用户计数 */
    private _total = 0;

    /** 用户表数据 */
    get table() {
        return this._table;
    }

    /** 用户总数 */
    get total() {
        return this._total;
    }

    /** 从数据库中更新缓存用户表 */
    async update() {
        const res = await query("select * from user_table")
        if (res.state === 1) {
            const list: Array<TableUserInfo> = res.results || [];
            this._total = list.length;
            this._table = {};
            if (this._total > 0) {
                for (let i = 0; i < list.length; i++) {
                    const item = utils.objectToHump(list[i]) as TableUserInfo;
                    item.createTime = utils.formatDate(item.createTime);
                    this._table[item.id] = item;
                }
            }
            console.log("\x1B[42m 更新用户表缓存 \x1B[0m", this._total, "条数据");
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
        this._table[id] = value;
        this._total++;
        console.log("\x1B[42m 新增用户 \x1B[0m", value);
    }
    
    /**
     * 通过`id`删除用户记录
     * @param id 
     */
    remove(id: number) {
        // delete _table[id];
        this._table[id] = undefined;
    }

    /**
     * 通过`id`更新指定用户信息
     * @param id 
     * @param value 用户信息
     */
    updateById(id: number, value: Partial<TableUserInfo>) {
        utils.modifyData(this._table[id], value);
    }

    /**
     * 【单个对象】匹配用户名，包括：创建用户名、编辑用户名；并返回驼峰数据对象
     * @param item 
     */
    matchName(item: any) {
        item["create_user_name"] = this.table[item["create_user_id"]].name;
        if (item["update_user_id"]) {
            item["update_user_name"] = this.table[item["update_user_id"]].name || "";
        }
        return utils.objectToHump(item);
    }

    /**
     * 【数组】匹配用户名，包括：创建用户名、编辑用户名；并返回驼峰数据对象
     * @param list 
     * @returns 
     */
    matchNameArray(list: Array<any>) {
        const result = [];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            this.matchName(item);
            result.push(utils.objectToHump(item));
        }
        return result;
    }
}

/**
 * 用户表数据
 * @description 缓存一份到程序里面，方便读取使用
 */
const tableUser = new ModuleUser();

export default tableUser;