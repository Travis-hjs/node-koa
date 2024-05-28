import * as os from "os";

function getIPAdress() {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    const iface = interfaces[key];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
        return alias.address;
      }
    }
  }
}

class ModuleConfig {
  constructor() {
    const ip = getIPAdress();
    const devDomain = `http://${ip}`;
    this._ip = ip;
    this.origins = [
      `http://${this.publicIp}`,
      "http://huangjingsheng.gitee.io",
      // 本地开发
      devDomain + ":5050",
      devDomain + ":6060",
    ];
  }

  private _ip: string;
  
  /** 当前服务`ip`地址 */
  get ip() {
    return this._ip;
  }

  /** 服务器公网`ip` */
  readonly publicIp = "123.123.123";

  /** 服务器内网`ip` */
  readonly privateIp = "17.17.17.17";

  /** 是否开发模式 */
  get isDev() {
    return this.ip != this.privateIp;
  }

  /** 端口号 */
  get port() {
    return this.isDev ? 2019 : 80;
  }

  /** 数据库配置 */
  get db() {
    return {
      /**
       * 服务器中使用`localhost`或者`this.privateIp`，注意：`localhost`需要`mysql`配置才能使用，不确定是不是程序 bug；
       * 调试环境需要手动改成`this.publicIp`
       */
      host: this.isDev ? "localhost" : this.privateIp,
      /** 默认是`root`除非在服务器配置时有修改过 */
      user: "root",
      /** 这个密码是服务器配置的时候设置的 */
      password: this.isDev ? "DRsXT5ZJ6Oi55LPQ" : "服务器密码",
      /** 数据库名 */
      database: "node_ts",
      /** 链接上限次数 */
      maxLimit: 10
    }
  }

  /** 允许访问的域名源 */
  readonly origins: Array<string>

  /** 
   * 接口前缀
   * - 注意！！！可以为空`""`，但不能写成`"/"`
   */
  readonly apiPrefix = "/api";

  /** 上传文件存放目录 */
  readonly uploadPath = "public/upload/";

  /** 上传文件大小限制 */
  readonly uploadImgSize = 5 * 1024 * 1024;

  /**
   * 前端上传文件时约定的字段
   * @example 
   * const formData = new FormData()
   * formData.append("file", file)
   * XHR.send(formData)
   */
  readonly uploadName = "file";

  /**
   * 路由路径，加上接口前缀处理
   * @param path 
   */
  getRoutePath(path: string) {
    return this.apiPrefix + path;
  }
}

/** 项目配置 */
const config = new ModuleConfig();

export default config;
