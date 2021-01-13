import router from "./main";
import query from "../utils/mysql";
import session from "../modules/Session";
import config from "../modules/Config";
import {
    UserInfoType, 
    TheContext, 
    ResultFail, 
    ApiResult 
} from "../utils/interfaces";
import { apiSuccess, apiFail } from "../utils/apiResult";

// 注册
router.post("/register", async (ctx) => {
    /** 接收参数 */
    const params: UserInfoType = ctx.request.body;
    /** 返回结果 */
    let bodyResult: ApiResult;
    /** 账号是否可用 */
    let validAccount = false;
    // console.log("注册传参", params);

    if (!/^[A-Za-z0-9]+$/.test(params.account)) {
        return ctx.body = apiSuccess({}, "注册失败！账号必须由英文或数字组成", 400);
    }

    if (!/^[A-Za-z0-9]+$/.test(params.password)) {
        return ctx.body = apiSuccess({}, "注册失败！密码必须由英文或数字组成", 400);
    }

    if (!params.name.trim()) {
        params.name = "用户未设置昵称";
    }

    // 先查询是否有重复账号
    const res = await query(`select account from user where account = "${ params.account }"`)

    // console.log("注册查询", res);

    if (res.state === 1) {
        if (res.results.length > 0) {
            bodyResult = apiSuccess({}, "该账号已被注册", 400);
        } else {
            validAccount = true;
        }
    } else {
        ctx.response.status = 500;
        bodyResult = apiFail(res.msg, 500, res.error);
    }

    // 再写入表格
    if (validAccount) {
        const res = await query("insert into user(account, password, username) values(?,?,?)", [params.account, params.password, params.name])
        if (res.state === 1) {
            bodyResult = apiSuccess(params, "注册成功");
        } else {
            ctx.response.status = 500;
            bodyResult = apiFail(res.msg, 500, res.error);
        }
    }
    
    ctx.body = bodyResult;
})

// 登录
router.post("/login", async (ctx) => {
    /** 接收参数 */
    const params: UserInfoType = ctx.request.body;
    /** 返回结果 */
    let bodyResult: ResultFail | ApiResult;
    // console.log("登录", params);
    if (!params.account || params.account.trim() === "") {
        return ctx.body = apiSuccess({}, "登录失败！账号不能为空", 400);
    }

    if (!params.password || params.password.trim() === "") {
        return ctx.body = apiSuccess({}, "登录失败！密码不能为空", 400);
    }

    // 先查询是否有当前账号
    const res = await query(`select * from user where account = "${ params.account }"`)
    
    console.log("登录查询", res);

    if (res.state === 1) {
        // 再判断账号是否可用
        if (res.results.length > 0) {
            const data: UserInfoType = res.results[0];
            // 最后判断密码是否正确
            if (data.password == params.password) {
                data.token = session.setRecord({
                    id: data.id,
                    account: data.account,
                    password: data.password
                });
                bodyResult = apiSuccess(data ,"登录成功");
            } else {
                bodyResult = apiSuccess({}, "密码不正确", 400);
            }
        } else {
            bodyResult = apiSuccess({}, "该账号不存在，请先注册", 400);
        }
    } else {
        ctx.response.status = 500;
        bodyResult = apiFail(res.msg, 500, res.error);
    }

    ctx.body = bodyResult;
})

// 获取用户信息
router.get("/getUserInfo", async (ctx: TheContext) => {
    const state = ctx["the_state"];
    // /** 接收参数 */
    // const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult: ResultFail | ApiResult;

    // console.log("getUserInfo", params, state);

    const res = await query(`select * from user where account = "${ state.info.account }"`)
    
    if (res.state === 1) {
        // 判断账号是否可用
        if (res.results.length > 0) {
            const data: UserInfoType = res.results[0];
            bodyResult = apiSuccess(data);
        } else {
            bodyResult = apiSuccess({}, "该账号不存在，可能已经从数据库中删除", 400);
        }
    } else {
        ctx.response.status = 500;
        bodyResult = apiFail(res.msg, 500, res.error);
    }

    ctx.body = bodyResult;
})

// 退出登录
router.get("/logout", ctx => {
    const token: string = ctx.header.authorization;
    /** 接收参数 */
    const params = ctx.request.body;

    console.log("logout", params, token);

    if (token.length != config.tokenSize) {
        return ctx.body = apiSuccess({}, config.tokenTip);
    }

    const state = session.removeRecord(token);

    if (state) {
        return ctx.body = apiSuccess({}, "退出登录成功");
    } else {
        return ctx.body = apiSuccess({}, "token 不存在", 400);
    }
})