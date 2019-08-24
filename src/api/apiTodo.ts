import router from './main';
import query from '../modules/mysql';
import stateInfo from '../modules/state';
import session from '../modules/session';
import config from '../modules/config';
import { mysqlQueryType, mysqlErrorType } from '../modules/interfaces';

// 获取所有列表
router.get('/getList', async (ctx) => {
    const token: string = ctx.header.authorization;
    /** 返回结果 */
    let bodyResult = null;
    
    console.log('getList', token);

    if (token.length != config.token_size) {
        return ctx.body = stateInfo.getFailData('token 不正确');
    }

    let state = session.updateRecord(token);

    if (!state.success) {
        return ctx.body = stateInfo.getFailData(state.message);
    }

    // 这里要开始连表查询
    await query('').then((res: mysqlQueryType) => {

    }).catch((err: mysqlErrorType) => {

    })

    ctx.body = bodyResult;
})