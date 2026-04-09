/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * Socket.IO 事件类型契约
 */
declare namespace SocketEvents {
  /** session.kickout 事件载荷 */
  interface KickoutPayload {
    /** 踢出原因标识 */
    reason: 'admin_kickout' | 'account_disabled'
    /** 可直接展示给用户的提示文案 */
    message: string
  }

  /** 服务端 -> 客户端事件 */
  interface ServerToClientEvents {
    'session.kickout': (payload: KickoutPayload) => void
  }

  /** 客户端 -> 服务端事件 */
  interface ClientToServerEvents {
    // 根据后端实际事件补充
  }
}
