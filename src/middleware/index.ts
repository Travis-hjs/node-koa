import type { Next } from "koa";
import type { App, HandleResult } from "../types/common.js";
import type { User } from "../types/user.js";
import { verifyToken } from "../modules/user.js";
import { config } from "../utils/config.js";
import { getDomain } from "../utils/index.js";

/**
 * 处理响应结果
 * @param params
 */
export function handleResult<T = any>(params: HandleResult<T>) {
  const status = params.status || 200;
  params.ctx.status = status;
  params.ctx.body = {
    message: params.tips || "ok",
    code: params.code || status,
    data: params.data,
  };
}

/**
 * 中间件-处理`token`验证
 * @param ctx
 * @param next
 * @param keys 指定从数据库获取的用户字段，传`true`则获取完整字段，不传默认只获取`tokenVersion`用于 token 验证
 * - 需要`token`验证的接口时使用
 */
export async function handleToken(ctx: App.Ctx, next: Next, keys?: boolean | Array<keyof User.Row>) {
  const value = await verifyToken(ctx, ctx.header.authorization, keys);

  if (typeof value === "object") {
    return handleResult({
      ctx,
      status: 500,
      tips: value.tips,
      data: `${value.error}`,
    });
  }

  if (typeof value === "string") {
    return handleResult({
      ctx,
      status: 401,
      tips: value,
      data: {},
    });
  }

  await next();
}

/**
 * 中间件-处理域名请求：严格判断当前请求域名是否在白名单内
 * @param ctx
 * @param next
 */
export async function handleDomain(ctx: App.Ctx, next: Next) {
  const { origin, referer } = ctx.headers;
  // console.log(origin, referer);

  const domain = getDomain(origin || referer || "");
  const list = config.origins.concat([`http://${config.ip}:${config.port}`]);

  if (!domain) {
    return handleResult({
      ctx,
      status: 404,
      tips: "error request",
      data: {},
    });
  }

  // 严格判断当前请求域名是否在白名单内
  if (!list.includes(domain)) {
    return handleResult({
      ctx,
      status: 403,
      tips: "forbidden: origin is not allowed",
      data: {},
    });
  }

  await next();
}
