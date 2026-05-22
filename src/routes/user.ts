import type { PageInfo } from "../types/common.js";
import type { User } from "../types/user.js";
import { handleAuth, handleResult } from "../middleware/index.js";
import { generateToken, getUserRow } from "../modules/user.js";
import {
  arrayItemToHump,
  checkType,
  formatDate,
  getRandomText,
  sqlInsertFormat,
  sqlUpdateFormat,
} from "../utils/index.js";
import { getSqlSearch, isDuplicateEntryError, query } from "../utils/mysql.js";
import router from "./main.js";

const oneDay = 86400000;
/**
 * 登录过期时间
 * - 不传该方法时，token 验证将不会校验过期时间
 */
const getExpireTime = () => Date.now() + (oneDay * 7);

// 注册
router.post("/register", async (ctx) => {
  /** 接收参数 */
  const params = ctx.request.body as unknown as User.Row;
  // console.log("注册传参", params);

  if (!params.account || !/^[A-Z0-9]+$/i.test(params.account)) {
    return handleResult({ ctx, data: {}, tips: "注册失败！账号必须由英文或数字组成", status: 400 });
  }

  if (!params.password || !/^[A-Z0-9]+$/i.test(params.password)) {
    return handleResult({ ctx, data: {}, tips: "注册失败！密码必须由英文或数字组成", status: 400 });
  }

  if (!params.name || !params.name.trim()) {
    params.name = "用户未设置昵称";
  }

  // 先查询是否有重复账号
  const repeat = await getUserRow({ account: params.account });

  if (repeat.error) {
    return handleResult({ ctx, status: 500, data: `${repeat.error}`, tips: repeat.tips });
  }

  if (repeat.data) {
    return handleResult({ ctx, data: {}, tips: "该账号已存在", code: -2 });
  }

  // 再写入表格
  // 暂无分组、用户类型、创建用户id；所以给以默认值，方便后面扩充使用
  const defaultValue = 1;
  const createTime = formatDate();
  const sqlInsert = sqlInsertFormat({
    account: params.account,
    password: params.password,
    name: params.name,
    createTime,
    type: defaultValue,
    groupId: defaultValue,
    createUserId: defaultValue,
    tokenVersion: getRandomText(),
  });

  // const sqlRes = await query(`insert into user_table(${sqlInsert.keys}) values(${sqlInsert.values})`) 这样也可以，不过 sqlInsert.values 每个值都必须用单引号括起来，下面的方式就不用
  const sqlRes = await query(`insert into user_table(${sqlInsert.keys}) values(${sqlInsert.symbols})`, sqlInsert.values);

  if (sqlRes.state !== 1) {
    // 在并发情况下，应用级别的预检查是不够的，因此还需要处理数据库冲突。
    if (isDuplicateEntryError(sqlRes.error)) {
      return handleResult({ ctx, data: {}, tips: "账号已存在", code: -2, status: 400 });
    }
    return handleResult({ ctx, data: { error: sqlRes.error }, tips: sqlRes.msg, status: 500 });
  }

  handleResult({ ctx, data: { id: sqlRes.results.insertId }, tips: "注册成功" });
});

// 登录
router.post("/login", async (ctx) => {
  const params = ctx.request.body as unknown as User.Row;

  if (!params.account || params.account.trim() === "") {
    return handleResult({ ctx, data: {}, tips: "登录失败！账号不能为空", status: 400 });
  }

  if (!params.password || params.password.trim() === "") {
    return handleResult({ ctx, data: {}, tips: "登录失败！密码不能为空", status: 400 });
  }

  // 先查询是否有当前账号
  const user = await getUserRow({ account: params.account });

  if (user.error) {
    return handleResult({ ctx, status: 500, data: `${user.error}`, tips: user.tips });
  }

  // 再判断账号是否可用
  if (!user.data) {
    return handleResult({ ctx, data: {}, tips: "该账号不存在，请先注册", code: 400 });
  }

  const userRow = user.data;

  // 最后判断密码是否正确
  if (userRow.password.toString() !== params.password.toString()) {
    return handleResult({ ctx, data: {}, tips: "密码不正确", code: 400 });
  }

  const token = generateToken(userRow.id, userRow.tokenVersion, getExpireTime());

  handleResult({ ctx, data: { token }, tips: "登录成功" });
});

