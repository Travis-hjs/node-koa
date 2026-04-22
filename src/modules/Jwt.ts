import type { ApiResult, TheContext } from "../types/base.js";
import type { UserInfo, UserInfoToken } from "../types/user.js";
import { apiSuccess } from "../utils/apiResult.js";
import tableUser from "./TableUser.js";

class ModuleJWT {
  constructor() {
    // tableUser.update();
  }

  /** 效期（小时） */
  private readonly maxAge = 24 * 7;

  /** 前缀长度 */
  private readonly prefixSize = 8;

  /**
   * 通过用户信息创建`token`
   * @param info 用户信息
   */
  createToken(info: Omit<UserInfo, "name">) {
    const decode = JSON.stringify({
      i: info.id,
      a: info.account,
      p: info.password,
      t: info.type,
      g: info.groupId,
      o: Date.now(),
    } as UserInfoToken);
    // const decode = encodeURI(JSON.stringify(info))
    const base64 = Buffer.from(decode, "utf-8").toString("base64");
    const secret = Math.random().toString(36).slice(2).slice(0, this.prefixSize);
    return secret + base64;
  }

  /**
   * 检测需要`token`的接口状态
   * @param ctx `http`上下文
   */
  checkToken(ctx: TheContext) {
    const token: string = ctx.header.authorization;

    const setFail = (msg: string) => {
      ctx.response.status = 401;
      return {
        fail: true,
        info: apiSuccess({}, msg, -1) as ApiResult,
      };
    };

    if (!token) {
      return setFail("缺少 token");
    }

    if (token.length < this.prefixSize * 2) {
      return setFail("token 错误");
    }

    const str = Buffer.from(token.slice(this.prefixSize), "base64").toString("utf-8");

    let result: UserInfoToken;

    try {
      result = JSON.parse(str);
    }
    catch (error) {
      console.log("错误的 token 解析", error);
      return setFail("token 错误");
    }

    if (!result.o || Date.now() - result.o >= this.maxAge * 3600000) {
      return setFail("token 过期");
    }

    const info = tableUser.getUserById(result.i);
    // console.log("userInfo >>", info);
    // console.log("token 解析 >>", result);
    if (!info) {
      return setFail("token 不存在");
    }

    // 设置`token`信息到上下文中给接口模块里面调用
    // 1. 严格判断账号、密码、用户权限等是否相同
    // 2. 后台管理修改个人信息之后需要重新返回`token`
    if (
      info.password.toString() !== result.p.toString()
      || info.groupId.toString() !== result.g.toString()
      || info.type.toString() !== result.t.toString()
    ) {
      return setFail("token 已失效");
    }

    ctx.theToken = info;

    return {
      fail: false,
      info: undefined as ApiResult,
    };
  }
}

/** `jwt-token`模块 */
const jwt = new ModuleJWT();

export default jwt;
