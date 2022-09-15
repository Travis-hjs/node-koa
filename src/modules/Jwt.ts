import tableUser from "./TableUser";
import { apiSuccess } from "../utils/apiResult";
import { TheContext, ApiResult } from "../types/base";
import { UserInfoToken, UserInfo } from "../types/user";

class ModuleJWT {
  constructor() {
    // tableUser.update();
  }

  /** 效期（小时） */
  private maxAge = 24 * 7;

  /** 前缀长度 */
  private prefixSize = 8;

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
      o: Date.now()
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
    /** 是否失败的`token` */
    let fail = false;
    /** 检测结果信息 */
    let info: ApiResult<{}>;
    /**
     * 设置失败信息
     * @param msg 
     */
    function setFail(msg: string) {
      fail = true;
      ctx.response.status = 401;
      info = apiSuccess({}, msg, -1);
    }

    if (!token) {
      setFail("缺少 token");
    }

    if (token && token.length < this.prefixSize * 2) {
      setFail("token 错误");
    }

    if (!fail) {
      /** 准备解析的字符串 */
      const str = Buffer.from(token.slice(this.prefixSize), "base64").toString("utf-8");

      /** 解析出来的结果 */
      let result: UserInfoToken;

      try {
        result = JSON.parse(str);
      } catch (error) {
        console.log("错误的 token 解析", error);
        setFail("token 错误");
      }

      if (!fail) {
        if (result.o && Date.now() - result.o < this.maxAge * 3600000) {
          const info = tableUser.getUserById(result.i);
          // console.log("userInfo >>", info);
          // console.log("token 解析 >>", result);
          if (info) {
            // 设置`token`信息到上下文中给接口模块里面调用
            // 1. 严格判断账号、密码、用户权限等是否相同
            // 2. 后台管理修改个人信息之后需要重新返回`token`
            if (info.password == result.p && info.groupId == result.g && info.type == result.t) {
              ctx["theToken"] = info;
            } else {
              setFail("token 已失效");
            }
          } else {
            setFail("token 不存在");
          }
        } else {
          setFail("token 过期");
        }
      }
    }

    return {
      fail,
      info
    }
  }

}

/** `jwt-token`模块 */
const jwt = new ModuleJWT();

export default jwt;
