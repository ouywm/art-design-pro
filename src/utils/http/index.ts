/**
 * HTTP 请求封装模块
 * 基于 Axios 封装的 HTTP 请求工具，提供统一的请求/响应处理
 *
 * ## 主要功能
 *
 * - 请求/响应拦截器（自动添加 Bearer Token、统一错误处理）
 * - 401 未授权自动刷新 Token（双 Token 无感刷新）
 * - 请求失败自动重试（可配置）
 * - 统一的错误消息提示
 * - 支持 GET/POST/PUT/DELETE 等常用方法
 *
 * @module utils/http
 * @author Art Design Pro Team
 */

import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError } from './error'
import { $t } from '@/locales'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000

/** Token 刷新状态 */
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

/** 扩展 AxiosRequestConfig，增加自定义标记 */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  _isRefreshRequest?: boolean
  _retryCount?: number
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

/** Axios实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (
        contentType?.includes('application/json') ||
        contentType?.includes('application/problem+json')
      ) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 后端成功响应直接返回业务数据，不再有 code/msg 包装
    return response
  },
  (error) => {
    const config = error.config as ExtendedAxiosRequestConfig

    // 刷新请求本身失败，不做 token 刷新处理，直接走错误流程
    if (config?._isRefreshRequest) {
      return Promise.reject(handleError(error))
    }

    // 401 错误：尝试刷新 Token
    if (error.response?.status === ApiStatus.unauthorized) {
      return handleUnauthorizedWithRefresh(error)
    }

    return Promise.reject(handleError(error))
  }
)

/** 统一创建HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/**
 * 处理 401 错误：尝试用 refreshToken 刷新
 * - 如果没有 refreshToken，直接登出
 * - 如果正在刷新中，将请求加入队列等待
 * - 如果未在刷新，发起刷新请求
 */
async function handleUnauthorizedWithRefresh(error: any): Promise<AxiosResponse> {
  const userStore = useUserStore()
  const { refreshToken: storedRefreshToken } = userStore

  // 没有 refreshToken，直接登出
  if (!storedRefreshToken) {
    forceLogout()
    return Promise.reject(handleError(error))
  }

  // 正在刷新中，将当前请求加入队列等待
  if (isRefreshing) {
    return new Promise<AxiosResponse>((resolve, reject) => {
      pendingRequests.push((newToken: string) => {
        const originalConfig = error.config
        originalConfig.headers['Authorization'] = `Bearer ${newToken}`
        axiosInstance.request(originalConfig).then(resolve).catch(reject)
      })
    })
  }

  // 开始刷新
  isRefreshing = true

  try {
    // 直接用 axiosInstance 发起刷新请求，标记 _isRefreshRequest 避免递归
    const refreshResponse = await axiosInstance.request<Api.Auth.LoginResponse>({
      url: '/api/auth/refresh',
      method: 'POST',
      data: { refreshToken: storedRefreshToken },
      _isRefreshRequest: true
    } as ExtendedAxiosRequestConfig)

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data

    // 更新 store 中的 token
    userStore.setToken(newAccessToken, newRefreshToken)

    // 重放队列中的等待请求
    pendingRequests.forEach((callback) => callback(newAccessToken))
    pendingRequests = []

    // 重试原始请求
    const originalConfig = error.config
    originalConfig.headers['Authorization'] = `Bearer ${newAccessToken}`
    return axiosInstance.request(originalConfig)
  } catch {
    // 刷新失败，清空队列
    pendingRequests = []

    // 先清空 token，避免 logOut 中的 fetchLogout 再次触发 401 → 刷新的无意义请求链
    userStore.accessToken = ''
    userStore.refreshToken = ''

    // 展示登录过期提示
    const error = createHttpError($t('httpMsg.unauthorized'), ApiStatus.unauthorized)
    showError(error, true)

    forceLogout()
    return Promise.reject(error)
  } finally {
    isRefreshing = false
  }
}

/** 强制登出 */
function forceLogout() {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST | PUT 参数自动填充
  if (
    ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<T>(config)

    // 后端成功响应直接返回业务数据
    return res.data as T
  } catch (error) {
    if (
      error instanceof HttpError &&
      (error.code !== ApiStatus.unauthorized || config._isRefreshRequest)
    ) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** API方法集合 */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  }
}

export default api
