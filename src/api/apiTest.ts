import * as fs from "fs";
import * as path from "path";
import router from "./main";
import utils from "../utils";
import { apiSuccess } from "../utils/apiResult";
import config from "../modules/Config";

/** 资源路径 */
const resourcePath = path.resolve(__dirname, '../../public');

const template = fs.readFileSync(resourcePath + "/template/index.html", "utf-8");

// "/*" 监听全部
router.get("/", (ctx, next) => {
    // 指定返回类型
    // ctx.response.type = "html";
    ctx.response.type = "text/html; charset=utf-8";

    const data = {
        pageTitle: "serve-root",
        jsLabel: "",
        content: `<button class="button button_green"><a href="/home">go to home<a></button>`
    }

    ctx.body = utils.replaceText(template, data);
    // console.log("根目录");

    // 路由重定向
    // ctx.redirect("/home");

    // 302 重定向到其他网站
    // ctx.status = 302;
    // ctx.redirect("https://www.baidu.com");
})

router.get("/home", (ctx, next) => {
    ctx.response.type = "text/html; charset=utf-8";

    const data = {
        pageTitle: "serve-root",
        jsLabel: "",
        content: `<h1 style="text-align: center; line-height: 40px; font-size: 24px; color: #007fff">Welcome to home</h1>`
    }

    ctx.body = utils.replaceText(template, data);
    // console.log("/home");
})

// get 请求
router.get("/getData", (ctx, next) => {
    /** 接收参数 */
    const params: object | string = ctx.query || ctx.querystring;

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
    const params: object = ctx.request.body || ctx.params;

    console.log("/postData", params);

    const result = {
        data: "请求成功"
    }

    ctx.body = apiSuccess(result, "post success")
})