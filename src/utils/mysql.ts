import * as mysql from "mysql";         // learn: https://www.npmjs.com/package/mysql
import config from "../modules/Config";
import utils from "./index";
import { BaseObj } from "../types/base";

/** `mysql`查询结果 */
interface MsqlResult<T = any> {
  /** `state === 1`时为成功 */
  state: number
  /** 结果数组 或 对象 */
  results: T
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
export function query<T = any>(command: string, value?: Array<any>) {
  const result: MsqlResult = {
    state: 0,
    results: undefined,
    fields: [],
    error: undefined,
    msg: ""
  }
  return new Promise<MsqlResult<T>>(resolve => {
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

/** 获取查询语句参数 */
interface SearchTextParams {
  /** 数据库表名 */
  name: string
  /** 查询的字段，默认`*` */
  keys?: string
  /** 模糊查询对象 */
  vague?: BaseObj<any>
  /** 精确查询对象 */
  accurate?: BaseObj<any>
  /**
   * 排序字段
   * - 从小到大
   * - 多个则传数组
   */
  asc?: string | Array<string>
  /**
   * 排序字段
   * - 从大到小
   * - 多个则传数组
   */
  desc?: string | Array<string>
  /**
   * 对应`pageSize`
   * - 默认100
   */
  size?: number
  /**
   * 对应``currentPage`
   * - 默认1
   */
  page?: number
  /**
   * 日期范围查询信息
   */
  dateRange?: {
    /** 时间字段 */
    key: string
    /** 范围开始值 */
    start?: string
    /** 范围结束值 */
    end?: string
  }
}

/**
 * 获取查询语句
 * @param params 
 */
export function getSearchText(params: SearchTextParams) {
  const {
    name,
    size = 100,
    page = 1,
    dateRange
  } = params;
  const tableName = "`" + name + "`";

  /** 查询语句 */
  let text = "";

  /** 精确查询语句 */
  const accuracy = params.accurate ? utils.mysqlSearchParams(params.accurate) : "";

  /** 模糊查询语句 */
  const vague = params.vague ? utils.mysqlSearchParams(params.vague, true) : "";
  
  // TODO需调试验证
  const sortText = (function() {
    if (!params.asc && !params.desc) return "";
    let result = "order by";
    if (typeof params.desc === "string") {
      result = `${result} ${params.desc} desc`;
    } else if (Array.isArray(params.desc)) {
      result = `${result} ${params.desc.map(val => `${val} desc`).toString().replace(",", ", ")}`;
    }

    const and = params.desc ? `${result},` : result;

    if (typeof params.asc === "string") {
      result = `${and} ${params.asc} asc`;
    } else if (Array.isArray(params.asc)) {
      result = `${and} ${params.asc.map(val => `${val} asc`).toString().replace(",", ", ")}`;
    }
    
    return result;
  })();

  const limit = `limit ${size * (page - 1)}, ${size}`;

  if (accuracy) {
    text += accuracy;
  }

  if (vague) {
    text += `${text ? " and" : ""} ${vague}`;
  }

  if (dateRange && dateRange.start && dateRange.end) {
    text += `${text ? " and" : ""} ${dateRange.key} between '${dateRange.start}' and '${dateRange.end}'`;
  }

  if (text) {
    text = `where ${text}`;
  }

  return {
    /** 默认完整的查询语句 */
    default: `select ${params.keys || "*"} from ${tableName} ${text} ${sortText} ${limit}`,
    /** 只用于查总数量的语句，剔除了分页、排序语句 */
    count: `select count(*) from ${tableName} ${text}`
  }
}
