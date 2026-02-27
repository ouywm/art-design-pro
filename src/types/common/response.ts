/**
 * API 响应类型定义模块
 *
 * 提供统一的 API 响应结构类型定义
 *
 * ## 主要功能
 *
 * - 基础响应结构定义
 * - 泛型支持（适配不同数据类型）
 * - 统一的响应格式约束
 *
 * ## 使用场景
 *
 * - API 请求响应类型约束
 * - 接口数据类型定义
 * - 响应数据解析
 *
 * @module types/common/response
 * @author Art Design Pro Team
 */

/** 基础 API 响应结构 */
export interface BaseResponse<T = unknown> {
  /** 状态码 */
  code: number
  /** 消息 */
  msg: string
  /** 数据 */
  data: T
}

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
