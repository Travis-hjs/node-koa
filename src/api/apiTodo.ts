import router from "./main";
import query from "../utils/mysql";
import { ApiResult, TheContext } from "../utils/interfaces";
import { apiSuccess, apiFail } from "../utils/apiResult";
import { handleToken } from "./middleware";
import utils from "../utils";

// 获取所有列表
router.get("/getList", handleToken, async (ctx: TheContext) => {

    const state = ctx["theState"];
    /** 返回结果 */
    let bodyResult: ApiResult<any>;
    
    // console.log("getList >>", state);

    // 这里要开始连表查询
    const res = await query(`select * from todo_form where user_id='${state.info.id}'`)

    if (res.state === 1) {
        // console.log("/getList 查询", res.results);
        bodyResult = apiSuccess({
            list: res.results.length > 0 ? res.results : [] 
        });
    } else {
        ctx.response.status = 500;
        bodyResult = apiFail(res.msg, 500, res.error);
    }

    ctx.body = bodyResult;
})

// 添加列表
router.post("/addList", handleToken, async (ctx: TheContext) => {

    const state = ctx["theState"];
    /** 接收参数 */
    const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult = null;

    if (!params.content) {
        return ctx.body = apiSuccess({}, "添加的列表内容不能为空！", 400);
    }
    
    const mysqlInfo = utils.mysqlFormatParams({
        "content": params.content,
        "user_id": state.info.id,
        "update_time": utils.formatDate(),
        "create_time": utils.formatDate()
    })

    // 写入列表
    const res = await query(`insert into todo_form(${mysqlInfo.keys}) values(${mysqlInfo.symbols})`, mysqlInfo.values)

    // console.log("写入列表", res);

    if (res.state === 1) {
        bodyResult = apiSuccess({
            id: res.results.insertId
        }, "添加成功");
    } else {
        ctx.response.status = 500;
        bodyResult = apiFail(res.msg, 500, res.error);
    }
    
    ctx.body = bodyResult;
})

// 修改列表
router.post("/modifyList", handleToken, async (ctx) => {

    /** 接收参数 */
    const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult = null;

    if (!params.id) {
        return ctx.body = apiSuccess({}, "列表id不能为空", 400);
    }

    if (!params.content) {
        return ctx.body = apiSuccess({}, "列表内容不能为空", 400);
    }

    const setData = utils.mysqlSetParams({
        "content": params.content,
        "update_time": utils.formatDate()
    })

    // 修改列表
    const res = await query(`update todo_form ${setData} where id='${params.id}'`)

    // console.log("修改列表", res);

    if (res.state === 1) {
        if (res.results.affectedRows > 0) {
            bodyResult = apiSuccess({}, "修改成功");
        } else {
            bodyResult = apiSuccess({}, "列表id不存在", 400);
        }
    } else {
        ctx.response.status = 500;
        bodyResult = apiFail(res.msg, 500, res.error);
    }

    ctx.body = bodyResult;
})

// 删除列表
router.post("/deleteList", handleToken, async (ctx: TheContext) => {
    
    // const state = ctx["theState"];
    /** 接收参数 */
    const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult = null;

    // 从数据库中删除
    // const res = await query(`delete from todo_form where id='${params.id}' and user_id='${state.info.id}'`)
    const res = await query(`delete from todo_form where id='${params.id}'`)
    // const res = await query(`delete from todo_form where id in(${params.ids.toString()})`) // 批量删除
    
    // console.log("从数据库中删除", res);

    if (res.state === 1) {
        if (res.results.affectedRows > 0) {
            bodyResult = apiSuccess({}, "删除成功");
        } else {
            bodyResult = apiSuccess({}, "当前列表id不存在或已删除", 400);
        }
    } else {
        ctx.response.status = 500;
        bodyResult = apiFail(res.msg, 500, res.error);
    }

    ctx.body = bodyResult;
})