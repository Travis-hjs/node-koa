import router from './main';
import query from '../modules/mysql';
import stateInfo from '../modules/state';
import { mysqlErrorType, mysqlQueryType } from '../modules/interfaces';

/** mysql错误数据类型 */
type sqlerr = mysqlErrorType;
/** 数据库增删改查返回数据类型 */
type sqlsuc = mysqlQueryType;

// 注册
router.post('/register', async (ctx) => {
    /** 接收参数 */
    const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult = null;
    /** 账号是否可用 */
    let validAccount = false;
    // console.log('注册传参', params);

    if (!/^[A-Za-z0-9]+$/.test(params.account)) {
        return ctx.body = stateInfo.getFailData('注册失败！账号必须为6-12英文或数字组成');
    }

    if (!/^[A-Za-z0-9]+$/.test(params.password)) {
        return ctx.body = stateInfo.getFailData('注册失败！密码必须为6-12英文或数字组成');
    }

    if (!params.name.trim()) {
        params.name = '用户未设置昵称';
    }

    // 先查询是否有重复账号
    await query(`select account from user where account = '${ params.account }'`).then((res: sqlsuc) => {
        // console.log('注册查询', res);
        if (res.results.length > 0) {
            bodyResult = stateInfo.getFailData('该账号已被注册');
        } else {
            validAccount = true;
        }
    }).catch((error: sqlerr) => {
        // console.log('注册查询错误', error);
        bodyResult = stateInfo.getFailData(error.message);
    })

    // 再写入表格
    if (validAccount) {
        await query('insert into user(account, password, username) values(?,?,?)', [params.account, params.password, params.name]).then((res: sqlsuc) => {
            // console.log('注册写入', res);
            bodyResult = stateInfo.getSuccessData(params, '注册成功');
        }).catch((error: sqlerr) => {
            // console.log('注册写入错误', error);
            bodyResult = stateInfo.getFailData(error.message);
        })
    }
    
    ctx.body = bodyResult;
})

// 登录
router.post('/login', async (ctx) => {
    /** 接收参数 */
    const params = ctx.request.body;
    /** 返回结果 */
    let bodyResult = null;
    // console.log('登录', params);
    if (params.account.trim() === '') {
        return ctx.body = stateInfo.getFailData('登录失败！账号不能为空');
    }

    if (params.password.trim() === '') {
        return ctx.body = stateInfo.getFailData('登录失败！密码不能为空');
    }

    // 先查询是否有当前账号
    await query(`select * from user where account = '${ params.account }'`).then((res: sqlsuc) => {
        // console.log('登录查询', res.results);
        // 再判断账号是否可用
        if (res.results.length > 0) {
            const data = res.results[0];
            // 最后判断密码是否正确
            if (data.password == params.password) {
                bodyResult = stateInfo.getSuccessData(data ,'登录成功');
            } else {
                bodyResult = stateInfo.getFailData('密码不正确');
            }
        } else {
            bodyResult = stateInfo.getFailData('该账号不存在，请先注册');
        }
    }).catch((error: sqlerr) => {
        // console.log('登录查询错误', error);
        bodyResult = stateInfo.getFailData(error.message);
    })

    ctx.body = bodyResult;
})
