import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useSocketIO } from '@/utils/socket/socket-io'
import { router } from '@/router'
import { useI18n } from 'vue-i18n'

// 全局 kickout 防重复标记（跨组件共享，不跟随组件生命周期）
let kickoutHandled = false

/**
 * Socket 会话管理
 *
 * 在布局入口调用一次，职责：
 * 1. 用项目约定的默认参数初始化 socket 连接
 * 2. 注册全局会话级事件（session.kickout 等）
 *
 * 其他业务组件无需调这个，直接用 useSocketIO() 即可拿到同一个 socket
 * （SocketIOManager 单例保证同 namespace 只有一个连接）。
 *
 * 新增服务端事件的处理方式：
 * - 全局会话级（kickout、token 过期等）→ 加在这里
 * - 业务页面级（通知、聊天等）→ 在对应页面组件里用 useSocketIO().on() 监听
 */
export function useSocketSession() {
  const userStore = useUserStore()
  const { t } = useI18n()

  // 重置标记（composable 重新调用说明重新登录了）
  kickoutHandled = false

  const io = useSocketIO<SocketEvents.ServerToClientEvents, SocketEvents.ClientToServerEvents>({
    namespace: import.meta.env.VITE_SOCKET_NS || '/summer-admin',
    path: import.meta.env.VITE_SOCKET_PATH || '/api/socket.io',
    mittBridge: true
  })

  // ---- 全局会话事件 ----

  io.on('session.kickout', (payload) => {
    if (kickoutHandled) return
    kickoutHandled = true

    // 服务端会主动断开连接，前端主动 disconnect 阻止自动重连
    io.disconnect()

    ElMessageBox.alert(payload.message, t('socketSession.kickoutTitle'), {
      type: 'warning',
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      callback: () => {
        userStore.clearAuthState()

        const currentPath = router.currentRoute.value.fullPath
        const isLoginPage = router.currentRoute.value.name === 'Login'
        router.push({
          name: 'Login',
          query: !isLoginPage && currentPath ? { redirect: currentPath } : undefined
        })
      }
    })
  })
}
