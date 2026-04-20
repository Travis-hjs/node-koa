# Node.js + Koa + Typescript 构建服务端应用

当前描述文件不做详细介绍，请移步到[掘金介绍](https://juejin.cn/post/6844903922767757320/)

## 项目运行

```bash
# 安装依赖
npm install

# 运行并开启代码热更新
npm run dev
npm run dev:test
npm run dev:prod

# 直接编译输出到`dist`目录并运行
npm run build

# 运行编译后的代码
npm run start
npm run start:test
npm run start:prod
```

## 项目变更记录

- **2026-04-20** 项目升级为`ESM`标准、弃用文件路径别名配置。
- **2026-04-17** 导入文件路径使用别名配置、`koa`相关版本升级至最新。
- **2026-04-02** `utils`工具类使用改用按需导入、`tsconfig.json`配置文件调整、`config`配置文件目录调整、加入环境变量使用。
- **2026-02-04** 弃用`koa-router`，改用`@koa/router`。
- **2024-10-05** 新增 vscode 增删改查代码片段，快速编写接口功能。
- **2024-04-20** 新增`sql`文件生成工具，通过`mysql/creator.ts`中的`sqlCreator({...sqlSetting})`方法去生成数据库表，对应运行`npm run build-sql`即可，目前只定义了常用的`"date","int","varchar"`三种类型，需要其他类型以此类推去改造`sqlCreator`函数即可。
- **2022-07-21** 弃用`nodemon`，改用`ts-node-dev`。
- **2022-07-19** 请求配置加入跨域白名单访问操作。
- **2021-12-8** 重构了用户权限模块，弃用本地`json`文件存储用户信息，改用`数据库` + `代码内存`方式缓存用户模块，对应的接口*增删改查*同步修改内存中的用户信息；之所以不使用`redis`是因为在`javascript`中，控制内存十分方便，同时占用的内存在合理的可控范围内，所以就没必要使用`redis`了。
