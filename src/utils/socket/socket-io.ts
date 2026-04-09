import { ref, shallowRef, onUnmounted, getCurrentInstance } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import { Manager, Socket, type ManagerOptions, type SocketOptions } from 'socket.io-client'
import { useUserStore } from '@/store/modules/user'
import mittBus from '@/utils/sys/mittBus'

// 从 SocketIOTypes 命名空间引入（模块作用域，不污染全局）
type EventsMap = SocketIOTypes.EventsMap
type DefaultEventsMap = SocketIOTypes.DefaultEventsMap
type EventNames<M extends EventsMap> = SocketIOTypes.EventNames<M>
type EventParams<M extends EventsMap, Ev extends EventNames<M>> = SocketIOTypes.EventParams<M, Ev>
type Last<T extends any[]> = SocketIOTypes.Last<T>
type AllButLast<T extends any[]> = SocketIOTypes.AllButLast<T>
type FirstArg<T> = SocketIOTypes.FirstArg<T>
type DecorateAcknowledgements<E> = SocketIOTypes.DecorateAcknowledgements<E>

// 跟踪已注册系统级监听器的 socket，防止 useSocketIO() 多次调用时重复注册
const systemListenerSockets = new WeakSet<Socket<any, any>>()

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

/** 事件发送方法 */
interface SocketIOEmitMethods<Emit extends EventsMap = DefaultEventsMap> {
  /** 类型安全的事件发送 */
  emit: <Ev extends EventNames<Emit>>(ev: Ev, ...args: EventParams<Emit, Ev>) => void
  /** 发送事件并等待服务端确认（Promise） */
  emitWithAck: <Ev extends EventNames<Emit>>(
    ev: Ev,
    ...args: AllButLast<EventParams<Emit, Ev>>
  ) => Promise<FirstArg<Last<EventParams<Emit, Ev>>>>
  /** 设置超时，返回带超时装饰的 emit/emitWithAck */
  timeout: (ms: number) => {
    emit: <Ev extends EventNames<DecorateAcknowledgements<Emit>>>(
      ev: Ev,
      ...args: EventParams<DecorateAcknowledgements<Emit>, Ev>
    ) => void
    emitWithAck: <Ev extends EventNames<DecorateAcknowledgements<Emit>>>(
      ev: Ev,
      ...args: AllButLast<EventParams<DecorateAcknowledgements<Emit>, Ev>>
    ) => Promise<FirstArg<Last<EventParams<DecorateAcknowledgements<Emit>, Ev>>>>
  }
  /** 易失发送（当 socket 未就绪时丢弃） */
  volatile: {
    emit: <Ev extends EventNames<Emit>>(ev: Ev, ...args: EventParams<Emit, Ev>) => void
  }
}

/** 事件监听方法 */
interface SocketIOListenMethods<Listen extends EventsMap = DefaultEventsMap> {
  /** 类型安全的事件监听 */
  on: <Ev extends EventNames<Listen>>(
    ev: Ev,
    handler: (...args: EventParams<Listen, Ev>) => void
  ) => void
  /** 类型安全的取消监听 */
  off: <Ev extends EventNames<Listen>>(
    ev: Ev,
    handler?: (...args: EventParams<Listen, Ev>) => void
  ) => void
  /** 类型安全的一次性监听 */
  once: <Ev extends EventNames<Listen>>(
    ev: Ev,
    handler: (...args: EventParams<Listen, Ev>) => void
  ) => void
}

/** Composable 返回值 */
export interface UseSocketIOReturn<
  Listen extends EventsMap = DefaultEventsMap,
  Emit extends EventsMap = Listen
