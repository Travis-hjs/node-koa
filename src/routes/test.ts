import * as fs from "fs";
import * as path from "path";
import router from "./main";
import utils from "../utils";
import { apiSuccess, apiFail } from "../utils/apiResult";
import config from "../modules/Config";
import request from "../utils/request";
import { BaseObj } from "../types/base";

/** 资源路径 */
const resourcePath = path.resolve(__dirname, "../../public/template");

const template = fs.readFileSync(resourcePath + "/page.html", "utf-8");

// "/*" 监听全部
router.get("/", (ctx, next) => {
  // 指定返回类型
  // ctx.response.type = "html";
  // ctx.response.type = "text/html; charset=utf-8";

  // const data = {
  //   pageTitle: "serve-root",
  //   jsLabel: "",
  //   content: `<button class="button button_green"><a href="/home">go to home<a></button>`
  // }

  // ctx.body = utils.replaceText(template, data);
  // console.log("根目录");

  // 路由重定向
  ctx.redirect(config.getRoutePath("/home"));

  // 302 重定向到其他网站
  // ctx.status = 302;
  // ctx.redirect("https://www.baidu.com");
})

router.get("/home", (ctx, next) => {
  const userAgent = ctx.header["user-agent"];

  ctx.response.type = "text/html; charset=utf-8";

  const path = `http://${config.ip}:${config.port}`;

  const data = {
    pageTitle: "serve-root",
    path: path,
    jsLabel: `<script src="https://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>`,
    content: `
      <div style="font-size: 24px; margin-bottom: 8px; font-weight: bold;">当前环境信息：</div>
      <p style="font-size: 15px; margin-bottom: 10px; font-weight: 500;">${userAgent}</p>
      <button class="the-btn purple"><a href="${path}/api-index.html">open test</a></button>
    `
  }

  ctx.body = utils.replaceText(template, data);
  // console.log("/home");
})

// get 请求
router.get("/getData", (ctx, next) => {
  /** 接收参数 */
  const params = ctx.query || ctx.querystring;

  console.log("/getData", params);

  ctx.body = apiSuccess({
    method: "get",
    port: config.port,
    date: utils.formatDate()
  });
})

// post 请求
router.post("/postData", (ctx, next) => {
  /** 接收参数 */
  const params: BaseObj = ctx.request.body || ctx.params;

  // console.log("/postData", params);

  const result = {
    data: params
  }

  ctx.body = apiSuccess(result, "post success")
})

// 请求第三方接口并把数据返回到前端
router.get("/getWeather", async (ctx, next) => {
  // console.log("ctx.query >>", ctx.query);
  const cityCode = ctx.query.cityCode as string;

  if (!cityCode) {
    ctx.body = apiSuccess({}, "缺少传参字段 cityCode", 400);
    return;
  }

  /**
   * 自行去申请`appKey`才能使用
   * - [高德地图应用入口](https://console.amap.com/dev/key/app)
   * - [天气预报接口文档](https://lbs.amap.com/api/webservice/guide/api/weatherinfo/)
   */
  const appKey = "";

  if (!appKey) {
    ctx.status = 500;
    ctx.body = apiFail("服务端缺少 appKey 请检查再重试", 500, {})
    return;
  }
  
  const path = utils.jsonToPath({
    key: appKey,
    city: cityCode
  })

  const res = await request({
    method: "GET",
    hostname: "restapi.amap.com",
    path: "/v3/weather/weatherInfo?" + path
  })

  // console.log("获取天气信息 >>", res);

  if (res.state === 1) {
    if (utils.isType(res.result, "string")) {
      res.result = JSON.parse(res.result);
    }
    ctx.body = apiSuccess(res.result)
  } else {
    ctx.status = 500;
    ctx.body = apiFail(res.msg, 500, res.result)
  }

})

const filePath = path.resolve(__dirname, "../../public/upload");

router.get("/getVideo", async (ctx, next) => {
  // const blob = new Blob(["hello there"]);
  // console.log("filePath >>", filePath);
  
  // 设置响应头，告诉浏览器该文件需要下载
  ctx.set("Content-disposition", "attachment; filename=xhs.webm");
  ctx.set("Content-type", "video/webm");

  const stream = fs.createReadStream(filePath + "/xhs2.webm");

	// stream.pipe(ctx.body);

  ctx.body = stream;

})

router.get("/getExcel", async (ctx, next) => {
  const fileName = "demo.xls"; // 文件名

  // 设置响应头，告诉浏览器这是一个需要下载的文件
  ctx.set("Content-disposition", `attachment; filename=${fileName}`);
  ctx.set("Content-type", "application/octet-stream");

  // 创建可读流
  const stream = fs.createReadStream(filePath + "/demo.xls");

  // 把可读流的内容写入响应
  ctx.body = stream;

  // 如果需要在下载完成后做一些操作，可以监听可读流的结束事件
  stream.on("end", () => {
    // 可以在这里做一些下载完成后的操作
    console.log("文件下载完成");
  });

  // 如果发生错误，可以监听错误事件
  stream.on("error", (err) => {
    console.error("文件下载出错", err);
    ctx.status = 500;
    ctx.body = "文件下载出错";
  });
})
