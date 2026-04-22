import type { Next } from "koa";
import type { TheContext } from "../types/base.js";
import { jwt } from "../modules/index.js";
import { config } from "../utils/config.js";
import { getDomain } from "../utils/index.js";

/**
 * 中间件-处理`token`验证
 * @param ctx
 * @param next
 * @description 需要`token`验证的接口时使用
 */
export async function handleToken(ctx: TheContext, next: Next) {
  const checkInfo = jwt.checkToken(ctx);

  if (checkInfo.fail) {
    ctx.body = checkInfo.info;
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
