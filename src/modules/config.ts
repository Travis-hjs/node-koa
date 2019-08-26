class ModuleConfig {

    /** 端口号 */
    public readonly port = 1995;

    /** 数据库配置 */
    public readonly db = {
        host: 'localhost',
        user: 'root',
        password: 'root',
        /** 数据库名 */
        database: 'test',
        /** 链接上限次数 */
        connection_limit: 10
    }

    /** 接口前缀 */
    public readonly api_prefix = '/api/v1/';

    /** 上传图片存放目录 */
    public readonly upload_path = 'public/upload/images/';

    /** 上传图片大小限制 */
    public readonly upload_img_size = 5 * 1024 * 1024;

    /**
     * 前端上传图片时约定的字段
     * @example 
     * const formData = new FormData()
     * formData.append('img', file)
     * XHR.send(formData)
     */
    public readonly upload_img_name = 'img';    

    /** 用户临时表 */
    public readonly user_file = 'public/user.json';

    /** token 长度 */
    public readonly token_size = 28;

    /** token 格式错误提示文字 */
    public readonly token_tip = '无效的token';
}

/** 项目配置 */
const config = new ModuleConfig();

export default config;