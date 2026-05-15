import { handleResult, handleToken } from "../middleware/index.js";
import { arrayItemToHump, formatDate, sqlInsertFormat, sqlUpdateFormat } from "../utils/index.js";
import { getSearchText, query } from "../utils/mysql.js";
import router from "./main.js";

// 获取所有列表
router.get("/getList", handleToken, async (ctx) => {
  const auth = ctx.state.user;

  // console.log("getList >>", tokenInfo);

  const sql = getSearchText({
    name: "todo_table",
    vague: {
      create_user_id: auth.id,
    },
    size: 999,
  });

  const res = await query(sql.default);

  if (res.state === 1) {
    // console.log("/getList 查询", res.results);
    const list = res.results.length > 0 ? arrayItemToHump(res.results) : [];
    handleResult({ ctx, data: { list } });
  }
  else {
    handleResult({ ctx, status: 500, data: res.error, tips: res.msg });
  }
});

// 添加列表
router.post("/addList", handleToken, async (ctx) => {
  const auth = ctx.state.user;
  /** 接收参数 */
  const params = ctx.request.body as any;

  if (!params.content) {
    return handleResult({ ctx, data: {}, tips: "添加的列表内容不能为空！", status: 400 });
  }

  const mysqlInfo = sqlInsertFormat({
    content: params.content,
    create_user_id: auth.id,
    create_time: formatDate(),
  });

  // 写入列表
  const res = await query(`insert into todo_table(${mysqlInfo.keys}) values(${mysqlInfo.symbols})`, mysqlInfo.values);

  console.log("写入列表", res);

  if (res.state !== 1) {
    return handleResult({ ctx, status: 500, data: { error: res.error }, tips: res.msg });
  }
  handleResult({ ctx, data: { id: res.results.insertId }, tips: "添加成功" });
});

// 修改列表
router.post("/editList", handleToken, async (ctx) => {
  const auth = ctx.state.user;
  /** 接收参数 */
  const params = ctx.request.body as unknown as { id: number; content: string };

  if (!params.id) {
    return handleResult({
      ctx,
      data: {},
      tips: "列表id不能为空",
      status: 400,
    });
  }

  if (!params.content) {
    return handleResult({
      ctx,
      data: {},
      tips: "列表内容不能为空",
      status: 400,
    });
  }

  const setData = sqlUpdateFormat({
    content: params.content,
    update_time: formatDate(),
    update_user_id: auth.id,
  });

  // 修改列表
  const res = await query(`update todo_table ${setData} where id = '${params.id}'`);

  // console.log("修改列表", res);

  if (res.state !== 1) {
    return handleResult({ ctx, status: 500, data: { error: res.error }, tips: res.msg });
  }
  if (res.results.affectedRows > 0) {
    handleResult({
      ctx,
      data: {},
      tips: "修改成功",
    });
  }
  else {
    handleResult({
      ctx,
      data: {},
      tips: "列表id不存在",
      status: 400,
    });
  }
});

// 删除列表
router.post("/deleteList", handleToken, async (ctx) => {
  /** 接收参数 */
  const params = ctx.request.body as unknown as { id: number };

  // 从数据库中删除
  // const res = await query(`delete from todo_table where id='${params.id}' and user_id='${state.info.id}'`)
  const res = await query(`delete from todo_table where id = '${params.id}'`);
  // const res = await query(`delete from todo_table where id in(${params.ids.toString()})`) // 批量删除

  // console.log("从数据库中删除", res);

  if (res.state === 1) {
    if (res.results.affectedRows > 0) {
      handleResult({ ctx, data: {}, tips: "删除成功" });
    }
    else {
      handleResult({ ctx, data: {}, tips: "当前列表id不存在或已删除", status: 400 });
    }
  }
  else {
    handleResult({ ctx, data: { error: res.error }, tips: res.msg, status: 500 });
  }
});
