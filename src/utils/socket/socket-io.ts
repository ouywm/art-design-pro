import { ref, shallowRef, onUnmounted, getCurrentInstance } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import { Manager, Socket } from 'socket.io-client'
import { useUserStore } from '@/store/modules/user'
import mittBus from '@/utils/sys/mittBus'

/** 连接选项 */
export interface SocketIOOptions {
  /** 服务器地址，默认读 VITE_SOCKET_URL */
  url?: string
  /** namespace，默认 '/' */
  namespace?: string
  /** Socket.IO 请求路径，默认 '/socket.io' */
  path?: string
  /** 是否自动注入 token，默认 true */
  auth?: boolean
  /** 是否自动连接，默认 true */
  autoConnect?: boolean
  /** mittBus 桥接：true=全部转发, string[]=指定事件名 */
  mittBridge?: boolean | string[]
  /** 是否自动重连，默认 true */
  reconnection?: boolean
  /** 最大重连次数，默认 10 */
  reconnectionAttempts?: number
  /** 重连间隔(ms)，默认 1000 */
  reconnectionDelay?: number
  /** 传输方式，默认 ['websocket', 'polling'] */
  transports?: ('websocket' | 'polling')[]
}

/** Composable 返回值 */
export interface UseSocketIOReturn {
  /** 是否已连接 */
  connected: Ref<boolean>
  /** 是否已断开 */
  disconnected: Ref<boolean>
  /** 连接错误 */
  error: Ref<Error | null>
  /** Socket ID */
  id: Ref<string | undefined>
  /** 连接 */
  connect: () => void
  /** 断开连接 */
  disconnect: () => void
  /** 发送事件 */
  emit: (event: string, ...args: any[]) => void
  /** 监听事件 */
  on: (event: string, handler: (...args: any[]) => void) => void
  /** 取消监听 */
  off: (event: string, handler?: (...args: any[]) => void) => void
  /** 监听一次 */
  once: (event: string, handler: (...args: any[]) => void) => void
  /** 原始 socket 实例（高级用法） */
  socket: ShallowRef<Socket | null>
}

/**
 * Socket.IO 连接管理器（单例）
 *
 * 内部持有一个 Manager 实例（共享底层连接），
 * 维护 Map<string, Socket> 管理各 namespace 的 socket。
 */
class SocketIOManager {
  private static instance: SocketIOManager | null = null
  private manager: Manager | null = null
  private sockets = new Map<string, Socket>()
  private url: string

  private constructor(url: string) {
    this.url = url
  }

  static getInstance(url?: string): SocketIOManager {
    const resolvedUrl = url || import.meta.env.VITE_SOCKET_URL || ''
    if (!SocketIOManager.instance) {
      SocketIOManager.instance = new SocketIOManager(resolvedUrl)
    }
    return SocketIOManager.instance
  }

  /**
   * 获取或创建指定 namespace 的 socket
   */
  getSocket(options: SocketIOOptions = {}): Socket {
    const namespace = options.namespace || '/'
    const key = namespace

    // 如果已有该 namespace 的 socket，直接返回
    const existing = this.sockets.get(key)
    if (existing) {
      return existing
    }

    // 确保 Manager 已初始化
    if (!this.manager) {
      const url = options.url || this.url
      const managerOptions: Record<string, any> = {
        reconnection: options.reconnection ?? true,
        reconnectionAttempts: options.reconnectionAttempts ?? 10,
        reconnectionDelay: options.reconnectionDelay ?? 1000,
        transports: options.transports ?? ['websocket', 'polling'],
        autoConnect: false
      }
      if (options.path) {
        managerOptions.path = options.path
      }
      this.manager = new Manager(url, managerOptions)
    }

    // 构建 auth 回调（动态获取最新 token）
    const shouldAuth = options.auth ?? true
    const socketOptions: Record<string, any> = {}
    if (shouldAuth) {
      socketOptions.auth = (cb: (data: Record<string, string>) => void) => {
        const userStore = useUserStore()
        cb({ accessToken: userStore.accessToken })
      }
    }

    // 创建 namespace socket
    const socket = this.manager.socket(namespace, socketOptions)
    this.sockets.set(key, socket)

    return socket
  }

  /**
   * 移除并断开指定 namespace 的 socket
   */
  removeSocket(namespace: string = '/'): void {
    const socket = this.sockets.get(namespace)
    if (socket) {
      socket.disconnect()
      this.sockets.delete(namespace)
    }
  }

  /**
   * 销毁管理器（断开所有连接）
   */
  static destroy(): void {
    if (SocketIOManager.instance) {
      for (const [, socket] of SocketIOManager.instance.sockets) {
        socket.disconnect()
      }
      SocketIOManager.instance.sockets.clear()
      ;(SocketIOManager.instance.manager as any)?._close()
      SocketIOManager.instance.manager = null
      SocketIOManager.instance = null
    }
  }
}

