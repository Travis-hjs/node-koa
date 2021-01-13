import router from "./main";
import query from "../utils/mysql";
import { TheContext } from "../utils/interfaces";
import { apiSuccess, apiFail } from "../utils/apiResult";

// 获取所有列表
router.get("/getList", async (ctx: TheContext) => {
    const state = ctx["the_state"];
    /** 返回结果 */
    let bodyResult = null;
    
    // console.log("getList");

    // 这里要开始连表查询
    const res = await query(`select * from todo_list where user_id = "${ state.info.id }"`)

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
router.post("/addList", async (ctx: TheContext) => {
    const state = ctx["the_state"];
    /** 接收参数 */
    const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult = null;

    if (!params.content) {
        return ctx.body = apiSuccess({}, "添加的列表内容不能为空！", 400);
    }

    // 写入列表
    const res = await query("insert into todo_list(content, time, user_id) values(?,?,?)", [params.content, new Date().toLocaleDateString(), state.info.id])
    
    console.log("写入列表", res);

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
router.post("/modifyList", async (ctx) => {
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

    // 修改列表
    const res = await query(`update todo_list set content="${params.content}", time="${new Date().toLocaleDateString()}" where list_id="${params.id}"`)

    console.log("修改列表", res);

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
router.post("/deleteList", async (ctx: TheContext) => {
    const state = ctx["the_state"];
    /** 接收参数 */
    const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult = null;

    // 从数据库中删除
    const res = await query(`delete from todo_list where list_id=${params.id} and user_id = ${state.info.id}`)
    
    console.log("从数据库中删除", res);

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