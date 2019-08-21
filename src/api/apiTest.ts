import router from './main';
import html from '../modules/template';
import stateInfo from '../modules/state';

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