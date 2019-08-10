# node-koa
Typescript 和 Koa 构建 Node 应用（demo）

### 项目初始化创建教程
1. `cd project` 并创建 `src` 目录
2. 初始化 `package.json`，之后的所有配置和命令都会写在里面
```md
npm init
```
3. 安装 `koa` 和对应的路由 `koa-router`
```md
npm install koa koa-router
```
4. 安装 `TypeScript` 类型检测
```md
npm install --save-dev @types/koa @types/koa-router
```
5. 最后就是 `TypeScript` 热更新编译 
```md
npm install --save-dev typescript ts-node nodemon
```
这里会有个坑（这里使用的是window环境下）就是 `ts-node` 和 `nodemon` 这两个需要全局安装才能执行热更新的命令
```md
npm install -g -force ts-node nodemon
```
6. 再配置一下 `package.json` 设置
```json
"scripts": {
    "start": "tsc && node dist/index.js",
    "watch-update": "nodemon --watch 'src/**/*' -e ts,tsx --exec 'ts-node' ./src/index.ts"
},
```
如果执行不了 `npm watch-update` 那就执行 `nodemon --watch 'src/**/*' -e ts,tsx --exec 'ts-node' ./src/index.ts` 

不确定是否 `window` 环境下的问题还是 `npm` 的问题，项目首次创建并执行的时候，所有依赖都可以本地安装并且 `npm watch-update` 也可以完美执行
但是再次打开项目的时候就出错了，目前还没找到原因，不过以上方法可以解决

### 项目编译输出
```md
npm start
```
