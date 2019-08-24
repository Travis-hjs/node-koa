import * as fs from 'fs';
import { userRecordType, userInfoType, sessionResultType } from '../modules/interfaces';
import config from './config';

class ModuleSession {
    constructor() {
        this.init();
    }

    /** 效期（小时） */
    private maxAge = 12;

    /** 用户 token 纪录 */
    private userRecord: userRecordType = {}; 

    /**
     * 写入文件
     * @param obj 要写入的对象
     */
    private write(obj?: userRecordType) {
        const data = obj || this.userRecord;
        // 同步写入（貌似没必要）
        // fs.writeFileSync(config.user_file, JSON.stringify(data), { encoding: 'utf8' });
        // 异步写入
        fs.writeFile(config.user_file, JSON.stringify(data), { encoding: 'utf8' }, (err) => {
            if (err) {
                console.log('session 写入失败', err);
            } else {
                console.log('session 写入成功');
            }
        })
    }

    /** 从本地临时表里面初始化用户状态 */
    private init() {
        const userFrom = fs.readFileSync(config.user_file).toString();
        this.userRecord = (userFrom && JSON.parse(userFrom)) || {};
        this.checkRecord();
        // console.log('token临时表', userFrom, this.userRecord);
    }

    /** 生成 token */
    private getToken(): string {
        const getCode = (n: number): string => {
            let codes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
            let code = '';
            for (let i = 0; i < n; i++) {
                code += codes.charAt(Math.floor(Math.random() * codes.length));
            }
            if (this.userRecord[code]) {
                return getCode(n);
            }
            return code;
        }
        const code = getCode(config.token_size);
        return code;
    }
    
    /** 定时检测过期的 token 并清理 */
    private checkRecord() {
        const check = () => {
            const now = Date.now();
            let isChange = false;
            for (const key in this.userRecord) {
                if (this.userRecord.hasOwnProperty(key)) {
                    const item = this.userRecord[key];
                    if (item.online - this.maxAge * 3600000 > now) {
                        isChange = true;
                        delete this.userRecord[key];
                    }
                }
            }
            if (isChange) {
                this.write();
            }
        }
        // 10分钟检测一次
        setInterval(check, 10 * 60000);
        check();
    }

    /**
     * 设置纪录并返回 token
     * @param data 用户信息
     */
    public setRecord(data: userInfoType) {
        const token = this.getToken();
        data.online = Date.now();
        this.userRecord[token] = data;
        this.write();
        return token;
    }

    /**
     * 更新并检测 token
     * @param token 
     */
    public updateRecord(token: string) {
        let result: sessionResultType = {
            message: '',
            success: false,
            info: null
        }

        if (!this.userRecord.hasOwnProperty(token)) {
            result.message = 'token 已过期或不存在';
            return result;
        } 
        
        const obj = this.userRecord[token];

        const now = Date.now();

        if (obj.online - this.maxAge * 3600000 > now) {
            result.message = 'token 已过期';
            return result;
        }

        result.message = 'token 通过验证';
        result.success = true;
        result.info = obj;

        // 更新在线时间
        this.userRecord[token].online = now;
        this.write();
        
        return result;
    }

    /**
     * 从纪录中删除 token 纪录（退出登录时用）
     * @param token 
     */
    public removeRecord(token: string) {
        if (this.userRecord.hasOwnProperty(token)) {
            delete this.userRecord[token];
            this.write();
            return true;
        } else {
            return false;
        }
    }

}

/** session 模块 */
const session = new ModuleSession();

export default session;