import * as fs from "fs";
import utils from "../src/utils";

/** `sql`生成器类型 */
namespace SqlCreator {
  /** 每一列的数据基础配置 */
  interface Base {
    /** 备注 */
    comment: string
    /**
     * 字段值
     * 建议用小写+下划线方式命名
     */
    name: string
    /**
     * 字节长度
     * - 当`type: "date"时不需要设置`
     */
    length: number
    /** 是否可以为`null` */
    isNull: boolean
  }

  export interface Date extends Omit<Base, "length" | "isNull"> {
    type: "date"

  }

  export interface Int extends Base {
    type: "int"
    /** 
     * 是否为`键`
     * - 设置时为`true`时，`isNull`固定为`false`
     */
    key?: boolean
  }

  export interface Varchar extends Omit<Base, "isNull"> {
    type: "varchar"
  }

  export type Column = Int | Varchar | Date;

  export interface Option {
    /** 
     * 数据库表名
     * - 建议用小写 + 下划线方式命名
     * - 生成的表会带有`_table`标识
     */
    name: string
    /** 表列数据 */
    columns: Array<Column>
    /**
     * 存储引擎
     * | 字段 | 说明 |
     * | ---- | ---- |
     * | MyISAM | 不支持事务和行级锁定，因此在写入频繁的情况下可能会出现性能问题。此外，MyISAM 在崩溃后恢复数据的能力较差。而 MyISAM 则可能在某些特定场景下有一定的优势，比如对于只读的或者读取频繁的数据表。 |
     * | InnoDB | 是另一种MySQL数据库的存储引擎，它提供了事务支持、行级锁定和外键约束等功能，适合于需要较高数据完整性和并发性的应用。InnoDB也提供了更好的崩溃恢复能力。 |
     * | MEMORY | 也称为HEAP，它将表中的数据存储在内存中，适合于临时表和需要快速访问的数据。但是，数据在服务器重启或崩溃时会丢失。 |
     * | CSV | 将数据存储在CSV文件中，适合于导入和导出数据。 |
     * | ARCHIVE | 用于存储归档数据，数据被高度压缩，适合于存储大量历史数据。 |
     * | BLACKHOLE | 不会存储数据，将所有写入操作丢弃，适用于复制和分发数据。 |
     * | FEDERATED | 允许在本地服务器上访问远程服务器上的数据，适用于分布式数据库环境。 |
     * | NDB | 也称为`NDBCluster`，适用于 MySQL Cluster，提供高可用性和实时性能。 |
     */
    engine: "MyISAM"|"InnoDB"|"MEMORY"|"CSV"|"ARCHIVE"|"BLACKHOLE"|"FEDERATED"|"NDB"
  }

}

/**
 * `sql`文件生成器
 * @param option 
 */
function sqlCreator(option: SqlCreator.Option) {
  if (option.columns.filter((col: any) => col.key).length > 1) {
    console.log(`\x1B[91m 一张表只能出现一个 key !!! \x1B[0m`);
    return;
  } 
  const tableName = option.name + "_table";
  const getNull = (val: boolean) => val ? "NULL" : "NOT NULL";
  const getComment = (val: string) => `COMMENT '${val}'`;
  const getName = (val: string) => "`"+ val +"`";
  let key = "";
  const fnMap = {
    int(col: SqlCreator.Int) {
      if (col.key) {
        key = col.name;
      }
      return `${getName(col.name)} int(${col.length}) ${col.key ? getNull(false) + " AUTO_INCREMENT" : "NULL DEFAULT NULL"} ${getComment(col.comment)}`
    },
    date(col: SqlCreator.Date) {
      return `${getName(col.name)} datetime(0) NULL DEFAULT NULL ${getComment(col.comment)}`;
    },
    varchar(col: SqlCreator.Varchar) {
      return `${getName(col.name)} varchar(${col.length}) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL ${getComment(col.comment)}`;
    }
  }
  const list = option.columns.map(column => fnMap[column.type](column as any));
  if (key) {
    list.push(`PRIMARY KEY (\`${key}\`) USING BTREE`);
  }
  const context = `
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE \`${tableName}\` (
  ${list.toString().replace(/,/g, ",\n  ")}
) ENGINE = ${option.engine} AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
  `;
  try {
    const path = "mysql/produce";
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    fs.writeFileSync(`${path}/${tableName}.sql`, context, { encoding: "utf8" });
    console.log(`\x1B[42m 成功创建文件 \x1B[0m`, `${tableName}.sql`);
  } catch (error) {
    console.log(`\x1B[91m 写入 .sql 文件失败 \x1B[0m`, error);
  }
}

sqlCreator({
  name: "project",
  engine: "InnoDB",
  columns: [
    {
      type: "int",
      name: "id",
      comment: "项目id",
      length: 64,
      isNull: false,
      key: true
    },
    {
      type: "varchar",
      name: "name",
      comment: "项目名称",
      length: 255
    },
    {
      type: "int",
      name: "state",
      comment: "项目状态",
      length: 10,
      isNull: false,
    },
    {
      type: "date",
      name: "create_time",
      comment: "创建日期",
    },
    {
      type: "int",
      name: "create_user_id",
      comment: "创建用户id",
      length: 64,
      isNull: false
    },
    {
      type: "varchar",
      name: "remarks",
      comment: "备注",
      length: 255
    }
  ]
});

// sqlCreator({
//   name: "history",
//   engine: "InnoDB",
//   columns: [
//     {
//       type: "varchar",
//       name: "name",
//       comment: "记录名称",
//       length: 255
//     },
//     {
//       type: "int",
//       name: "state",
//       comment: "状态",
//       length: 10,
//       isNull: false,
//     },
//     {
//       type: "date",
//       name: "create_time",
//       comment: "创建日期",
//     },
//     {
//       type: "int",
//       name: "create_user_id",
//       comment: "创建用户id",
//       length: 64,
//       isNull: false
//     },
//     {
//       type: "varchar",
//       name: "remarks",
//       comment: "备注",
//       length: 255
//     }
//   ]
// });

// function add() {
//   const info = utils.mysqlFormatParams({
//     "name": "params.content",
//     "state": 1,
//     "create_user_id": 3,
//     "create_time": utils.formatDate()
//   })
  
//   const text = `insert into xxx_table(${info.keys}) values(${info.values.toString()})`;

//   console.log(text);
// }

// add();