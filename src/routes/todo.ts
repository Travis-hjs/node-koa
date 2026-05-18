import { handleResult, handleToken } from "../middleware/index.js";
import { arrayItemToHump, formatDate, sqlInsertFormat, sqlUpdateFormat } from "../utils/index.js";
import { getSearchText, query } from "../utils/mysql.js";
import router from "./main.js";

// 获取所有列表
router.get("/todo/list", handleToken, async (ctx) => {
  const auth = ctx.state.user;

  const sqlSearch = getSearchText({
    name: "todo_table",
    vague: {
      createUserId: auth.id,
    },
    size: 999,
  });

  const sqlRes = await query(sqlSearch.default, sqlSearch.values);

  if (sqlRes.state !== 1) {
    return handleResult({ ctx, status: 500, data: sqlRes.error, tips: sqlRes.msg });
  }
  // console.log("/getList 查询", sqlRes.results);
  const list = sqlRes.results.length > 0 ? arrayItemToHump(sqlRes.results) : [];
  handleResult({ ctx, data: { list } });
});

// 添加列表
router.post("/todo/add", handleToken, async (ctx) => {
  const auth = ctx.state.user;
  /** 接收参数 */
  const params = ctx.request.body as any;

  if (!params.content) {
    return handleResult({ ctx, data: {}, tips: "添加的列表内容不能为空！", status: 400 });
  }

  const sqlInsert = sqlInsertFormat({
    content: params.content,
    createUserId: auth.id,
    createTime: formatDate(),
  });

  // 写入列表
  const sqlRes = await query(`insert into todo_table(${sqlInsert.keys}) values(${sqlInsert.symbols})`, sqlInsert.values);

  console.log("写入列表", sqlRes);

  if (sqlRes.state !== 1) {
    return handleResult({ ctx, status: 500, data: { error: sqlRes.error }, tips: sqlRes.msg });
  }
  handleResult({ ctx, data: { id: sqlRes.results.insertId }, tips: "添加成功" });
});

// 修改列表
router.post("/todo/edit", handleToken, async (ctx) => {
  const auth = ctx.state.user;
  /** 接收参数 */
  const params = ctx.request.body as unknown as { id: number; content: string };

  if (!params.id) {
    return handleResult({ ctx, data: {}, tips: "列表id不能为空", status: 400 });
  }

  if (!params.content) {
    return handleResult({ ctx, data: {}, tips: "列表内容不能为空", status: 400 });
  }

  const sqlUpdate = sqlUpdateFormat({
    content: params.content,
    updateTime: formatDate(),
    updateUserId: auth.id,
  });

  // 修改列表
  const sqlRes = await query(`update todo_table ${sqlUpdate.text} where id = ?`, [...sqlUpdate.values, params.id]);
  // console.log("修改列表", sqlRes);

  if (sqlRes.state !== 1) {
    return handleResult({ ctx, status: 500, data: { error: sqlRes.error }, tips: sqlRes.msg });
  }
  if (sqlRes.results.affectedRows > 0) {
    handleResult({ ctx, data: {}, tips: "修改成功" });
  }
  else {
    handleResult({ ctx, data: {}, tips: "列表id不存在", status: 400 });
  }
});

// 删除列表
router.post("/todo/delete", handleToken, async (ctx) => {
  /** 接收参数 */
  const params = ctx.request.body as unknown as { id: number };

  // 从数据库中删除
  // const sqlRes = await query(`delete from todo_table where id='${params.id}' and user_id='${state.info.id}'`)
  const sqlRes = await query("delete from todo_table where id = ?", [params.id]);
  // const sqlRes = await query(`delete from todo_table where id in(${params.ids.toString()})`) // 批量删除

  // console.log("从数据库中删除", sqlRes);

  if (sqlRes.state !== 1) {
    return handleResult({ ctx, data: { error: sqlRes.error }, tips: sqlRes.msg, status: 500 });
  }
  if (sqlRes.results.affectedRows > 0) {
    handleResult({ ctx, data: {}, tips: "删除成功" });
  }
  else {
    handleResult({ ctx, data: {}, tips: "当前列表id不存在或已删除", status: 400 });
  }
});