> extends SocketIOEmitMethods<Emit>,
    SocketIOListenMethods<Listen> {
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
  /** 原始 socket 实例（高级用法） */
  socket: ShallowRef<Socket<Listen, Emit> | null>
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
  private sockets = new Map<string, Socket<any, any>>()
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
  getSocket<Listen extends EventsMap = DefaultEventsMap, Emit extends EventsMap = Listen>(
    options: SocketIOOptions = {}
  ): Socket<Listen, Emit> {
    const namespace = options.namespace || '/'
    const key = namespace

    // 如果已有该 namespace 的 socket，直接返回
    const existing = this.sockets.get(key)
    if (existing) {
      return existing as Socket<Listen, Emit>
    }

    // 确保 Manager 已初始化
    if (!this.manager) {
      const url = options.url || this.url
      const managerOptions: Partial<ManagerOptions> = {
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
    const socketOptions: Partial<SocketOptions> = {}
    if (shouldAuth) {
      socketOptions.auth = (cb: (data: Record<string, string>) => void) => {
        const userStore = useUserStore()
        cb({ accessToken: userStore.accessToken })
      }
    }

    // 创建 namespace socket
    const socket = this.manager.socket(namespace, socketOptions) as Socket<Listen, Emit>
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
 * // 无泛型 — 向后兼容，行为与改造前完全一致
 * const { connected, on, emit } = useSocketIO({ mittBridge: true })
 * on('notification', (data) => { ... })
 *
 * // 带泛型 — 类型安全：事件名自动补全 + 参数类型推断
 * const { on, emit, emitWithAck } = useSocketIO<
 *   SocketEvents.ServerToClientEvents,
 *   SocketEvents.ClientToServerEvents
 * >({ namespace: '/chat' })
 *
 * // emitWithAck — Promise 确认
 * const ok = await emitWithAck('sendMessage', 'hello')
 *
 * // timeout — 超时控制
 * const { emitWithAck: emitWithTimeout } = timeout(5000)
 * const res = await emitWithTimeout('sendMessage', 'hello')
 *
 * // volatile — 丢弃式发送
 * volatile.emit('cursorMove', { x: 100, y: 200 })
 * ```
 */
export function useSocketIO<
  Listen extends EventsMap = DefaultEventsMap,
  Emit extends EventsMap = Listen
>(options: SocketIOOptions = {}): UseSocketIOReturn<Listen, Emit> {
  const manager = SocketIOManager.getInstance(options.url)
  const socket = manager.getSocket<Listen, Emit>(options)

  // 响应式状态
  const connected = ref(socket.connected)
  const disconnected = ref(socket.disconnected)
  const error = ref<Error | null>(null)
  const id = ref<string | undefined>(socket.id)
  const socketRef = shallowRef<Socket<Listen, Emit> | null>(socket)

  // 跟踪当前组件注册的事件处理器，用于卸载时清理
  const registeredHandlers: Array<{ event: string; handler: (...args: any[]) => void }> = []

  // 系统级监听器（mittBus 桥接），同一个 socket 只注册一次
  if (!systemListenerSockets.has(socket as Socket<any, any>)) {
    systemListenerSockets.add(socket as Socket<any, any>)
    socket.on('connect', () => mittBus.emit('socket:connected'))
    socket.on('disconnect', (reason: Socket.DisconnectReason) =>
      mittBus.emit('socket:disconnected', reason)
    )
  }

  // 每个 composable 实例的响应式状态同步（组件卸载时清理）
  const onConnect = () => {
    connected.value = true
    disconnected.value = false
    error.value = null
    id.value = socket.id
  }

  const onDisconnect = () => {
    connected.value = false
    disconnected.value = true
    id.value = undefined
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
      mittBus.emit(`socket:${event}`, args.length === 1 ? args[0] : args)
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

  // emit — 直接代理，socket.emit 本身已有完整泛型约束
  const emit: UseSocketIOReturn<Listen, Emit>['emit'] = (ev, ...args) => {
    ;(socket as Socket<any, any>).emit(ev as string, ...args)
  }

  // on / off / once — 内部 registeredHandlers 用 string + any 存储（类型边界内部细节），
  // 对外暴露的签名通过 UseSocketIOReturn 约束保证类型安全
  const on: UseSocketIOReturn<Listen, Emit>['on'] = (ev, handler) => {
    ;(socket as Socket<any, any>).on(ev as string, handler as any)
    registeredHandlers.push({ event: ev as string, handler: handler as any })
  }

  const off: UseSocketIOReturn<Listen, Emit>['off'] = (ev, handler?) => {
    ;(socket as Socket<any, any>).off(ev as string, handler as any)
    if (handler) {
      const idx = registeredHandlers.findIndex(
        (h) => h.event === (ev as string) && h.handler === handler
      )
      if (idx !== -1) registeredHandlers.splice(idx, 1)
    } else {
      for (let i = registeredHandlers.length - 1; i >= 0; i--) {
        if (registeredHandlers[i].event === (ev as string)) {
          registeredHandlers.splice(i, 1)
        }
      }
    }
  }

  const once: UseSocketIOReturn<Listen, Emit>['once'] = (ev, handler) => {
    const wrappedHandler = (...args: any[]) => {
      ;(handler as (...a: any[]) => void)(...args)
      const idx = registeredHandlers.findIndex(
        (h) => h.event === (ev as string) && h.handler === wrappedHandler
      )
      if (idx !== -1) registeredHandlers.splice(idx, 1)
    }
    ;(socket as Socket<any, any>).once(ev as string, wrappedHandler)
    registeredHandlers.push({ event: ev as string, handler: wrappedHandler })
  }

  // emitWithAck — 代理 socket.emitWithAck()
  // as any 是必需的：我们本地的 EventsMap 与 socket.io-client 内部的 EventsMap 是独立声明，
  // TypeScript 在泛型分发时无法证明兼容性（structural compatibility 在映射类型推断中有限制），
  // 外部签名已通过 UseSocketIOReturn 保证类型安全
  const emitWithAck: UseSocketIOReturn<Listen, Emit>['emitWithAck'] = (ev, ...args) => {
    return (socket as Socket<any, any>).emitWithAck(ev as string, ...args)
  }

  const timeout: UseSocketIOReturn<Listen, Emit>['timeout'] = (ms) => {
    const timedSocket = (socket as Socket<any, any>).timeout(ms)
    return {
      emit: (ev, ...args) => {
        timedSocket.emit(ev as string, ...args)
      },
      emitWithAck: (ev, ...args) => {
        return timedSocket.emitWithAck(ev as string, ...args)
      }
    }
  }

  const volatile: UseSocketIOReturn<Listen, Emit>['volatile'] = {
    emit: (ev, ...args) => {
      ;(socket as Socket<any, any>).volatile.emit(ev as string, ...args)
    }
  }

  // 组件卸载时自动清理（仅在组件上下文中）
  if (getCurrentInstance()) {
    onUnmounted(() => {
      // 移除当前组件注册的事件处理器
      for (const { event, handler } of registeredHandlers) {
        ;(socket as Socket<any, any>).off(event, handler)
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
    emitWithAck,
    timeout,
    volatile,
    socket: socketRef
  }
}

export { SocketIOManager }
