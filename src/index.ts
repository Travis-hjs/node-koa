// learn: https://www.npmjs.com/package/koa
import * as Koa from "koa";
// learn: https://www.npmjs.com/package/koa-body
import { koaBody } from "koa-body";
// 静态文件处理模块 https://www.npmjs.com/package/koa-static
import * as staticFiles from "koa-static";
import * as path from "path";
import config from "./modules/Config";
import router from "./routes/main";
import utils from "./utils";
import "./routes/test";                         // 基础测试模块
import "./routes/user";                         // 用户模块
import "./routes/upload";                       // 上传文件模块
import "./routes/todo";                         // 用户列表模块
import { TheContext } from "./types/base";

const App = new Koa();

// 指定 public目录为静态资源目录，用来存放 js css images 等
// 注意：这里`template`目录下如果有`index.html`的话，会默认使用`index.html`代`router.get("/")`监听的
App.use(staticFiles(path.resolve(__dirname, "../public/template")))
// 上传文件读取图片的目录也需要设置为静态目录
App.use(staticFiles(path.resolve(__dirname, "../public/upload")))

// 先统一设置请求配置 => 跨域，请求头信息...
App.use(async (ctx: TheContext, next) => {
  /** 请求路径 */
  // const path = ctx.request.path;

  console.log("--------------------------");
  console.count("request count");

  const { origin, referer } = ctx.headers;

  const domain = utils.getDomain(referer || "");
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

  // 如果前端设置了 XHR.setRequestHeader("Content-Type", "application/json")
  // ctx.set 就必须携带 "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization" 
  // 如果前端设置了 XHR.setRequestHeader("Authorization", "xxxx") 那对应的字段就是 Authorization
  // 并且这里要转换一下状态码
  // console.log(ctx.request.method);
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 200;
  }

  // const hasPath = router.stack.some(item => item.path == path);
  // // 判断是否 404
  // if (path != "/" && !hasPath) {
  //     return ctx.body = "<h1 style="text-align: center; line-height: 40px; font-size: 24px; color: tomato">404：访问的页面（路径）不存在</h1>";
  // }

  try {
    await next();
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500;
    ctx.response.body = {
      message: err.message
    }
  }
});

// 使用中间件处理 post 传参 和上传图片
App.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: config.uploadImgSize
  }
}));

// 开始使用路由
App.use(router.routes())

// 默认无路由模式
// App.use((ctx, next) => {
//     ctx.body = html;
//     // console.log(ctx.response);
// });

App.on("error", (err, ctx) => {
  console.log(`\x1B[91m server error !!!!!!!!!!!!! \x1B[0m`, err, ctx);
})

App.listen(config.port, () => {
  // for (let i = 0; i < 100; i++) {
  //     console.log(`\x1B[${i}m 颜色 \x1B[0m`, i);
  // }
  const suffix = config.port + config.apiPrefix;
  console.log("服务器启动完成:");
  console.log(` - Local:   \x1B[36m http://localhost:\x1B[0m\x1B[96m${suffix} \x1B[0m`);
  console.log(` - Network: \x1B[36m http://${config.ip}:\x1B[0m\x1B[96m${suffix} \x1B[0m`);
})

// 参考项目配置连接: https://juejin.im/post/5ce25993f265da1baa1e464f
// mysql learn: https://www.jianshu.com/p/d54e055db5e0