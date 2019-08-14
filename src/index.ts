import * as Koa from 'koa';                     // learn: https://www.npmjs.com/package/koa
import * as bodyParser from 'koa-bodyparser';   // learn: https://www.npmjs.com/package/koa-bodyparser
import config from './modules/config';
import router from './modules/api';

const App = new Koa();

// 先统一设置请求配置 => 跨域，请求头信息...
App.use(async (ctx, next) => {
    console.log('setting ---------------------------')

    ctx.set({
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    });

    // ctx.response.is('application/json');
    // ctx.is('application/json');
    // ctx.request.is('application/json');
    // ctx.response.set('Content-Type', 'application/json');
    // ctx.response.type = 'application/json';
    // ctx.type = 'application/json';

    try {
        await next();
    } catch (err) {
        ctx.response.status = err.statusCode || err.status || 500;
        ctx.response.body = {
            message: err.message
        }
    }
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
    console.log(`server is running at http://localhost:${config.port}`)
})

// 参考项目配置连接: https://blog.csdn.net/weixin_33894640/article/details/91459845