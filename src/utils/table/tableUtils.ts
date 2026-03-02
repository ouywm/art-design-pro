/**
 * 表格工具函数模块
 *
 * 提供表格数据处理和请求管理的核心工具函数
 *
 * ## 主要功能
 *
 * - 后端 Page<T> 响应格式适配
 * - 表格数据提取和转换
 * - 分页信息自动更新和校验
 * - 智能防抖函数（支持取消和立即执行）
 * - 统一的错误处理机制
 *
 * ## 使用场景
 *
 * - useTable 组合式函数的底层工具
 * - 适配后端统一的分页接口格式
 * - 表格数据的标准化处理
 * - 请求防抖和性能优化
 * - 错误统一处理和日志记录
 *
 * ## 后端响应格式
 *
 * Page<T> 结构:
 * - content: T[] - 数据列表
 * - page: number - 当前页码
 * - size: number - 每页条数
 * - totalElements: number - 总元素数
 * - totalPages: number - 总页数
 *
 * ## 核心功能
 *
 * - defaultResponseAdapter: 转换后端响应为标准格式
 * - extractTableData: 提取表格数据数组
 * - updatePaginationFromResponse: 更新分页信息
 * - createSmartDebounce: 创建可控的防抖函数
 * - createErrorHandler: 生成错误处理器
 *
 * @module utils/table/tableUtils
 * @author Art Design Pro Team
 */

import type { ApiResponse } from './tableCache'

// 请求参数基础接口，扩展分页参数
export interface BaseRequestParams extends Api.Common.PaginationParams {
  [key: string]: unknown
}

// 错误处理接口
export interface TableError {
  code: string
  message: string
  details?: unknown
}

/**
 * 默认响应适配器
 */
export const defaultResponseAdapter = <T>(response: unknown): ApiResponse<T> => {
  if (!response || typeof response !== 'object') {
    console.warn('[tableUtils] 无效的响应格式:', response)
    return { content: [], totalElements: 0, page: 1, size: 10, totalPages: 0 }
  }

  const res = response as Record<string, any>

  // 兼容后端 snake_case (total_elements / total_pages) 和 camelCase (totalElements / totalPages)
  const rawPage = res.page ?? 1
  const totalElements = res.totalElements ?? res.total_elements ?? 0
  const totalPages = res.totalPages ?? res.total_pages ?? 0

  return {
    content: res.content || [],
    // 兼容后端 0-based 分页：如果 page 为 0 且有数据，转换为 1-based
    page: rawPage === 0 ? 1 : rawPage,
    size: res.size || 10,
    totalElements,
    totalPages
  }
}

/**
 * 从标准化的API响应中提取表格数据
 */
export const extractTableData = <T>(response: ApiResponse<T>): T[] => {
  return Array.isArray(response.content) ? response.content : []
}

/**
 * 根据API响应更新分页信息
 */
export const updatePaginationFromResponse = <T>(
  pagination: Api.Common.PaginationParams,
  response: ApiResponse<T>
): void => {
  pagination.total = response.totalElements
  pagination.page = response.page

  const maxPage = Math.max(1, response.totalPages)
  if (pagination.page > maxPage) {
    pagination.page = maxPage
  }
}

/**
 * 创建智能防抖函数 - 支持取消和立即执行
 */
export const createSmartDebounce = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T & { cancel: () => void; flush: () => Promise<any> } => {
  let timeoutId: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T> | null = null
  let lastResolve: ((value: any) => void) | null = null
  let lastReject: ((reason: any) => void) | null = null

  const debouncedFn = (...args: Parameters<T>): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) clearTimeout(timeoutId)
      lastArgs = args
      lastResolve = resolve
      lastReject = reject
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          timeoutId = null
          lastArgs = null
          lastResolve = null
          lastReject = null
        }
      }, delay)
    })
  }

  debouncedFn.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = null
    lastArgs = null
    lastResolve = null
    lastReject = null
  }

  debouncedFn.flush = async () => {
    if (timeoutId && lastArgs && lastResolve && lastReject) {
      clearTimeout(timeoutId)
      timeoutId = null
      const args = lastArgs
      const resolve = lastResolve
      const reject = lastReject
      lastArgs = null
      lastResolve = null
      lastReject = null
      try {
        const result = await fn(...args)
        resolve(result)
        return result
      } catch (error) {
        reject(error)
        throw error
      }
    }
    return Promise.resolve()
  }

  return debouncedFn as any
}

/**
 * 生成错误处理函数
 */
export const createErrorHandler = (
  onError?: (error: TableError) => void,
  enableLog: boolean = false
) => {
  const logger = {
    error: (message: string, ...args: any[]) => {
      if (enableLog) console.error(`[useTable] ${message}`, ...args)
    }
  }

  return (err: unknown, context: string): TableError => {
    const tableError: TableError = {
      code: 'UNKNOWN_ERROR',
      message: '未知错误',
      details: err
    }

    if (err instanceof Error) {
      tableError.message = err.message
      tableError.code = err.name
    } else if (typeof err === 'string') {
      tableError.message = err
    }

    logger.error(`${context}:`, err)
    onError?.(tableError)
    return tableError
  }
}
