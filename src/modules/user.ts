import type { App } from "../types/common.js";
import type { User } from "../types/user.js";
import { decrypt, encrypt, objectToHump } from "../utils/index.js";
import { getSearchText, query } from "../utils/mysql.js";

/**
 * 通过数据库查询用户信息
 * @param params 查询条件
 * @param keys 包含的用户字段，不传则查询所有字段
 */
export async function getUserInfo(params: Partial<User.Search>, keys?: Array<keyof User.Row>) {
  const sql = getSearchText({
    name: "user_table",
    keys,
    accurate: params,
    size: 2,
  });
  const res = await query(sql.default);
  if (res.state === 1) {
    const row = res.results[0];
    return row ? objectToHump<User.Row>(row) : null;
  }
  return null;
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
 */
export async function verifyToken(ctx: App.Ctx, token: string) {
  if (!token)
    return "token 不存在";
  try {
    const info = decrypt<{ id: number; version: string; expire: number }>(token);
    if (info.expire && info.expire < Date.now()) {
      return "token 已过期";
    }
    const user = await getUserInfo({ id: info.id }, ["tokenVersion"]);
    if (!user) {
      return "token 不正确";
    }
    if (user.tokenVersion !== info.version) {
      return "token 已失效，请重新登录";
    }
    user.id = info.id;
    ctx.state.user = user;
  }
  catch (error) {
    return `验证 token 失败：${error}`;
  }
  return true;
}
