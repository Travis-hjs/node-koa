import { 
    JavaScriptTypes, 
    NumberSymbols 
} from "./interfaces";

class ModuleUtils {
    /**
     * 格式化?后面参数成 JSON 对象
     * @param value 
     * @example {
     * searchFormat(window.location.search);
     * }
    */
    public searchFormat(value: string) {
        return JSON.parse(`{"${decodeURIComponent(value.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`);
    }

    /**
     * rgb 转 16进制 
     * @param string rgb(125, 125, 125)
     */
    public rgbToHex(string: string) {
        var rgb = string.split(",");
        var r = parseInt(rgb[0].split("(")[1]);
        var g = parseInt(rgb[1]);
        var b = parseInt(rgb[2].split(")")[0]);
        var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }

    /** 
    * hex16 进制颜色转 rgb(rgba)
    * @param hex "#23ff45" 
    */
    public hexToRgb(hex: string) {
        return "rgb(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt("0x" + hex.slice(5, 7)) + ")";
    }

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
}

/** 工具模块 */
const utils = new ModuleUtils;

export default utils;