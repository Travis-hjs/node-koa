class ModuleConfig {

    /** 端口号 */
    public readonly port = 1995;

    /** 数据库配置 */
    public readonly db = {
        host: "localhost",
        user: "root",
        password: "root",
        /** 数据库名 */
        database: "node_ts",
        /** 链接上限次数 */
        connection_limit: 10
    }

    /** 接口前缀 */
    public readonly apiPrefix = "/api/v1/";

    /** 上传图片存放目录 */
    public readonly uploadPath = "public/upload/images/";

    /** 上传图片大小限制 */
    public readonly uploadImgSize = 5 * 1024 * 1024;

    /**
     * 前端上传图片时约定的字段
     * @example 
     * const formData = new FormData()
     * formData.append("img", file)
     * XHR.send(formData)
     */
    public readonly uploadImgName = "img";  

    /**
     * 用户临时表
     * @description `.gitignore`忽略文件也要添加该路径，因为`session`模块中做了动态创建处理，所以不需要代码同步该文件
    */
    public readonly userFile = "public/user.json";

    /** `token`长度 */
    public readonly tokenSize = 28;

    /** `token`格式错误提示文字 */
    public readonly tokenTip = "无效的token";

}

/** 项目配置 */
const config = new ModuleConfig();

export default config;