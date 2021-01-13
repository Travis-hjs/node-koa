import { 
    JavaScriptTypes, 
    NumberSymbols 
} from "./interfaces";

class ModuleUtils {

    /**
     * 范围随机数
     * @param min 最小数
     * @param max 最大数
     */
    public ranInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 随机打乱数组
     * @param array
     */
    public shuffleArray<T>(array: Array<T>) {
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
    public getRandomArrayElements<T>(array: Array<T>, count: number) {
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
    public checkType(target: any): JavaScriptTypes {
        const value: string = Object.prototype.toString.call(target);
        const result = value.match(/\[object (\S*)\]/)[1];
        return result.toLocaleLowerCase() as JavaScriptTypes;
    }

    /**
     * 数字运算（主要用于小数点精度问题）
     * [see](https://juejin.im/post/6844904066418491406#heading-12)
     * @param a 前面的值
     * @param type 计算方式
     * @param b 后面的值
     * @example 
     * // 可链式调用
     * const res = computeNumber(1.3, "-", 1.2).next("+", 1.5).next("*", 2.3).next("/", 0.2).result;
     * console.log(res);
     */
    public computeNumber(a: number, type: NumberSymbols, b: number) {
        const THAT = this;
        /**
         * 获取数字小数点的位数
         * @param value 数字
         */
        function getLenth(value: number) {
            const string = value.toString().split(".")[1];
            return string ? string.length : 0;
        }
        /** 倍率 */
        const power = Math.pow(10, Math.max(getLenth(a), getLenth(b)));
        let result = 0;
        
        // 防止出现 `33.33333*100000 = 3333332.9999999995` && `33.33*10 = 333.29999999999995` 这类情况做的暴力处理
        a = Math.round(a * power);
        b = Math.round(b * power);

        switch (type) {
            case "+":
                result = (a + b) / power;
                break;
            case "-":
                result = (a - b) / power;
                break;
            case "*":
                result = (a * b) / (power * power);
                break;
            case "/":
                result = a  / b ;
                break;
        }
        
        return {
            /** 计算结果 */
            result,
            /**
             * 继续计算
             * @param nextType 继续计算方式
             * @param nextValue 继续计算的值
             */
            next(nextType: NumberSymbols, nextValue: number) {
                return THAT.computeNumber(result, nextType, nextValue);
            }
        };
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
    
}

/** 工具模块 */
const utils = new ModuleUtils;

export default utils;