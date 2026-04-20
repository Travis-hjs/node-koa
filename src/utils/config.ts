import os from "node:os";

function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    const iface = interfaces[key]!;
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
        return alias.address;
      }
    }
  }
}

/** 项目配置 */
export const config = (function () {
  const environment = process.env.mode as "dev" | "prod" || "dev";
  const ipAddress = getIPAddress();
  const devDomain = `http://${ipAddress}`;

  const origins = [
    "http://your-project.com",
    // 本地开发
    devDomain + ":5050",
    devDomain + ":6060",
  ];

  /** 服务器公网`ip` */
  const publicIp = "123.123.123";
  /** 服务器内网`ip` */
  const privateIp = "";
  
  return {
    /** 当前环境 */
    get env() {
      return environment;
    },
    /** 当前服务`ip`地址 */
    get ip() {
      return ipAddress;
    },
    /** 端口号 */
    get port() {
      return environment === "dev" ? 2019 : 80;
    },
    /** 允许访问的域名源 */
    get origins() {
      return origins;
    },
    /** 数据库配置 */
    get db() {
      return {
        /**
         * 服务器中使用`localhost`或者`privateIp`，注意：`localhost`需要`mysql`配置才能使用，不确定是不是程序 bug；
         * 调试环境需要手动改成`publicIp`
         */
        // host: env === "dev" ? "localhost" : privateIp,
        host: "localhost",
        /** 默认是`root`除非在服务器配置时有修改过 */
        user: "root",
        /** 这个密码是服务器配置的时候设置的 */
        password: environment === "dev" ? "DRsXT5ZJ6Oi55LPQ" : "服务器密码",
        /** 数据库名 */
        database: "node_ts",
        /** 链接上限次数 */
        maxLimit: 10,
      }
    },
    /** 
     * 接口前缀
     * - 注意！！！可以为空`""`，但不能写成`"/"`
     */
    get apiPrefix() {
      return "/api";
    },
    /** 上传文件存放目录 */
    get uploadPath() {
      return "public/upload/";
    },
    /** 上传文件大小限制 */
    get uploadImgLimit() {
      return 5 * 1024 * 1024;
    },
    /**
     * 前端上传文件时约定的字段
     * @example 
     * const formData = new FormData();
     * formData.append("file", file);
     * XHR.send(formData);
     */
    get uploadName() {
      return "file";
    },
    /**
     * 路由路径，加上接口前缀处理
     * @param path 
     */
    getRoutePath(path: string) {
      return this.apiPrefix + path;
    }
  }
})();
