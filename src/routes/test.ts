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
  ctx.redirect("/home");

  // 302 重定向到其他网站
  // ctx.status = 302;
  // ctx.redirect("https://www.baidu.com");
})

router.get("/home", (ctx, next) => {
  const userAgent = ctx.header["user-agent"];

  ctx.response.type = "text/html; charset=utf-8";

  const data = {
    pageTitle: "serve-root",
    jsLabel: `<script src="https://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>`,
    content: `
      <div style="font-size: 24px; margin-bottom: 8px; font-weight: bold;">当前环境信息：</div>
      <p style="font-size: 15px; margin-bottom: 10px; font-weight: 500;">${userAgent}</p>
      <button class="button button_purple"><a href="./api-index.html">open test</></button>
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

  console.log("/postData", params);

  const result = {
    data: "请求成功"
  }

  ctx.body = apiSuccess(result, "post success")
})

// 请求第三方接口并把数据返回到前端
router.get("/getWeather", async (ctx, next) => {
  // console.log("ctx.query >>", ctx.query);
  const city = ctx.query.city as string;

  if (!city) {
    ctx.body = apiSuccess({}, "缺少传参字段 city", 400);
    return;
  }

  const res = await request({
    method: "GET",
    hostname: "www.tianqiapi.com",
    path: "/free/day?appid=56761788&appsecret=ti3hP8y9&city=" + encodeURIComponent(city)
  })

  // console.log("获取天气信息 >>", res);

  if (res.state === 1) {
    if (utils.checkType(res.result) === "string") {
      res.result = JSON.parse(res.result);
    }
    ctx.body = apiSuccess(res.result)
  } else {
    ctx.body = apiFail(res.msg, 500, res.result)
  }

})