import Router from "@koa/router";       // learn: https://www.npmjs.com/package/koa-router
import { config } from "../modules";
import type { AppState, AppContext } from "../types/base";

/**
 * 路由/接口模块
 */
const router = new Router<AppState, AppContext>({
  prefix: config.apiPrefix
});

export default router;