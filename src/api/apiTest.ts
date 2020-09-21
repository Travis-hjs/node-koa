import router from "./main";
import html from "../modules/template";
import stateInfo from "../modules/State";

// "/*" 监听全部
router.get("/", (ctx, next) => {
    // 指定返回类型
    ctx.response.type = "html";
    ctx.body = html;
    // console.log("根目录");

    // 路由重定向
    // ctx.redirect("/home");

    // 302 重定向到其他网站
    // ctx.status = 302;
    // ctx.redirect("https://www.baidu.com");
})

router.get("/home", (ctx, next) => {
    ctx.response.type = "html";
    ctx.body = `<h1 style="text-align: center; line-height: 40px; font-size: 24px; color: #007fff">Welcome to home</h1>`;
    // console.log("/home");
})

// get 请求
router.get("/getData", (ctx, next) => {
    /** 接收参数 */
    const params: object | string = ctx.query || ctx.querystring;

    console.log("/getData", params);

    ctx.body = stateInfo.getSuccessData({
        method: "get",
        port: 1995,
        time: Date.now()
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

    ctx.body = stateInfo.getSuccessData(result, "post success")
})