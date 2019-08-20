import * as Router from 'koa-router';       // learn: https://www.npmjs.com/package/koa-router
import * as FS from 'fs';
import * as PATH from 'path';
import config from './config';
import stateInfo from './state';
import html from './template';

/** api路由模块 */
const router = new Router();

// '/*' 监听全部
router.get('/', (ctx, next) => {
    // 指定返回类型
    ctx.response.type = 'html';
    ctx.body = html;
    console.log('根目录');

    // 302 重定向到其他网站
    // ctx.status = 302;
    // ctx.redirect('https://www.baidu.com');
})

// get 请求
router.get('/getHome', (ctx, next) => {
    /** 接收参数 */
    const params: object | string = ctx.query || ctx.querystring;

    console.log('get /getHome', params);

    ctx.body = stateInfo.getSuccessData({
        method: 'get',
        port: 1995,
        time: Date.now()
    });
})

// post 请求
router.post('/sendData', (ctx, next) => {
    /** 接收参数 */
    const params: object = ctx.request.body || ctx.params;

    console.log('post /sendData', params);

    const result = {
        data: '请求成功'
    }

    ctx.body = stateInfo.getSuccessData(result, 'post success')
})

// 上传图片
// learn: https://www.cnblogs.com/nicederen/p/10758000.html
// learn: https://blog.csdn.net/qq_24134853/article/details/81745104
router.post('/uploadImg', async (ctx, next) => {
    const file = ctx.request.files[config.upload_img_name];
    let fileName = ctx.request.body.name || `img_${ Date.now() }`;
    fileName = `${ fileName }.${file.name.split('.')[1]}`;

    // 创建可读流
    const render = FS.createReadStream(file.path);
    const filePath = PATH.join(config.upload_path, fileName);
    const fileDir = PATH.join(config.upload_path);

    if (!FS.existsSync(fileDir)) {
        FS.mkdirSync(fileDir);
    }

    // 创建写入流
    const upStream = FS.createWriteStream(filePath);

    render.pipe(upStream);

    // console.log(fileName, file);

    const result = {
        image: '',
        file: ''
    }

    /** 模拟上传到七牛云 */
    function uploadApi() {
        return new Promise(function(resolve, reject) {
            const delay = Math.floor(Math.random() * 5) * 100 + 500;
            setTimeout(() => {
                result.image = `http://${ ctx.headers.host }/${ config.upload_path }${ fileName }`;
                result.file = `${config.upload_path}${ fileName }`;
                resolve();
            }, delay);
        });
    }

    await uploadApi();

    ctx.body = stateInfo.getSuccessData(result, '上传成功');
})

export default router;