import * as Router from 'koa-router';       // learn: https://www.npmjs.com/package/koa-router
import stateInfo from './state';
import html from './template';

/** api路由模块 */
const router = new Router();

// '/*' 监听全部
router.get('/', (ctx, next) => {
    // 指定返回类型
    ctx.response.type = 'html';
    ctx.body = html;
    console.log('get 根目录');

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
router.post('/uploadImg', (ctx, next) => {
    /** 接收参数 */
    const params: object = ctx.request.body || ctx.params;

    console.log('上传图片', params);

    const result = {
        image: ''
    }

    ctx.body = stateInfo.getSuccessData(result, '上传成功');
})

export default router;