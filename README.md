# Node.js + Koa + Typescript 构建服务端应用

当前描述文件不做详细介绍，请移步到[掘金介绍](https://juejin.cn/post/6844903922767757320/)

## 安装依赖

```
npm install
```

## 运行并开启代码热更新

```
npm run dev
```

## 直接编译输出到`dist`目录并运行

```
npm run build
```

## 重要功能修改记录

- **2021-12-8** 重构了用户权限模块，弃用本地`json`文件存储用户信息，改用`数据库` + `代码内存`方式缓存用户模块，对应的接口`增删改查`同步修改内存中的用户信息

- **2022-07-19** 请求配置加入跨域白名单访问操作

- **2022-07-21** 弃用`nodemon`，改用`ts-node-dev`
