import { AppRouteRecord } from '@/types/router'

export const aiRoutes: AppRouteRecord = {
  path: '/ai',
  name: 'Ai',
  component: '/index/index',
  meta: {
    title: 'menus.ai.title',
    icon: 'ri:robot-2-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'vendor',
      name: 'AiVendor',
      component: '/ai/vendor',
      meta: {
        title: 'menus.ai.vendor',
        icon: 'ri:store-2-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'channel',
      name: 'AiChannel',
      component: '/ai/channel',
      meta: {
        title: 'menus.ai.channel',
        icon: 'ri:git-branch-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'channel-account',
      name: 'AiChannelAccount',
      component: '/ai/channel-account',
      meta: {
        title: 'menus.ai.channelAccount',
        icon: 'ri:key-2-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'channel-model-price',
      name: 'AiChannelModelPrice',
      component: '/ai/channel-model-price',
      meta: {
        title: 'menus.ai.channelModelPrice',
        icon: 'ri:money-dollar-circle-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'alert-rule',
      name: 'AiAlertRule',
      component: '/ai/alert-rule',
      meta: {
        title: 'menus.ai.alertRule',
        icon: 'ri:alarm-warning-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'alert-event',
      name: 'AiAlertEvent',
      component: '/ai/alert-event',
      meta: {
        title: 'menus.ai.alertEvent',
        icon: 'ri:notification-4-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'alert-silence',
      name: 'AiAlertSilence',
      component: '/ai/alert-silence',
      meta: {
        title: 'menus.ai.alertSilence',
        icon: 'ri:volume-mute-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'daily-stats',
      name: 'AiDailyStats',
      component: '/ai/daily-stats',
      meta: {
        title: 'menus.ai.dailyStats',
        icon: 'ri:bar-chart-box-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'guardrail',
      name: 'AiGuardrail',
      component: '/ai/guardrail',
      meta: {
        title: 'menus.ai.guardrail',
        icon: 'ri:shield-check-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'request',
      name: 'AiRequest',
      component: '/ai/request',
      meta: {
        title: 'menus.ai.request',
        icon: 'ri:file-search-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'request-execution',
      name: 'AiRequestExecution',
      component: '/ai/request-execution',
      meta: {
        title: 'menus.ai.requestExecution',
        icon: 'ri:history-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'retry-attempt',
      name: 'AiRetryAttempt',
      component: '/ai/retry-attempt',
      meta: {
        title: 'menus.ai.retryAttempt',
        icon: 'ri:refresh-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
