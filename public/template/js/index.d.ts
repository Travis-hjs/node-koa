
/** 接口响应数据，返回给前端用 */
interface ApiResult<T = any> {
  /** 状态提示 */
  message: string
  /** 状态码，`code === 1`时为成功 */
  code: number
  /** 返回数据 */
  result: T
}