// 退出登录
router.get("/logout", handleAuth, async (ctx) => {
  const text = sqlUpdateFormat({ tokenVersion: getRandomText() }, true);
  const updateRes = await query(`update user_table ${text.text} where id = ?`, [...text.values, ctx.state.user.id]);
  if (updateRes.state !== 1) {
    return handleResult({ ctx, data: { error: updateRes.error }, tips: updateRes.msg, status: 500 });
  }
  handleResult({ ctx, data: {}, tips: "退出登录成功" });
});

// 修改用户信息
router.post("/user/update", (ctx, next) => handleAuth(ctx, next, ["type"]), async (ctx) => {
  const auth = ctx.state.user;
  const params = ctx.request.body as unknown as User.Row;
  const update: Partial<User.Row> = {
    updateTime: formatDate(),
    updateUserId: auth.id,
  };

  if (!params.id) {
    return handleResult({ ctx, data: {}, tips: "缺少用户id", status: 400 });
  }

  const self = params.id === auth.id;

  if (params.password !== undefined) {
    if (!/^[A-Z0-9]+$/i.test(params.password)) {
      return handleResult({ ctx, data: {}, tips: "密码必须由英文或数字组成", status: 400 });
    }
    update.password = params.password;
  }

  if (params.name !== undefined) {
    update.name = params.name;
  }

  const isAdmin = auth.type === 0;

  if (!isAdmin && !self) {
    return handleResult({ ctx, data: {}, tips: "只有管理员才能修改他人信息", code: -2 });
  }

  if (!self) {
    const targetUser = await getUserRow({ id: params.id });

    if (targetUser.error) {
      return handleResult({ ctx, status: 500, data: `${targetUser.error}`, tips: "查询目标用户信息失败" });
    }

    if (!targetUser.data) {
      return handleResult({ ctx, data: {}, tips: "目标用户不存在", status: 400 });
    }
  }

  if (params.groupId !== undefined) {
    if (checkType(params.groupId) !== "number") {
      return handleResult({ ctx, data: {}, tips: "分组类型不正确", status: 400 });
    }
    if (!isAdmin) {
      return handleResult({ ctx, data: {}, tips: "只有管理员才能修改分组", status: 400 });
    }
    update.groupId = params.groupId;
  }

  if (params.type !== undefined) {
    if (checkType(params.type) !== "number") {
      return handleResult({ ctx, data: {}, tips: "分组类型不正确", status: 400 });
    }
    if (!isAdmin) {
      return handleResult({ ctx, data: {}, tips: "只有管理员才能修改分组", status: 400 });
    }
    update.type = params.type;
  }

  if (params.account !== undefined) {
    if (!/^[A-Z0-9]+$/i.test(params.account)) {
      return handleResult({ ctx, data: {}, tips: "账号必须由英文或数字组成", status: 400 });
    }

    const repeat = await getUserRow({ account: params.account });

    if (repeat.error) {
      return handleResult({ ctx, status: 500, data: `${repeat.error}`, tips: `查询账号 (${params.account}) 失败` });
    }

    if (repeat.data && repeat.data.id !== params.id) {
      return handleResult({ ctx, data: {}, tips: "账号已被注册", status: 400 });
    }

    update.account = params.account;
  }

  const needUpdateToken = update.account !== undefined
    || update.password !== undefined
    || update.groupId !== undefined
    || update.type !== undefined;

  if (needUpdateToken) {
    update.tokenVersion = getRandomText();
  }

  const sqlUpdate = sqlUpdateFormat(update);
  const sqlRes = await query(`update user_table ${sqlUpdate.text} where id = ?`, [...sqlUpdate.values, params.id]);

  if (sqlRes.state !== 1) {
    // 并发账户更新也应依赖数据库唯一索引作为最终保障。.
    if (isDuplicateEntryError(sqlRes.error)) {
      return handleResult({ ctx, data: {}, tips: "账号已存在", status: 400 });
    }
    return handleResult({ ctx, data: { error: sqlRes.error }, tips: sqlRes.msg, status: 500 });
  }

  if (sqlRes.results.affectedRows === 0) {
    return handleResult({ ctx, data: {}, tips: "修改的用户不存在", status: 400 });
  }

  const data: { token?: string } = {};

  if (self && needUpdateToken) {
    data.token = generateToken(auth.id, update.tokenVersion!, getExpireTime());
  }

  handleResult({ ctx, data, tips: "编辑成功" });
});

