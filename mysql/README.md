# 数据库表

在`Navicat Premium`工具中的`node_ts`数据库下直接导入该目录表即可

# `mysql`语句操作

## 重置表

```sql
TRUNCATE TABLE street_floor_table
```

## 连表查询

```sql
select t1.group_name, t2.* from group_table t1 right join user_table t2 on t2.group_ids = t1.group_id

select t1.name, t2.* from user_table t1 right join user_table t2 on t2.id = t1.create_user_id
```

## 同字段，多个值查询

字段为索引时

```sql
select * from table_name where `id` in (1,2,3)
```

字段`group_ids`为字符串时

```sql
select * from table_name where find_in_set('1', `group_ids`)
```

多个则`( ... or ... )`

```sql
select * from table_name where (find_in_set('1', `group_ids`) or find_in_set('2', `group_ids`) or find_in_set('3', `group_ids`))
```

## 查询日期范围

```sql
select * from table_name where create_time between '2019-12-12 00:00:00' and '20206-12-12 00:00:00'
```

## 查询排序

字段值`create_time`由大到小

```sql
select * from table_name where `create_user_id` = 1 order by create_time desc
```

反之

```sql
select * from table_name where `create_user_id` = 1 order by create_time asc
```

## 查询字符串长度

```sql
SELECT CHAR_LENGTH('value')

SELECT LENGTH('value')
```

## 批量修改

js格式化

```js
const params = {
  ids: [1, 2 , 3],
  values: ["java", "php", "pyhton"]
}

/** 要设置的键名 */
const key = "`set_key`";

let value = "";

params.ids.forEach(function(id, index) {
  value += `when ${id} then '${params.values[index]}'`;
});

const setData = `${key} = case id ${value} end`;

const text = `update table_name set ${setData} where id in (${params.ids})`;

console.log("批量修改语句 >>", text);
```

```sql
update table_name set `set_key` = case id when 1 then 'java' when 2 then 'php' when 3 then 'pyhton' end where id in (1,2,3)
```

## 批量删除

```sql
delete from table_name where id in(1,2,3)
```
