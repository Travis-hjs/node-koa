import * as Koa from 'koa';
import * as Router from 'koa-router';
import content from './modules/template';
import utils from './modules/utils';

const App = new Koa();
const router = new Router();

router.get('/*', (ctx, next) => {
    ctx.body = content;
    next().then(() => {
        utils.log('page success');
    })
});
App.use(router.routes());
// App.use((ctx, next) => {
//     ctx.body = content;
//     // console.log(ctx.response);
// });

App.listen(1995);
