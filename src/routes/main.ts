import type { AppContext, AppState } from "../types/base.js";
import Router from "@koa/router";
import { config } from "../utils/config.js";

/**
 * 路由/接口模块
 */
const router = new Router<AppState, AppContext>({
  prefix: config.apiPrefix,
});

export default router;
