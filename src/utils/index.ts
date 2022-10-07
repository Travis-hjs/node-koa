import { JavaScriptTypes } from "../types/base";

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
    let value: T;
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
    if (["null", null, "undefined", undefined, ""].includes(value as any)) return "";
    // ios 和 mac 系统中，带横杆的字符串日期是格式不了的，这里做一下判断处理
    if (typeof value === "string" && new Date(value).toString() === "Invalid Date") {
      value = value.replace(/-/g, "/");
    }
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
   * 获取两个日期之间的天数
   * @param date1 
   * @param date2 
   * @returns 
   */
  daysBetween(date1: Date|string|number, date2: Date|string|number) {
    return Math.ceil(Math.abs(new Date(date1).getTime() - new Date(date2).getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * 判断是否为空值
   * @param target 
   * @param rules 传入的规则
   */
  isEmpty(target: any, rules = ["null", "undefined", "", null, undefined]) {
    return rules.includes(target);
  }

  /**
   * 修改属性值-只修改之前存在的值
   * @param target 修改的目标
   * @param value 修改的内容
   */
  modifyData<T>(target: T, value: T) {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        // target[key] = value[key];
        // 需要的话，深层逐个赋值
        if (this.checkType(target[key]) === "object") {
          this.modifyData(target[key], value[key]);
        } else {
          target[key] = value[key];
        }
      }
    }
  }

  /**
   * 下划线转换驼峰
   * @param value 
   */
  toHump(value: string) {
    return value.replace(/\_(\w)/g, function (all, letter) {
      return letter.toUpperCase();
    });
  }

  /**
   * 驼峰转换下划线
   * @param value 
   */
  toLine(value: string) {
    return value.replace(/([A-Z])/g, "_$1").toLowerCase();
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
    const rules = isEmptyString ? ["null", "undefined", null, undefined] : undefined;
    for (const key in params) {
      const empty = this.isEmpty(params[key], rules);
      if (!empty) {
        keys.push("`" + key + "`");
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
    const rules = isEmptyString ? ["null", "undefined", null, undefined] : undefined;
    const values = [];
    let result = "";
    for (const key in params) {
      const empty = this.isEmpty(params[key], rules);
      if (!empty) {
        values.push("`" + key + "`='" + params[key] + "'");
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
   * @param isVague 是否模糊查询
   * @description 查询用
   */
  mysqlSearchParams(params: { [key: string]: any }, isVague = false) {
    let result = "";
    for (const key in params) {
      const empty = this.isEmpty(params[key]);
      if (!empty) {
        const prefix = key.includes(".") ? ` and ${key} ` : " and `" + key + "` ";
        if (isVague) {
          result += `${prefix} like '%${params[key]}%'`;
        } else {
          result += `${prefix} = '${params[key]}'`;
        }
      }
    }
    if (result) {
      result = result.slice(4);
    }
    return result;
  }

  /**
   * 获取域名
   * @param val 
   * @param prefix 是否需要带上前缀：`https`或者`http`，默认`true`
   */
  getDomain(val: string, prefix = true) {
    const https = "https://";
    const http = "http://";
    if (val.includes(https)) {
      val = val.replace(https, "").split("/")[0];
      prefix && (val = https + val);
    } else if (val.includes(http)) {
      val = val.replace(http, "").split("/")[0];
      prefix && (val = http + val);
    }
    return val;
  }
}

/** 工具模块 */
const utils = new ModuleUtils;

export default utils;