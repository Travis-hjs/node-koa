import * as Koa from 'koa';
import * as Router from 'koa-router';
import content from './modules/template';
import utils from './modules/utils';
import { getHomeData } from './views/home';
import config from './modules/config';

const App = new Koa();
const router = new Router();

// '/*' 监听全部
router.get('/', (ctx, next) => {
    ctx.body = content
    // ctx.header = 302
    utils.log('get 根目录')
    // next()
})

router.get('/home', (ctx, next) => {
    // 路由接收参数
    utils.log('get /home', ctx.query, ctx.querystring)
    ctx.body = getHomeData();
    // next();
})

router.post('/send', (ctx, next) => {
    // ctx.set('Content-Type', 'application/json')
    utils.log('post /send', ctx.query, ctx.querystring, ctx.params)
    ctx.body = {
        success: 200,
        code: 100
    }
})

App.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*')
    await next()
});

App.use(router.routes())

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

// learn: https://blog.csdn.net/weixin_33894640/article/details/91459845