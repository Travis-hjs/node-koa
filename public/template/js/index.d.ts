/** 请求成功函数类型提示 */
interface successFn {
    (res: any): void
}

/** 请求失败函数类型提示 */
interface failFn {
    (error: {
        /** 错误提示 */
        message?: string 
    }): void
}