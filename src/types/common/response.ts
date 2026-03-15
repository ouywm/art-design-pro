/** RFC 7807 ProblemDetails 错误响应结构 */
export interface ProblemDetails {
  /** 问题类型 URI */
  type: string
  /** 错误标题 */
  title: string
  /** HTTP 状态码 */
  status: number
  /** 错误详情（展示给用户） */
  detail?: string
  /** 发生错误的请求路径 */
  instance?: string
}
