/** 成功返回提示数据 */
export interface successInfoType {
    /** 状态提示 */
    message: string
    /** 状态成功码 */
    code: 200
    /** 成功返回数据 */
    result: object | string | number
}

/** 失败返回提示数据 */
export interface failInfoType {
    /** 状态错误提示 */
    message: string
    /** 状态错误码 */
    code: number
}