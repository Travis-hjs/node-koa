import type { App } from "../types/common.js";
import Router from "@koa/router";
import { config } from "../utils/config.js";

/**
 * 路由/接口模块
 */
const router = new Router<App.RouterState, App.RouterCtx>({
  prefix: config.apiPrefix,
});

export default router;
