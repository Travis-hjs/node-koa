import type { FieldInfo, MysqlError, queryCallback } from "mysql";
import type { Sql } from "../types/common.js";
import { createPool } from "mysql";
import { config } from "./config.js";
import { sqlSearchFormat, toLine } from "./index.js";

/** `mysql`查询结果 */
interface SqlResult<T = any> {
  /** `state === 1`时为成功 */
  state: number;
  /** 结果数组 或 对象 */
  results: T;
  /** 状态 */
  fields: Array<FieldInfo>;
  /** 错误信息 */
  error: MysqlError;
  /** 描述信息 */
  msg: string;
}

/** 数据库链接池 */
const pool = createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

/**
 * 数据库增删改查
 * @param command 增删改查语句 [mysql语句参考](https://blog.csdn.net/gymaisyl/article/details/84777139)
 * @param value 对应的值
 */
export function query<T = any>(command: string, value?: Array<any>) {
  const result: SqlResult = {
    state: 0,
    results: undefined,
    fields: [],
    error: undefined,
    msg: "",
  };
  return new Promise<SqlResult<T>>((resolve) => {
    pool.getConnection((error: any, connection) => {
      if (error) {
        result.error = error;
        result.msg = "数据库连接出错";
        resolve(result);
      }
      else {
        const callback: queryCallback = (error: any, results, fields) => {
          // pool.end();
          connection.release();
          if (error) {
            result.error = error;
            result.msg = "数据库增删改查出错";
            resolve(result);
          }
          else {
            result.state = 1;
            result.msg = "ok";
            result.results = results;
            result.fields = fields;
            resolve(result);
          }
        };

        if (value) {
          pool.query(command, value, callback);
        }
        else {
          pool.query(command, callback);
        }
      }
    });
  });
}

/**
 * 获取查询语句
 * @param params
 */
export function getSearchText(params: Sql.Search) {
  const { name, size = 10, page = 1, dateRange } = params;
  const tableName = `\`${name}\``;

  /** 查询语句 */
  let text = "";

  /** 精确查询语句 */
  const accuracy = params.accurate ? sqlSearchFormat(params.accurate) : "";

  /** 模糊查询语句 */
  const vague = params.vague ? sqlSearchFormat(params.vague, true) : "";

  // TODO需调试验证
  const sortText = (function () {
    if (!params.asc && !params.desc)
      return "";
    let result = "order by";
    const hasDesc = params.desc.length > 0;
    if (hasDesc) {
      result = `${result} ${params.desc.map(key => `${toLine(key)} desc`).toString().replace(",", ", ")}`;
    }

    const and = hasDesc ? `${result},` : result;

    if (params.asc.length > 0) {
      result = `${and} ${params.asc.map(key => `${toLine(key)} asc`).toString().replace(",", ", ")}`;
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
    const dateKey = toLine(dateRange.key);
    text += `${text ? " and" : ""} ${dateKey} between '${dateRange.start}' and '${dateRange.end}'`;
  }

  if (text) {
    text = `where ${text}`;
  }

  const selectKeys = params.keys ? params.keys.map(key => toLine(key)).toString() : "";

  return {
    /** 默认完整的查询语句 */
    default: `select ${selectKeys || "*"} from ${tableName} ${text} ${sortText} ${limit}`,
    /** 只用于查总数量的语句，剔除了分页、排序语句 */
    count: `select count(*) from ${tableName} ${text}`,
  };
}
