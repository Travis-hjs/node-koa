import { Next } from "koa";
import jwt from "../modules/Jwt";
import { TheContext } from "../utils/interfaces";

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