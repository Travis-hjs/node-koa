import type { App } from "../types/common.js";
import Router from "@koa/router";
import { handleDomain, handleResult } from "../middleware/index.js";
import { config } from "../utils/config.js";
import { rsaKeys } from "../utils/crypto.js";

/**
 * 路由/接口模块
 */
const router = new Router<App.RouterState, App.RouterCtx>({
  prefix: config.apiPrefix,
});

// 全局配置接口，可以用作分发一些公共配置给前端
router.get("/config", handleDomain, async (ctx) => {
  handleResult({ ctx, data: { key: rsaKeys.public } });
});

export default router;
