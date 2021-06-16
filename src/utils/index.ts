import { 
    JavaScriptTypes 
} from "./interfaces";

class ModuleUtils {

    /**
     * 范围随机数
     * @param min 最小数
     * @param max 最大数
     */
    ranInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 随机打乱数组
     * @param array
     */
    shuffleArray<T>(array: Array<T>) {
        for (let i = array.length - 1; i >= 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i + 1));
            let itemAtIndex = array[randomIndex];
            array[randomIndex] = array[i];
            array[i] = itemAtIndex;
        }
        return array;
    }

    /**
     * 数组中随机取几个元素
     * @param array 数组
     * @param count 元素个数
     */
    getRandomArrayElements<T>(array: Array<T>, count: number) {
        let length = array.length;
        let min = length - count;
        let index = 0;
        let value: T = null;
        while (length-- > min) {
            index = Math.floor((length + 1) * Math.random());
            value = array[index];
            array[index] = array[length];
            array[length] = value;
        }
        return array.slice(min);
    }

    /**
     * 检测类型
     * @param target 检测的目标
     */
    checkType(target: any): JavaScriptTypes {
        const value: string = Object.prototype.toString.call(target);
        const result = value.match(/\[object (\S*)\]/)[1];
        return result.toLocaleLowerCase() as JavaScriptTypes;
    }

    /**
     * 替换`{{ name }}`的字段
     * @param target 模板字符串
     * @param data `object`
     */
    replaceText(target: string, data: any) {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key] || "";
                const reg = `{{${key}}}`;
                target = target.replace(reg, value);
            }
        }
        return target
    }

    /**
     * 格式化日期
     * @param value 指定日期
     * @param format 格式化的规则
     * @example
     * ```js
     * formatDate();
     * formatDate(1603264465956);
     * formatDate(1603264465956, "h:m:s");
     * formatDate(1603264465956, "Y-M-D");
     * formatDate(1603264465956, "Y年M月D日");
     * ```
     */
    formatDate(value: string | number | Date = Date.now(), format = "Y-M-D h:m:s") {
        const formatNumber = (n: number) => `0${n}`.slice(-2);
        const date = new Date(value);
        const formatList = ["Y", "M", "D", "h", "m", "s"];
        const resultList = [];
        resultList.push(date.getFullYear().toString());
        resultList.push(formatNumber(date.getMonth() + 1));
        resultList.push(formatNumber(date.getDate()));
        resultList.push(formatNumber(date.getHours()));
        resultList.push(formatNumber(date.getMinutes()));
        resultList.push(formatNumber(date.getSeconds()));
        for (let i = 0; i < resultList.length; i++) {
            format = format.replace(formatList[i], resultList[i]);
        }
        return format;
    }
    
    /**
     * 判断是否为空值
     * @param value 
     * @param isEmptyString 是否可以为空字符串
     * @description `null`|`undefined`|`""`均为`true`
     */
    isEmpty(value: any, isEmptyString = false) {
        const condition = isEmptyString ? (value !== null && value !== undefined) : (value !== "" && value !== null && value !== undefined);
        return condition;
    }

    /**
     * 下划线转换驼峰
     * @param value 
     */
    toHump(value: string) {
        return value.replace(/\_(\w)/g, function(all, letter){
            return letter.toUpperCase();
        });
    }

    /**
     * 驼峰转换下划线
     * @param value 
     */
    toLine(value: string) {
        return value.replace(/([A-Z])/g,"_$1").toLowerCase();
    }

    /**
     * 数组项全部转成驼峰
     * @param list 目标数组
     */
     arrayItemToHump<T>(list: Array<T>) {
        const result = [];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            result.push(this.objectToHump(item));
        }
        return result;
    }

    /**
     * 对象值全部转成驼峰
     * @param tatget 目标对象
     */
    objectToHump(tatget: any) {
        const result: { [key: string]: any } = {};
        for (const key in tatget) {
            result[this.toHump(key)] = tatget[key];
        }
        return result;
    }

    /**
     * 数据库语句格式化
     * @param params 
     * @param isEmptyString 是否可以为空字符串
     * @description 数据库写入的时候用
     */
    mysqlFormatParams(params: { [key: string]: any }, isEmptyString = false) {
        const keys = [];
        const values = [];
        for (const key in params) {
            const condition = this.isEmpty(params[key], isEmptyString);
            if (condition) {
                keys.push("`"+ key +"`");
                values.push(params[key]);
            }
        }
        return {
            keys,
            values,
            symbols: keys.map(_ => "?").toString()
        }
    }

    /**
     * 数据库更新参数语句格式化
     * @param params 
     * @param isEmptyString 是否可以为空字符串
     * @description 修改（更新用）
     */
    mysqlSetParams(params: { [key: string]: any }, isEmptyString = false) {
        const values = [];
        let result = "";
        for (const key in params) {
            const condition = this.isEmpty(params[key], isEmptyString);
            if (condition) {
                values.push("`"+ key +"`='" + params[key]  +"'");
            }
        }
        if (values.length > 0) {
            result = "set " + values.toString();
        }
        return result;
    }

    /**
     * 数据库查询参数格式化
     * @param params 
     * @description 查询用
     */
    mysqlSearchParams(params: { [key: string]: any }) {
        let result = "";
        for (const key in params) {
            const condition = this.isEmpty(params[key]);
            if (condition) {
                result += (" and `"+ key +"`='" + params[key]  +"'");
            }
        }
        if (result) {
            result = "where" + result.slice(4);
        }
        return result;
    }

}

/** 工具模块 */
const utils = new ModuleUtils;

export default utils;