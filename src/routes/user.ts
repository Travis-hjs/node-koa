import router from "./main";
import { query } from "../utils/mysql";
import jwt from "../modules/Jwt";
import { handleToken } from "../middleware";
import { apiSuccess, apiFail } from "../utils/apiResult";
import utils from "../utils";
import tableUser from "../modules/TableUser";
import { ApiResult, TheContext } from "../types/base";
import { UserInfo } from "../types/user";

// 注册
router.post("/register", async (ctx) => {
  /** 接收参数 */
  const params: UserInfo = ctx.request.body;
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
  const res = await query(`select account from user_table where account='${params.account}'`)

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
    /** 暂无分组、用户类型、创建用户id；所以给以默认值，方便后面扩充使用 */
    const defaultValue = 1;
    const createTime = utils.formatDate();
    const mysqlInfo = utils.mysqlFormatParams({
      "account": params.account,
      "password": params.password,
      "name": params.name,
      "create_time": createTime,
      "type": defaultValue,
      "group_id": defaultValue,
      "create_user_id": defaultValue
    })

    // const res = await query(`insert into user_table(${mysqlInfo.keys}) values(${mysqlInfo.values})`) 这样也可以，不过 mysqlInfo.values 每个值都必须用单引号括起来，下面的方式就不用
    const res = await query(`insert into user_table(${mysqlInfo.keys}) values(${mysqlInfo.symbols})`, mysqlInfo.values)

    if (res.state === 1) {
      bodyResult = apiSuccess(params, "注册成功");
      const userId: number = res.results.insertId;
      tableUser.add(userId, {
        id: userId,
        account: params.account,
        password: params.password,
        name: params.name,
        type: defaultValue,
        groupId: defaultValue,
        createUserId: defaultValue,
        createTime: createTime,
      })
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
  const params: UserInfo = ctx.request.body;
  /** 返回结果 */
  let bodyResult: ApiResult;
  // console.log("登录", params);
  if (!params.account || params.account.trim() === "") {
    return ctx.body = apiSuccess({}, "登录失败！账号不能为空", 400);
  }

  if (!params.password || params.password.trim() === "") {
    return ctx.body = apiSuccess({}, "登录失败！密码不能为空", 400);
  }

  // 先查询是否有当前账号
  const res = await query(`select * from user_table where account='${params.account}'`)

  // console.log("登录查询", res);

  if (res.state === 1) {
    // 再判断账号是否可用
    if (res.results.length > 0) {
      const data = utils.objectToHump(res.results[0]) as UserInfo;
      // console.log("login UserInfo >>", data);
      // 最后判断密码是否正确
      if (data.password == params.password) {
        data.token = jwt.createToken({
          id: data.id,
          account: data.account,
          password: data.password,
          type: data.type,
          groupId: data.groupId,
        })
        bodyResult = apiSuccess(data, "登录成功");
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
router.get("/getUserInfo", handleToken, async (ctx: TheContext) => {

  const tokenInfo = ctx["theToken"];
  // /** 接收参数 */
  // const params = ctx.request.body;
  /** 返回结果 */
  let bodyResult: ApiResult;

  // console.log("getUserInfo >>", tokenInfo);

  const res = await query(`select * from user_table where account='${tokenInfo.account}'`)

  // console.log("获取用户信息 >>", res);

  if (res.state === 1) {
    // 判断账号是否可用
    if (res.results.length > 0) {
      const data: UserInfo = res.results[0];
      bodyResult = apiSuccess(utils.objectToHump(data));
    } else {
      bodyResult = apiSuccess({}, "该账号不存在，可能已经从数据库中删除", 400);
    }
  } else {
    ctx.response.status = 500;
    bodyResult = apiFail(res.msg, 500, res.error);
  }

  ctx.body = bodyResult;
})

// 编辑用户信息
router.post("/editUserInfo", handleToken, async (ctx: TheContext) => {
  const tokenInfo = ctx["theToken"];
  /** 接收参数 */
  const params: UserInfo = ctx.request.body;
  /** 返回结果 */
  let bodyResult: ApiResult;
  /** 账号是否可用 */
  let validAccount = false;
  // console.log("注册传参", params);

  if (!params.id) {
    ctx.response.status = 400;
    return ctx.body = apiSuccess({}, "编辑失败！用户id不正确", 400);
  }

  if (!params.account || !/^[A-Za-z0-9]+$/.test(params.account)) {
    ctx.response.status = 400;
    return ctx.body = apiSuccess({}, "编辑失败！账号必须由英文或数字组成", 400);
  }

  if (!params.password || !/^[A-Za-z0-9]+$/.test(params.password)) {
    ctx.response.status = 400;
    return ctx.body = apiSuccess({}, "编辑失败！密码必须由英文或数字组成", 400);
  }

  if (utils.checkType(params.groupId) !== "number") {
    ctx.response.status = 400;
    return ctx.body = apiSuccess({}, "编辑失败！分组不正确", 400);
  }

  if (!params.name.trim()) {
    params.name = "用户-" + utils.formatDate(Date.now(), "YMDhms");
  }

  if (tableUser.getUserById(params.id)) {
    validAccount = true;
    for (const iterator of tableUser.table) {
      const user = iterator[1];
      if (user.account == params.account && user.id != params.id) {
        validAccount = false;
        bodyResult = apiSuccess({}, "当前账户已存在", -1);
        break;
      } 
    }
  } else {
    bodyResult = apiSuccess({}, "当前用户 id 不存在", -1);
  }

  // 再写入表格
  if (validAccount) {
    const createTime = utils.formatDate();
    const setData = utils.mysqlSetParams({
      "account": params.account,
      "password": params.password,
      "name": params.name,
      "type": params.type,
      "group_id": params.groupId,
      "update_time": createTime,
      "update_user_id": tokenInfo.id
    })

    // console.log("修改用户信息语句 >>", `update user_table ${setData} where id = '${params.id}'`);
    const res = await query(`update user_table ${setData} where id = '${params.id}'`)
    // console.log("再写入表格 >>", res);

    if (res.state === 1) {
      const data: { token?: string } = {};
      tableUser.updateById(params.id, {
        password: params.password,
        name: params.name,
        type: params.type,
        groupId: params.groupId,
        updateUserId: tokenInfo.id,
        updateTime: createTime,
      })
      // 判断是否修改自己信息
      if (params.id == tokenInfo.id) {
        data.token = jwt.createToken({
          id: params.id,
          account: params.account,
          password: params.password,
          type: params.type,
          groupId: params.groupId,
        })
      }
      bodyResult = apiSuccess(data, "编辑成功");
    } else {
      ctx.response.status = 500;
      bodyResult = apiFail(res.msg, 500, res.error);
    }
  }

  ctx.body = bodyResult;
})

// // 获取用户列表
// router.get("/getUserList", handleToken, async (ctx: TheContext) => {

//   const tokenInfo = ctx["theToken"];
//   // console.log("tokenInfo >>", tokenInfo);
//   const params: UserListParams = ctx.request.query as any;

//   const size = Number(params.pageSize) || 10;

//   const page = Number(params.currentPage) || 1;

//   /** 精确查询 */
//   const accuracyText = utils.mysqlSearchParams({
//     "type": params.type
//   });

//   /** 模糊查询 */
//   const vagueText = utils.mysqlSearchParams({
//     "name": params.name
//   }, true)

//   /** 查询语句 */
//   const searchText = (function () {
//     let result = "";

//     if (params.groupId) {
//       result += utils.mysqlFindInSet("group_ids", [params.groupId]);
//     } else {
//       if ((tokenInfo.type >= 5)) {
//         result += utils.mysqlFindInSet("group_ids", tokenInfo.groupIds.split(","));
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

//   /** 返回结果 */
//   let bodyResult: ApiResult;

//   if (res.state === 1) {
//     const list: Array<UserInfo> = res.results || [];
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
router.post("/deleteUser", handleToken, async (ctx: TheContext) => {
  const tokenInfo = ctx["theToken"];

  /** 接收参数 */
  const params = ctx.request.body;
  // console.log(params);

  if (tokenInfo && tokenInfo.type != 0) {
    return ctx.body = apiSuccess({}, "当前账号没有权限删除用户", -1);
  }

  if (!params.id) {
    ctx.response.status = 400;
    return ctx.body = apiSuccess({}, "编辑失败！用户id不正确", 400);
  }

  /** 返回结果 */
  let bodyResult: ApiResult;

  // 从数据库中删除
  const res = await query(`delete from user_table where id = '${params.id}'`)
  // console.log("获取用户列表 >>", res);

  if (res.state === 1) {
    if (res.results.affectedRows > 0) {
      bodyResult = apiSuccess({}, "删除成功");
      tableUser.remove(params.id);
      // 异步删除所有关联到的表单数据即可，不需要等待响应
      // query(`delete from street_shop_table where user_id='${params.id}'`)
    } else {
      bodyResult = apiSuccess({}, "当前列表id不存在或已删除", 400);
    }
  } else {
    ctx.response.status = 500;
    bodyResult = apiFail(res.msg, 500, res.error);
  }

  ctx.body = bodyResult;
})

// 退出登录
router.get("/logout", handleToken, ctx => {

  const token: string = ctx.header.authorization;

  if (token) {
    return ctx.body = apiSuccess({}, "退出登录成功");
  } else {
    return ctx.body = apiSuccess({}, "token 不存在", 400);
  }
})
