import type { User } from "../types/user.js";
import { handleResult, handleToken } from "../middleware/index.js";
import { generateToken, getUserRow } from "../modules/user.js";
import {
  checkType,
  formatDate,
  getRandomText,
  objectToHump,
  sqlInsertFormat,
  sqlUpdateFormat,
} from "../utils/index.js";
import { query } from "../utils/mysql.js";
import router from "./main.js";

const oneDay = 86400000;
/** 登录过期时间 */
const getExpireTime = () => Date.now() + (oneDay * 7);

// 注册
router.post("/register", async (ctx) => {
  /** 接收参数 */
  const params = ctx.request.body as unknown as User.Row;
  // console.log("注册传参", params);

  if (!/^[A-Z0-9]+$/i.test(params.account)) {
    return handleResult({ ctx, data: {}, tips: "注册失败！账号必须由英文或数字组成", status: 400 });
  }

  if (!/^[A-Z0-9]+$/i.test(params.password)) {
    return handleResult({ ctx, data: {}, tips: "注册失败！密码必须由英文或数字组成", status: 400 });
  }

  if (!params.name.trim()) {
    params.name = "用户未设置昵称";
  }

  // 先查询是否有重复账号
  const repeat = await getUserRow({ account: params.account });

  if (repeat.error) {
    return handleResult({ ctx, status: 500, data: `${repeat.error}`, tips: repeat.tips });
  }

  if (repeat.data) {
    return handleResult({ ctx, data: {}, tips: "该账号已存在" });
  }

  // 再写入表格
  // 暂无分组、用户类型、创建用户id；所以给以默认值，方便后面扩充使用
  const defaultValue = 1;
  const createTime = formatDate();
  const mysqlInfo = sqlInsertFormat({
    account: params.account,
    password: params.password,
    name: params.name,
    create_time: createTime,
    type: defaultValue,
    group_id: defaultValue,
    create_user_id: defaultValue,
    token_version: getRandomText(),
  });

  // const res = await query(`insert into user_table(${mysqlInfo.keys}) values(${mysqlInfo.values})`) 这样也可以，不过 mysqlInfo.values 每个值都必须用单引号括起来，下面的方式就不用
  const res = await query(`insert into user_table(${mysqlInfo.keys}) values(${mysqlInfo.symbols})`, mysqlInfo.values);

  if (res.state === 1) {
    handleResult({ ctx, data: params, tips: "注册成功" });
  }
  else {
    handleResult({ ctx, data: { error: res.error }, tips: res.msg, status: 500 });
  }
});

// 登录
router.post("/login", async (ctx) => {
  /** 接收参数 */
  const params = ctx.request.body as unknown as User.Row;
  // console.log("登录", params);
  if (!params.account || params.account.trim() === "") {
    return handleResult({ ctx, data: {}, tips: "登录失败！账号不能为空", status: 400 });
  }

  if (!params.password || params.password.trim() === "") {
    return handleResult({ ctx, data: {}, tips: "登录失败！密码不能为空", status: 400 });
  }

  // 先查询是否有当前账号
  const res = await query("select * from user_table where account = ?", [params.account]);

  // console.log("登录查询", res);

  if (res.state !== 1) {
    return handleResult({ ctx, data: { error: res.error }, tips: res.msg, status: 500 });
  }
  // 再判断账号是否可用
  if (!res.results.length) {
    return handleResult({ ctx, data: {}, tips: "该账号不存在，请先注册", code: 400 });
  }
  const userRow = objectToHump(res.results[0]) as User.Row;
  // 最后判断密码是否正确
  if (userRow.password.toString() === params.password.toString()) {
    const token = generateToken(userRow.id, userRow.tokenVersion, getExpireTime());
    handleResult({ ctx, data: { token }, tips: "登录成功" });
  }
  else {
    handleResult({ ctx, data: {}, tips: "密码不正确", code: 400 });
  }
});

// 获取用户信息
router.get("/getUserInfo", handleToken, async (ctx) => {
  const auth = ctx.state.user;

  const user = await getUserRow({ id: auth.id });

  if (user.error) {
    return handleResult({ ctx, status: 500, data: `${user.error}`, tips: user.tips });
  }

  if (!user.data) {
    return handleResult({ ctx, data: {}, tips: "用户不存在", code: -2 });
  }

  handleResult({ ctx, data: user.data });
});

