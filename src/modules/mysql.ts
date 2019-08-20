import * as MYSQL from 'mysql';
import config from './config';

/** 数据库 */
const mysql = MYSQL.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
});

/**
 * 数据库增删改查
 * @param command 增删改查命令
 * @param value 对应的值
 */
export default function query(command: string, value?: Array<any>) {
    /** 错误信息 */
    let errorInfo = {}
    return new Promise((resolve, reject) => {
        mysql.connect(err => {
            if (err) {
                errorInfo = {
                    error: err,
                    message: '数据库连接出错'
                }
                reject(errorInfo);
            } else {
                const callback: MYSQL.queryCallback = (err, results, fields) => {
                    mysql.end(); 
                    if (err) {
                        errorInfo = {
                            error: err,
                            message: '数据库增删改查出错'
                        }
                        reject(errorInfo);
                    } else {
                        resolve({ results, fields });
                    }
                }
                
                if (value) {
                    mysql.query(command, value, callback);
                } else {
                    mysql.query(command, callback);
                }
            }
        })
    });
}