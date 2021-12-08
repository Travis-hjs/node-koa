import { ApiResult } from "../types/base";

/**
 * 接口成功响应返回数据
 * @param data 成功返回数据
 * @param tip 提示内容
 * @param code 状态码
 */
export function apiSuccess<T>(data: T, tip?: string, code = 200): ApiResult<T> {
    return {
        message: tip || "success",
        code: code,
        result: data
    }
}

/**
 * 服务端错误响应返回数据
 * @param tip 提示内容
 * @param code 错误码
 * @param error 错误信息
 */
export function apiFail(tip: string, code = 500, error: any = null): ApiResult<any> {
    return {
        message: tip || "fail",
        code: code,
        result: error
    }
}