// 编辑用户信息
router.post("/editUserInfo", handleToken, async (ctx) => {
  const auth = ctx.state.user;
  /** 接收参数 */
  const params = ctx.request.body as unknown as User.Row;

  if (!params.id) {
    return handleResult({ ctx, data: {}, tips: "用户id不正确", status: 400 });
  }

  if (params.account || !/^[A-Z0-9]+$/i.test(params.account)) {
    return handleResult({ ctx, data: {}, tips: "账号必须由英文或数字组成", status: 400 });
  }

  if (!params.password || !/^[A-Z0-9]+$/i.test(params.password)) {
    return handleResult({ ctx, data: {}, tips: "密码必须由英文或数字组成", status: 400 });
  }

  if (checkType(params.groupId) !== "number") {
    return handleResult({ ctx, data: {}, tips: "分组类型不正确", status: 400 });
  }

  if (!params.name.trim()) {
    params.name = `用户未命名(${params.id})`;
  }

  const user = await getUserRow({ id: auth.id });

  if (user.error) {
    return handleResult({ ctx, status: 500, data: `${user.error}`, tips: "查询用户信息失败" });
  }

  if (!user.data) {
    return handleResult({ ctx, data: {}, tips: "当前操作用户不存在", code: -2 });
  }

  const self = params.id.toString() === auth.id.toString();

  if (user.data.type !== 0 && !self) {
    return handleResult({ ctx, data: {}, tips: "当前账号没有权限修改他人信息", code: -2 });
  }

  // 先查询是否有重复账号
  const repeat = await getUserRow({ account: params.account });

  if (repeat.error) {
    return handleResult({ ctx, status: 500, data: `${repeat.error}`, tips: `查询(${params.account})账号失败` });
  }

  if (!self && user.data.type !== 0) {
    return handleResult({ ctx, data: {}, tips: "当前账号没有权限修改他人信息", code: -2 });
  }

  if (self && repeat.data && repeat.data.id !== auth.id) {
    return handleResult({ ctx, data: {}, tips: "账号已存在" });
  }

  if (!self && user.data.type !== 0) {
    return handleResult({ ctx, data: {}, tips: "当前账号没有权限修改他人信息", code: -2 });
  }

  if (!self && repeat.data && repeat.data.id !== params.id) {
    return handleResult({ ctx, data: {}, tips: "账号已存在" });
  }

  const createTime = formatDate();
  const newVersion = getRandomText();
  const setData = sqlUpdateFormat({
    password: params.password,
    name: params.name,
    type: params.type,
    group_id: params.groupId,
    update_time: createTime,
    update_user_id: auth.id,
    token_version: newVersion,
  });

  const res = await query(`update user_table ${setData.text} where id = ?`, [...setData.values, params.id]);

  if (res.state !== 1) {
    return handleResult({ ctx, data: { error: res.error }, tips: res.msg, status: 500 });
  }
  const data: { token?: string } = {};
  // 判断是否修改自己信息，修改自己信息的时候重新返回一个新的 token
  if (self) {
    data.token = generateToken(auth.id, newVersion, getExpireTime());
  }
  handleResult({ ctx, data, tips: "编辑成功" });
});

// // 获取用户列表
// router.get("/getUserList", handleToken, async (ctx) => {

//   const auth = ctx.state.user;
//   // console.log("tokenInfo >>", tokenInfo);
//   const params: UserListParams = ctx.request.query as any;

//   const size = Number(params.pageSize) || 10;

//   const page = Number(params.currentPage) || 1;

//   /** 精确查询 */
//   const accuracyText = mysqlSearchParams({
//     "type": params.type
//   });

//   /** 模糊查询 */
//   const vagueText = mysqlSearchParams({
//     "name": params.name
//   }, true)

//   /** 查询语句 */
//   const searchText = (function () {
//     let result = "";

//     if (params.groupId) {
//       result += mysqlFindInSet("group_ids", [params.groupId]);
//     } else {
//       if ((tokenInfo.type >= 5)) {
//         result += mysqlFindInSet("group_ids", tokenInfo.groupIds.split(","));
//       }
//     }

//     if (accuracyText) {
//       result += `${result ? " and " : ""}${accuracyText}`;
//     }

//     if (vagueText) {
//       result += `${result ? " and " : ""}${vagueText}`;
//     }

//     if (result) {
//       result = `where ${result}`;
//     }

//     return result;
//   })();

//   /** 结果语句 */
//   const resultText = `${searchText} order by create_time desc limit ${size * (page - 1)}, ${size}`;
//   // const res = await query(`select * from user_table`)
//   const resultCountText = `select count(*) from user_table ${searchText.replace(/t2./g, "")}`;

//   const countRes = await query(resultCountText)

//   // console.log(selectUserTable + resultText);
//   // "select * from user_table" + resultText
//   // selectUserTable + resultText
//   // console.log("用户查询语句 >>", `select * from user_table ${resultText}`);
//   const res = await query(`select * from user_table ${resultText}`)
//   // console.log("获取用户列表 >>", res);

//   if (res.state === 1) {
//     const list: Array<UserRow> = res.results || [];
//     const result = [];
//     for (let i = 0; i < list.length; i++) {
//       const item = list[i];
//       if (item.type < tokenInfo.type) {
//         item.password = "******";
//       }
//       // 这里可以做分组名设置
//       group.matchGroupIds(item);
//       result.push(user.matchName(item as any));
//     }
//     bodyResult = apiSuccess({
//       pageSize: size,
//       currentPage: page,
//       total: countRes.results[0][`count(*)`],
//       list: result,
//       time: Date.now()
//     });
//   } else {
//     ctx.response.status = 500;
//     bodyResult = apiFail(res.msg, 500, res.error);
//   }

//   ctx.body = bodyResult;
// })

// 删除用户
router.post("/deleteUser", handleToken, async (ctx) => {
  const auth = ctx.state.user;

  /** 接收参数 */
  const params = ctx.request.body as unknown as User.Row;
  // console.log(params);
  if (typeof params.id !== "number") {
    return handleResult({ ctx, data: {}, tips: "用户 id 不正确", status: 400 });
  }

  const user = await getUserRow({ id: auth.id });

  if (user.error) {
    return handleResult({ ctx, status: 500, data: `${user.error}`, tips: user.tips });
  }

  if (!user.data) {
    return handleResult({ ctx, data: {}, tips: "当前操作用户不存在", code: -2 });
  }

  if (user.data.type !== 0) {
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
    handleResult({ ctx, data: {}, tips: "当前列表id不存在或已删除", code: 400 });
  }
});

// 退出登录
router.get("/logout", handleToken, async (ctx) => {
  const text = sqlUpdateFormat({ tokenVersion: "" }, true);
  const res = await query(`update user_table ${text.text} where id = ?`, [...text.values, ctx.state.user.id]);
  if (res.state !== 1) {
    return handleResult({ ctx, data: { error: res.error }, tips: res.msg, status: 500 });
  }
  handleResult({ ctx, data: {}, tips: "退出登录成功" });
});
