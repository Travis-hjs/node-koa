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
    this.ip = getIPAdress();
    const devDomain = `http://${this.ip}`;
    this.origins.push(devDomain);
  }

  /** 当前服务`ip`地址 */
  readonly ip: string;

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
    return this.isDev ? 1995 : 80;
  }

  /** 数据库配置 */
  readonly db = {
    host: "localhost",
    user: "root",
    password: "root",
    /** 数据库名 */
    database: "node_ts",
    /** 链接上限次数 */
    maxLimit: 10
  }

  /** 允许访问的域名源 */
  readonly origins = [
    `http://${this.publicIp}`,
    "http://huangjingsheng.gitee.io"
  ]

  /** 接口前缀 */
  readonly apiPrefix = ""; // "/api";

  /** 上传图片存放目录 */
  readonly uploadPath = "public/upload/images/";

  /** 上传图片大小限制 */
  readonly uploadImgSize = 5 * 1024 * 1024;

  /**
   * 前端上传图片时约定的字段
   * @example 
   * const formData = new FormData()
   * formData.append("img", file)
   * XHR.send(formData)
   */
  readonly uploadImgName = "img";

}

/** 项目配置 */
const config = new ModuleConfig();

export default config;
