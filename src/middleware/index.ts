import type { Next } from "koa";
import type { HandleResult, TheContext } from "../types/common.js";
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
 * @description 需要`token`验证的接口时使用
 */
export async function handleToken(ctx: TheContext, next: Next) {
  const value = await verifyToken(ctx, ctx.header.authorization);

  if (typeof value === "string") {
    handleResult({
      ctx,
      status: 401,
      tips: value,
      data: {},
    });
  }
  else {
    await next();
  }
}

/**
 * 中间件-处理域名请求：严格判断当前请求域名是否在白名单内
 * @param ctx
 * @param next
 */
export async function handleDomain(ctx: TheContext, next: Next) {
  const { referer } = ctx.headers;
  // console.log(referer, origin);

  const domain = getDomain(referer || "");

  const list = config.origins.concat([`http://${config.ip}:${config.port}`]);

  // 严格判断当前请求域名是否在白名单内
  if (domain && list.includes(domain)) {
    await next();
  }
}
