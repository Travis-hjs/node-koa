import { Next } from "koa";
import utils from "../utils";
import jwt from "../modules/Jwt";
import config from "../modules/Config";
import { TheContext } from "../types/base";

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
  } else {
    await next();
  }
}

/**
 * 中间件-处理域名请求：严格判断当前请求域名是否在白名单内
 * @param ctx 
 * @param next 
 */
export async function handleDoMain(ctx: TheContext, next: Next) {

  const { referer, origin } = ctx.headers;
  // console.log(referer, origin);

  const domain = utils.getDomain(referer || "");

  const list = [...config.origins, `http://${config.ip}:${config.port}`];

  // 严格判断当前请求域名是否在白名单内
  if (domain && list.indexOf(domain) > -1) {
    await next();
  }

}