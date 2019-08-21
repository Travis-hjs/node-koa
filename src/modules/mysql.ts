import * as mysql from 'mysql';         // learn: https://www.npmjs.com/package/mysql
import config from './config';
import { mysqlErrorType } from './interfaces';

/** 数据库 */
const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
});

/**
 * 数据库增删改查
 * @param command 增删改查语句
 * @param value 对应的值
 */
export default function query(command: string, value?: Array<any>): Promise<any> {
    /** 错误信息 */
    let errorInfo: mysqlErrorType = null;

    return new Promise((resolve, reject) => {
        pool.getConnection((error: any, connection) => {
            if (error) {
                errorInfo = {
                    info: error,
                    message: '数据库连接出错'
                }
                reject(errorInfo);
            } else {
                const callback: mysql.queryCallback = (error: any, results, fields) => {
                    // pool.end(); 
                    connection.release();
                    if (error) {
                        errorInfo = {
                            info: error,
                            message: '数据库增删改查出错'
                        }
                        reject(errorInfo);
                    } else {
                        resolve({ results, fields });
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

// learn: https://blog.csdn.net/gymaisyl/article/details/84777139