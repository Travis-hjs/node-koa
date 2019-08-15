import * as Koa from 'koa';                     // learn: https://www.npmjs.com/package/koa
import * as koaBody from 'koa-body';            // learn: http://www.ptbird.cn/koa-body.html
import config from './modules/config';
import router from './modules/api';

const App = new Koa();

/** 请求次数 */
let count = 1;

// 先统一设置请求配置 => 跨域，请求头信息...
App.use(async (ctx, next) => {
    console.log('--------------------------');
    console.log('start >>', count);
    count++;
    
    ctx.set({
        'Access-Control-Allow-Origin': '*',
        // 'Content-Type': 'application/json',
        // 'Access-Control-Allow-Credentials': 'true',
        // 'Access-Control-Allow-Methods': 'OPTIONS, GET, PUT, POST, DELETE',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        // 'X-Powered-By': '3.2.1'
    });
    
    // 如果前端设置了 XHR.setRequestHeader('Content-Type', 'application/json')
    // ctx.set 就必须携带 'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    // 并且这里要转换一下状态码
    // console.log(ctx.request.method);
    if (ctx.request.method === 'OPTIONS') {
        ctx.response.status = 200;
    }

    try {
        await next();
    } catch (err) {
        ctx.response.status = err.statusCode || err.status || 500;
        ctx.response.body = {
            message: err.message
        }
    }
});

// 使用中间件处理 post 传参 和上传图片
App.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: config.upload_img_size
    }
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

// 参考项目配置连接: https://juejin.im/post/5ce25993f265da1baa1e464f
// mysql learn: https://www.jianshu.com/p/d54e055db5e0