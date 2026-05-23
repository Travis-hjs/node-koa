import type { FieldInfo, MysqlError, queryCallback } from "mysql";
import type { Sql } from "../types/common.js";
import { createPool } from "mysql";
import { config } from "./config.js";
import { formatSqlColumn, sqlSearchFormat } from "./index.js";

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
  const result = {
    state: 0,
    results: undefined,
    fields: [],
    error: undefined,
    msg: "",
  } as unknown as SqlResult<T>;
  return new Promise<SqlResult<T>>((resolve) => {
    pool.getConnection((error: any, connection) => {
      if (error) {
        result.error = error;
        result.msg = "数据库连接出错";
        resolve(result);
      }
      else {
        const callback: queryCallback = (error, results, fields) => {
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
            result.fields = fields as any;
            resolve(result);
          }
        };

        if (value) {
          connection.query(command, value, callback);
        }
        else {
          connection.query(command, callback);
        }
      }
    });
  });
}

/**
 * 重复条目错误（写入/更新时会用到）
 * - 用于索引字段并行时，数据库校验用
 * - 前提是表字段中，设置了唯一索引
 */
export function isDuplicateEntryError(error: any) {
  return error?.code === "ER_DUP_ENTRY" || error?.errno === 1062;
}

/**
 * 获取查询语句
 * @param params
 */
export function getSqlSearch(params: Sql.Search) {
  const { name, dateRange, accurate, vague, keys = [], asc = [], desc = [] } = params;
  const size = Math.max(1, Math.floor(Number(params.size) || 10));
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const tableName = `\`${name}\``;
  const whereList: Array<string> = [];
  const values: Array<any> = [];

  /** 精确查询语句 */
  const accuracyText = accurate ? sqlSearchFormat(accurate) : { text: "", values: [] };

  /** 模糊查询语句 */
  const vagueText = vague ? sqlSearchFormat(vague, true) : { text: "", values: [] };

  const sortText = (function () {
    if (asc.length === 0 && desc.length === 0)
      return "";
    let result = "order by";
    const hasDesc = desc.length > 0;
    if (hasDesc) {
      result = `${result} ${desc.map(key => `${formatSqlColumn(key)} desc`).join(", ")}`;
    }

    const and = hasDesc ? `${result},` : result;

    if (asc.length > 0) {
      result = `${and} ${asc.map(key => `${formatSqlColumn(key)} asc`).join(", ")}`;
    }

    return result;
  })();

  const limit = `limit ${size * (page - 1)}, ${size}`;

  if (accuracyText.text) {
    values.push(...accuracyText.values);
    whereList.push(accuracyText.text);
  }

  if (vagueText.text) {
    values.push(...vagueText.values);
    whereList.push(vagueText.text);
  }

  if (dateRange && dateRange.start && dateRange.end) {
    const dateKey = formatSqlColumn(dateRange.key);
    whereList.push(`${dateKey} between ? and ?`);
    values.push(dateRange.start, dateRange.end);
  }

  const text = whereList.length > 0 ? `where ${whereList.join(" and ")}` : "";

  const selectKeys = keys.length > 0 ? keys.map(key => formatSqlColumn(key)).join(", ") : "";

  return {
    /** 默认完整的查询语句 */
    default: `select ${selectKeys || "*"} from ${tableName} ${text} ${sortText} ${limit}`,
    /** 只用于查总数量的语句，剔除了分页、排序语句 */
    count: `select count(*) as total from ${tableName} ${text}`,
    values,
  };
}
