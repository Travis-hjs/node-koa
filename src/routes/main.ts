import * as Router from "koa-router";       // learn: https://www.npmjs.com/package/koa-router
import { config } from "../modules";

/**
 * api路由模块
 */
const router = new Router({
  prefix: config.apiPrefix
});

export default router;