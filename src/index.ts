import * as Koa from 'koa';                     // learn: https://www.npmjs.com/package/koa
import * as Router from 'koa-router';           // learn: https://www.npmjs.com/package/koa-router
import * as bodyParser from 'koa-bodyparser';   // learn: https://www.npmjs.com/package/koa-bodyparser
import html from './modules/template';
import utils from './modules/utils';
import config from './modules/config';
import stateInfo from './modules/state';

const App = new Koa();
const router = new Router();

// 先统一设置跨域访问
App.use(async (ctx, next) => {
    ctx.set({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    });
    ctx.response.type = 'application/json';
    // ctx.append('Content-Type', 'application/json');
    await next()
});

// 使用中间件接收 post 传参
App.use(bodyParser({
    enableTypes: ['json', 'form', 'text']
}));

// 开始使用路由
App.use(router.routes())

// 默认无路由模式
// App.use((ctx, next) => {
//     ctx.body = html;
//     // console.log(ctx.response);
// });

App.on('error', (err, ctx) => {
    console.error('server error !!!!!!!!!!!!!', err, ctx)
})

App.listen(config.port, () => {
    console.log(`server is running at http://localhost:${ config.port }`)
})

// '/*' 监听全部
router.get('/', (ctx, next) => {
    ctx.body = html;
    utils.log('get 根目录');
    
    // 302 重定向到其他网站
    // ctx.status = 302;
    // ctx.redirect('https://www.baidu.com');
})

// get 请求
router.get('/getHome', (ctx, next) => {
    /** 接收参数 */
    const params: object | string = ctx.query || ctx.querystring;

    utils.log('get /getHome', params);

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

    utils.log('post /sendData', params);
    
    const result = {
        data: '请求成功'
    }

    ctx.body = stateInfo.getSuccessData(result, 'post success')
})

// 上传图片
router.post('/uploadImg', (ctx, next) => {
    /** 接收参数 */
    const params: object = ctx.request.body || ctx.params;
    
    utils.log('上传图片', params);

    const result = {
        image: ''
    }

    ctx.body = stateInfo.getSuccessData(result, '上传成功');
    
})

// 参考项目配置连接: https://blog.csdn.net/weixin_33894640/article/details/91459845