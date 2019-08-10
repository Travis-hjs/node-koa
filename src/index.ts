import * as Koa from 'koa';
import * as Router from 'koa-router';
import content from './modules/template';
import utils from './modules/utils';

const App = new Koa();
const router = new Router();

router.get('/*', ctx => {
    ctx.body = content;
});

App.use(router.routes());
// App.use((ctx, next) => {
//     ctx.body = content;
//     // console.log(ctx.response);
// });

App.listen(1995);

function timeout(time: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

async function asyncPrint(time: number) {
    utils.log('执行 asyncPrint')
    await timeout(time);
    utils.log('async');
}

asyncPrint(2000)