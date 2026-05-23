import type { App } from "../types/common.js";
import type { User } from "../types/user.js";
import { decrypt, encrypt } from "../utils/crypto.js";
import { getLogText, objectToHump } from "../utils/index.js";
import { getSqlSearch, query } from "../utils/mysql.js";

/**
 * 通过数据库查询用户数据
 * @param params 查询条件
 * @param keys 包含的字段，不传则查询所有字段
 */
export async function getUserRow(params: Partial<User.Search>, keys?: Array<keyof User.Row>) {
  const sql = getSqlSearch({
    name: "user_table",
    keys,
    accurate: params,
    size: 3,
  });
  const result = {} as User.SqlRes;
  const search = await query(sql.default, sql.values);
  if (search.state === 1) {
    const list = search.results || [];
    result.data = list[0] ? objectToHump<User.Row>(list[0]) : (null as any);
    result.list = list.map((el: any) => objectToHump<User.Row>(el));
    result.tips = result.data ? "ok" : "用户不存在!";
  }
  else {
    result.error = search.error;
    result.tips = search.msg;
  }
  return result;
}

/**
 * 生成`token`
 * @param userId
 * @param version 生成的字符串版本
 * @param expireTime 过期时间（时间戳），不传则永不过期
 */
export function generateToken(userId: number, version: string, expireTime?: number) {
  return encrypt({
    id: userId,
    version,
    expire: expireTime,
  });
}

/**
 * 验证`token`
 * @param ctx
 * @param token
 * @param keys 指定从数据库获取的用户字段，传`true`则获取完整字段，不传默认只获取`tokenVersion`用于 token 验证
 */
export async function verifyToken(ctx: App.Ctx, token?: string, keys?: boolean | Array<keyof User.Row>) {
  if (!token) {
    return "token 不存在";
  }
  try {
    const info = decrypt<{ id: number; version: string; expire: number }>(token);
    if (info.expire && info.expire < Date.now()) {
      return "token 已过期";
    }
    let userKeys: Array<keyof User.Row>;
    if (!keys) {
      userKeys = ["tokenVersion"];
    }
    else if (Array.isArray(keys) && keys.length > 0) {
      userKeys = keys;
      if (!userKeys.includes("tokenVersion")) {
        userKeys.push("tokenVersion"); // 必须要包含该字段
      }
    }
    const user = await getUserRow({ id: info.id }, userKeys!);
    if (user.error) {
      return user;
    }
    if (!user.data) {
      return user.tips;
    }
    if (user.data.tokenVersion !== info.version) {
      return "token 已失效，请重新登录";
    }
    user.data.id = info.id;
    ctx.state.user = user.data;
  }
  catch (error) {
    const tips = "验证 token 失败：";
    console.log(getLogText(tips, "red"), error);
    return `${tips}${error}`;
  }
  return true;
}
