import router from "./main";
import query from "../modules/mysql";
import stateInfo from "../modules/State";
import session from "../modules/Session";
import config from "../modules/Config";
import { 
    MysqlErrorType, 
    UserInfoType, 
    TheContext, 
    ResultFail, 
    ResultSuccess 
} from "../modules/interfaces";

// 注册
router.post("/register", async (ctx) => {
    /** 接收参数 */
    const params: UserInfoType = ctx.request.body;
    /** 返回结果 */
    let bodyResult: ResultFail | ResultSuccess;
    /** 账号是否可用 */
    let validAccount = false;
    // console.log("注册传参", params);

    if (!/^[A-Za-z0-9]+$/.test(params.account)) {
        return ctx.body = stateInfo.getFailData("注册失败！账号必须由英文或数字组成");
    }

    if (!/^[A-Za-z0-9]+$/.test(params.password)) {
        return ctx.body = stateInfo.getFailData("注册失败！密码必须由英文或数字组成");
    }

    if (!params.name.trim()) {
        params.name = "用户未设置昵称";
    }

    // 先查询是否有重复账号
    await query(`select account from user where account = "${ params.account }"`).then(res => {
        // console.log("注册查询", res);
        if (res.results.length > 0) {
            bodyResult = stateInfo.getFailData("该账号已被注册");
        } else {
            validAccount = true;
        }
    }).catch((error: MysqlErrorType) => {
        // console.log("注册查询错误", error);
        bodyResult = stateInfo.getFailData(error.message);
    })

    // 再写入表格
    if (validAccount) {
        await query("insert into user(account, password, username) values(?,?,?)", [params.account, params.password, params.name]).then(res => {
            // console.log("注册写入", res);
            bodyResult = stateInfo.getSuccessData(params, "注册成功");
        }).catch((error: MysqlErrorType) => {
            // console.log("注册写入错误", error);
            bodyResult = stateInfo.getFailData(error.message);
        })
    }
    
    ctx.body = bodyResult;
})

// 登录
router.post("/login", async (ctx) => {
    /** 接收参数 */
    const params: UserInfoType = ctx.request.body;
    /** 返回结果 */
    let bodyResult: ResultFail | ResultSuccess;
    // console.log("登录", params);
    if (!params.account || params.account.trim() === "") {
        return ctx.body = stateInfo.getFailData("登录失败！账号不能为空");
    }

    if (!params.password || params.password.trim() === "") {
        return ctx.body = stateInfo.getFailData("登录失败！密码不能为空");
    }

    // 先查询是否有当前账号
    await query(`select * from user where account = "${ params.account }"`).then(res => {
        // console.log("登录查询", res.results);
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
                bodyResult = stateInfo.getSuccessData(data ,"登录成功");
            } else {
                bodyResult = stateInfo.getFailData("密码不正确");
            }
        } else {
            bodyResult = stateInfo.getFailData("该账号不存在，请先注册");
        }
    }).catch((error: MysqlErrorType) => {
        // console.log("登录查询错误", error);
        bodyResult = stateInfo.getFailData(error.message);
    })
    
    ctx.body = bodyResult;
})

// 获取用户信息
router.get("/getUserInfo", async (ctx: TheContext) => {
    const state = ctx["the_state"];
    // /** 接收参数 */
    // const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult: ResultFail | ResultSuccess;

    // console.log("getUserInfo", params, state);

    await query(`select * from user where account = "${ state.info.account }"`).then(res => {
        // 判断账号是否可用
        if (res.results.length > 0) {
            const data: UserInfoType = res.results[0];
            bodyResult = stateInfo.getSuccessData(data);
        } else {
            bodyResult = stateInfo.getFailData("该账号不存在，可能已经从数据库中删除");
        }
    }).catch((error: MysqlErrorType) => {
        bodyResult = stateInfo.getFailData(error.message);
    })

    ctx.body = bodyResult;
})

// 退出登录
router.get("/logout", ctx => {
    const token: string = ctx.header.authorization;
    /** 接收参数 */
    const params = ctx.request.body;

    console.log("logout", params, token);

    if (token.length != config.tokenSize) {
        return ctx.body = stateInfo.getFailData(config.tokenTip);
    }

    const state = session.removeRecord(token);

    if (state) {
        return ctx.body = stateInfo.getSuccessData("退出登录成功");
    } else {
        return ctx.body = stateInfo.getFailData("token 不存在");
    }
})