/**
 * Socket.IO Vue Composable
 *
 * 提供响应式连接状态和类型安全的操作方法。
 * 在组件卸载时自动清理事件监听（不断开共享连接）。
 *
 * @example
 * ```typescript
 * // 全局通知
 * const { connected, on } = useSocketIO({ mittBridge: true })
 * on('notification', (data) => { ... })
 *
 * // 特定 namespace
 * const chat = useSocketIO({ namespace: '/chat', mittBridge: ['message', 'typing'] })
 * chat.emit('sendMessage', { content: 'hello' })
 * ```
 */
export function useSocketIO(options: SocketIOOptions = {}): UseSocketIOReturn {
  const manager = SocketIOManager.getInstance(options.url)
  const socket = manager.getSocket(options)

  // 响应式状态
  const connected = ref(socket.connected)
  const disconnected = ref(socket.disconnected)
  const error = ref<Error | null>(null)
  const id = ref<string | undefined>(socket.id)
  const socketRef = shallowRef<Socket | null>(socket)

  // 跟踪当前组件注册的事件处理器，用于卸载时清理
  const registeredHandlers: Array<{ event: string; handler: (...args: any[]) => void }> = []

  // 内部状态同步监听器
  const onConnect = () => {
    connected.value = true
    disconnected.value = false
    error.value = null
    id.value = socket.id
    mittBus.emit('socket:connected' as any)
  }

  const onDisconnect = (reason: Socket.DisconnectReason) => {
    connected.value = false
    disconnected.value = true
    id.value = undefined
    mittBus.emit('socket:disconnected' as any, reason)
  }

  const onConnectError = (err: Error) => {
    error.value = err
    connected.value = false
    disconnected.value = true
  }

  socket.on('connect', onConnect)
  socket.on('disconnect', onDisconnect)
  socket.on('connect_error', onConnectError)

  // mittBus 桥接
  let onAnyHandler: ((event: string, ...args: any[]) => void) | null = null
  const mittBridge = options.mittBridge
  if (mittBridge) {
    onAnyHandler = (event: string, ...args: any[]) => {
      // 白名单模式：只转发指定事件
      if (Array.isArray(mittBridge) && !mittBridge.includes(event)) {
        return
      }
      mittBus.emit(`socket:${event}` as any, args.length === 1 ? args[0] : args)
    }
    socket.onAny(onAnyHandler)
  }

  // 自动连接
  if ((options.autoConnect ?? true) && !socket.connected) {
    socket.connect()
  }

  // 公共方法
  const connect = () => socket.connect()
  const disconnect = () => socket.disconnect()
  const emit = (event: string, ...args: any[]) => socket.emit(event, ...args)

  const on = (event: string, handler: (...args: any[]) => void) => {
    socket.on(event, handler)
    registeredHandlers.push({ event, handler })
  }

  const off = (event: string, handler?: (...args: any[]) => void) => {
    socket.off(event, handler)
    // 从跟踪列表中移除
    if (handler) {
      const idx = registeredHandlers.findIndex((h) => h.event === event && h.handler === handler)
      if (idx !== -1) registeredHandlers.splice(idx, 1)
    } else {
      // 移除该事件的所有处理器
      for (let i = registeredHandlers.length - 1; i >= 0; i--) {
        if (registeredHandlers[i].event === event) {
          registeredHandlers.splice(i, 1)
        }
      }
    }
  }

  const once = (event: string, handler: (...args: any[]) => void) => {
    const wrappedHandler = (...args: any[]) => {
      handler(...args)
      // 一次性事件触发后从跟踪列表移除
      const idx = registeredHandlers.findIndex(
        (h) => h.event === event && h.handler === wrappedHandler
      )
      if (idx !== -1) registeredHandlers.splice(idx, 1)
    }
    socket.once(event, wrappedHandler)
    registeredHandlers.push({ event, handler: wrappedHandler })
  }

  // 组件卸载时自动清理（仅在组件上下文中）
  if (getCurrentInstance()) {
    onUnmounted(() => {
      // 移除当前组件注册的事件处理器
      for (const { event, handler } of registeredHandlers) {
        socket.off(event, handler)
      }
      registeredHandlers.length = 0

      // 移除内部状态监听器
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)

      // 移除 onAny 桥接
      if (onAnyHandler) {
        socket.offAny(onAnyHandler)
      }
    })
  }

  return {
    connected,
    disconnected,
    error,
    id,
    connect,
    disconnect,
    emit,
    on,
    off,
    once,
    socket: socketRef
  }
}

export { SocketIOManager }
