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

interface mysqlErrorInfoType {
    code: string | number
    errno: number
    sqlMessage: string
    sqlState: string
    index: number
    sql: string
}

/** mysql错误数据类型 */
export interface mysqlErrorType {
    /** 错误信息 */
    info: mysqlErrorInfoType
    /** 信息描述 */
    message: string
}

interface fieldType {
    catalog: string
    db: string
    table: string
    orgTable: string
    name: string
    orgName: string
    charsetNr: number
    length: number
    type: number
    flags: number
    decimals: number
    default: any
    zeroFill: boolean
    protocol41: boolean
}

/** 数据库增删改查返回数据类型 */
export interface mysqlQueryType {
    /** 结果数组 */
    results: any
    /** 域数组 */
    fields: Array<fieldType>
}

/** 用户信息类型 */
export interface userInfoType {
    /** 账号 */
    account: string
    /** 密码 */
    password: string
    /** 用户名 */
    name?: string
    /** 在线时间（毫秒） */
    online?: number
    /** 请求域名 */
    host?: string
    /** token */
    token?: string
    /** 用户id */
    id?: number
}

/** 用户 token 纪录类型 */
export interface userRecordType {
    /** token 信息对象 */
    [key: string]: userInfoType
}

/** session返回结果类型 */
export interface sessionResultType {
    /** token 状态描述 */
    message: string
    /** token 是否可用 */
    success: boolean
    /** koken 信息 */
    info: userInfoType
}