// 删除用户
router.post("/user/delete", (ctx, next) => handleAuth(ctx, next, ["type"]), async (ctx) => {
  const auth = ctx.state.user;

  /** 接收参数 */
  const params = ctx.request.body as unknown as User.Row;
  // console.log(params);
  if (typeof params.id !== "number") {
    return handleResult({ ctx, data: {}, tips: "用户 id 不正确", status: 400 });
  }

  if (auth.type !== 0) {
    return handleResult({ ctx, data: {}, tips: "当前账号没有权限删除用户", code: -1 });
  }

  // 从数据库中删除
  const res = await query("delete from user_table where id = ?", [params.id]);
  // console.log("获取用户列表 >>", res);

  if (res.state !== 1) {
    return handleResult({ ctx, data: { error: res.error }, tips: res.msg, status: 500 });
  }
  if (res.results.affectedRows > 0) {
    handleResult({ ctx, data: {}, tips: "删除成功" });
    // 异步删除所有关联到的表单数据即可，不需要等待响应
    // query(`delete from street_shop_table where user_id='${params.id}'`)
  }
  else {
    handleResult({ ctx, data: {}, tips: "当前用户不存在或已删除", code: 400 });
  }
});

// 获取用户信息
router.get("/user/info", (ctx, next) => handleAuth(ctx, next, true), async (ctx) => {
  const auth = ctx.state.user;

  delete auth.password;
  delete auth.tokenVersion;

  handleResult({ ctx, data: auth, tips: "ok" });
});

interface UserListParams extends User.Row, PageInfo {
  startTime: string;
  endTime: string;
}

// 获取用户列表
router.get("/user/list", (ctx, next) => handleAuth(ctx, next, ["type"]), async (ctx) => {
  const auth = ctx.state.user;
  const params = ctx.request.query as unknown as UserListParams;

  const page = params.currentPage || 1;
  const size = params.pageSize || 10;
  const sqlSearch = getSqlSearch({
    name: "user_table",
    vague: {
      name: params.name,
      account: params.account,
    },
    accurate: {
      id: params.id,
      type: params.type,
      groupId: params.groupId,
    },
    dateRange: {
      key: "createTime",
      start: params.startTime,
      end: params.endTime,
    },
    desc: ["createTime"],
    page,
    size,
  });

  const [sqlRes, sqlCount] = await Promise.all([
    query(sqlSearch.default, sqlSearch.values),
    query<Array<{ total: number }>>(sqlSearch.count, sqlSearch.values),
  ]);
  // console.log("查询语句 >>", sqlSearch);
  // console.log(sqlRes.results, sqlCount.results);

  if (sqlRes.state !== 1) {
    return handleResult({ ctx, status: 500, data: sqlRes.error, tips: sqlRes.msg });
  }

  if (sqlCount.state !== 1) {
    return handleResult({ ctx, status: 500, data: sqlCount.error, tips: sqlCount.msg });
  }

  const list: Array<User.Row> = sqlRes.results.length > 0 ? arrayItemToHump(sqlRes.results) : [];

  list.forEach((row) => {
    if (auth.type !== 0) {
      row.password = undefined;
    }
    row.createTime = formatDate(row.createTime);
    if (row.updateTime) {
      row.updateTime = formatDate(row.updateTime);
    }
    row.tokenVersion = undefined;
    // TODO: 这里可以为查询出来的数据做分组和类型映射
  });

  handleResult({
    ctx,
    data: {
      list,
      pageSize: size,
      currentPage: page,
      total: sqlCount.results[0].total || 0,
    },
  });
});
