class ModuleConfig {

    /** 端口号 */
    readonly port = 1995;

    /** 数据库配置 */
    readonly db = {
        host: "localhost",
        user: "root",
        password: "root",
        /** 数据库名 */
        database: "node_ts",
        /** 链接上限次数 */
        connection_limit: 10
    }

    /** 接口前缀 */
    readonly apiPrefix = "/api/v1/";

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

    /**
     * 用户临时表
     * @description `.gitignore`忽略文件也要添加该路径，因为`jwt`模块中做了动态创建处理，所以不需要代码同步该文件
    */
    readonly userFile = "public/user.json";

    /** `token`长度 */
    readonly tokenSize = 28;

    /** `token`格式错误提示文字 */
    readonly tokenTip = "无效的token";

    /** 服务端`ip`地址 */
    ip = "";
}

/** 项目配置 */
const config = new ModuleConfig();

export default config;