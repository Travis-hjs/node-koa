# node-koa
Typescript 和 Koa 构建 Node 应用（适用于新手起步）

**详细说明：[掘金](https://juejin.im/post/5d5f630251882513cb48fd89)**

### 使用
1. 安装项目依赖
```
npm install
```
2. 安装全局依赖
```
npm install -g -force ts-node nodemon
```
3. 运行
```
npm watch-update
```
或者
```
nodemon --watch 'src/**/*' -e ts,tsx --exec 'ts-node' ./src/index.ts
```

### 项目创建
##### 1. `cd project` 并创建 `src` 目录
```
mkdir src
```
##### 2. 初始化 `package.json`，之后的所有配置和命令都会写在里面
```
npm init
```
##### 3. 安装 `koa` 和对应的路由 `koa-router`
```
npm install koa koa-router 
```
##### 4. 安装 `TypeScript` 对应的类型检测提示
```
npm install --save-dev @types/koa @types/koa-router 
```
##### 5. 然后就是 `TypeScript` 热更新编译 
```
npm install --save-dev typescript ts-node nodemon
```
这里会有个坑（这里使用的是window环境下）就是 `ts-node` 和 `nodemon` 这两个需要全局安装才能执行热更新的命令
```
npm install -g -force ts-node nodemon
```
##### 6. 再配置一下 `package.json` 设置
```json
"scripts": {
    "start": "tsc && node dist/index.js",
    "watch-update": "nodemon --watch 'src/**/*' -e ts,tsx --exec 'ts-node' ./src/index.ts"
},
```
如果执行不了 `npm watch-update` 那就执行 `nodemon --watch 'src/**/*' -e ts,tsx --exec 'ts-node' ./src/index.ts` 

不确定是否 `window` 环境下的问题还是 `npm` 的问题，项目首次创建并执行的时候，所有依赖都可以本地安装并且 `npm watch-update` 也可以完美执行
但是再次打开项目的时候就出错了，目前还没找到原因，不过以上方法可以解决

##### 7. 最后选装的中间件 `koa-body` 中间件作为解析POST传参和上传图片用 
```
npm install koa-body
```
