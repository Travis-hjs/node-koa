import Router from "@koa/router";
import { config } from "../utils/config.js";
import type { AppState, AppContext } from "../types/base.js";

/**
 * 路由/接口模块
 */
const router = new Router<AppState, AppContext>({
  prefix: config.apiPrefix
});

export default router;
