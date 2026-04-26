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
        icon: 'ri:building-2-line',
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
        icon: 'ri:node-tree',
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
    }
  ]
}
