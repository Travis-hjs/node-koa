
import type { TheContext } from "./types/base.js";
import Koa from "koa";
import { koaBody } from "koa-body";
import serve from "koa-static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./utils/config.js";
import router from "./routes/main.js";
import { getDomain, getLogText } from "./utils/index.js";
import "./routes/test.js";                         // 基础测试模块
import "./routes/user.js";                         // 用户模块
import "./routes/upload.js";                       // 上传文件模块
import "./routes/todo.js";                         // 用户列表模块

const App = new Koa();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 指定 public目录为静态资源目录，用来存放 js css images 等
// 注意：这里`template`目录下如果有`index.html`的话，会默认使用`index.html`代`router.get("/")`监听的
App.use(serve(path.resolve(__dirname, "../public/template")))
// 上传文件读取图片的目录也需要设置为静态目录
App.use(serve(path.resolve(__dirname, "../public/upload")))

// 先统一设置请求配置 => 跨域，请求头信息...
App.use(async (ctx: TheContext, next) => {
  console.log("--------------------------");
  console.log(getLogText(new Date().toLocaleString(), "yellow"), ctx.request.path);
  console.count("request count");

  const { origin, referer } = ctx.headers;

  const domain = getDomain(referer || "");
  // console.log("referer domain >>", domain);
  // 如果是 允许访问的域名源 ，则给它设置跨域访问和正常的请求头配置
  if (domain && config.origins.includes(domain)) {
    ctx.set({
      "Access-Control-Allow-Origin": domain,
      // "Access-Control-Allow-Origin": "*", // 开启跨域，一般用于调试环境，正式环境设置指定 ip 或者指定域名
      // "Content-Type": "application/json",
      // "Access-Control-Allow-Credentials": "true",
      // "Access-Control-Allow-Methods": "OPTIONS, GET, PUT, POST, DELETE",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      // "X-Powered-By": "3.2.1",
      // "Content-Security-Policy": `script-src "self"` // 只允许页面`script`引入自身域名的地址
    });
  }

  // console.log(ctx.request.method);
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 200;
  }

  // const hasPath = router.stack.some(item => item.path == path);
  // // 判断是否 404
  // if (path != "/" && !hasPath) {
  //     return ctx.body = "<h1 style=\"text-align: center; line-height: 40px; font-size: 24px; color: tomato\">404: page not found</h1>";
  // }

  try {
    await next();
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500;
    ctx.response.body = {
      message: err.message || `${err}`
    }
  }
});

// 使用中间件处理 post 传参 和上传图片
App.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: config.uploadImgLimit
  }
}));

// 开始使用路由
App.use(router.routes());
// allowedMethods 自动根据当前路由配置响应 OPTIONS 请求，并针对未实现的方法返回 405/501
App.use(router.allowedMethods());

// 默认无路由模式
// App.use((ctx, next) => {
//     ctx.body = html;
//     // console.log(ctx.response);
// });

App.on("error", (err, ctx) => {
  const text = getLogText("server error !!!!!!!!!!!!!", "red-light");
  console.log(text, err, ctx);
});

App.listen(config.port, () => {
  // for (let i = 0; i < 100; i++) {
  //   console.log(`\x1B[${i}m 颜色 \x1B[0m`, i);
  // }
  const suffix = getLogText(config.port + config.apiPrefix, "cyan");
  console.log(getLogText("服务器启动完成:", "green"));
  console.log(` - 当前环境: ${getLogText(config.env, "cyan")}`);
  console.log(` - Local:    ${getLogText("http://localhost:", "blue") + suffix}`);
  console.log(` - Network:  ${getLogText(`http://${config.ip}:`, "blue") + suffix}`);
});
