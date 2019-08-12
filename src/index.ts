import * as Koa from 'koa';                     // learn: https://www.npmjs.com/package/koa
import * as Router from 'koa-router';           // learn: https://www.npmjs.com/package/koa-router
import * as bodyParser from 'koa-bodyparser';   // learn: https://www.npmjs.com/package/koa-bodyparser
import content from './modules/template';
import utils from './modules/utils';
import config from './modules/config';
import { getHomeData } from './views/home';

const App = new Koa();
const router = new Router();

// 先统一设置打开跨域
App.use(async (ctx, next) => {
    ctx.set({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    });
    // ctx.append('Content-Type', 'application/json');
    // ctx.type = 'application/json';
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
//     ctx.body = content;
//     // console.log(ctx.response);
// });

App.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
})

App.listen(config.port, () => {
    console.log(`server is running at http://localhost:${ config.port }`)
})

// '/*' 监听全部
router.get('/', (ctx, next) => {
    ctx.body = content;
    utils.log('get 根目录');
    
    // 302 重定向到其他网站
    // ctx.status = 302;
    // ctx.redirect('https://www.baidu.com');
})

router.get('/getHome', (ctx, next) => {
    /** 接收参数 */
    const params: object | string = ctx.query || ctx.querystring;
    utils.log('get /getHome', params);
    ctx.body = getHomeData();
})

router.post('/send', (ctx, next) => {
    /** 接收参数 */
    const params: object = ctx.request.body || ctx.params;
    utils.log('post /send', params);
    ctx.body = {
        data: 'success',
        code: 100
    }
})

// 参考项目配置连接: https://blog.csdn.net/weixin_33894640/article/details/91459845