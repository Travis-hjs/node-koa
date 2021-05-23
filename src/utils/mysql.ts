import * as mysql from "mysql";         // learn: https://www.npmjs.com/package/mysql
import config from "../modules/Config";

/** `mysql`查询结果 */
interface MsqlResult {
    /** `state === 1`时为成功 */
    state: number
    /** 结果数组 或 对象 */
    results: any
    /** 状态 */
    fields: Array<mysql.FieldInfo>
    /** 错误信息 */
    error: mysql.MysqlError
    /** 描述信息 */
    msg: string
}

/** 数据库链接池 */
const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
});

/**
 * 数据库增删改查
 * @param command 增删改查语句 [mysql语句参考](https://blog.csdn.net/gymaisyl/article/details/84777139)
 * @param value 对应的值
 */
export default function query(command: string, value?: Array<any>) {
    const result: MsqlResult = {
        state: 0,
        results: null,
        fields: null,
        error: null,
        msg: ""
    }
    return new Promise<MsqlResult>((resolve, reject) => {
        pool.getConnection((error: any, connection) => {
            if (error) {
                result.error = error;
                result.msg = "数据库连接出错";
                resolve(result);
            } else {
                const callback: mysql.queryCallback = (error: any, results, fields) => {
                    // pool.end();
                    connection.release();
                    if (error) {
                        result.error = error;
                        result.msg = "数据库增删改查出错";
                        resolve(result);
                    } else {
                        result.state = 1;
                        result.msg = "ok";
                        result.results = results;
                        result.fields = fields;
                        resolve(result);
                    }
                }

                if (value) {
                    pool.query(command, value, callback);
                } else {
                    pool.query(command, callback);
                }
            }
        });
    });
}
