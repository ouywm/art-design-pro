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
    },
    {
      path: 'model-config',
      name: 'AiModelConfig',
      component: '/ai/model-config',
      meta: {
        title: 'menus.ai.modelConfig',
        icon: 'ri:brain-line',
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
      path: 'group-ratio',
      name: 'AiGroupRatio',
      component: '/ai/group-ratio',
      meta: {
        title: 'menus.ai.groupRatio',
        icon: 'ri:scales-3-line',
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
      path: 'config-entry',
      name: 'AiConfigEntry',
      component: '/ai/config-entry',
      meta: {
        title: 'menus.ai.configEntry',
        icon: 'ri:settings-4-line',
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
      path: 'user-quota',
      name: 'AiUserQuota',
      component: '/ai/user-quota',
      meta: {
        title: 'menus.ai.userQuota',
        icon: 'ri:user-settings-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '调整额度', authMark: 'adjust' }
        ]
      }
    },
    {
      path: 'ability',
      name: 'AiAbility',
      component: '/ai/ability',
      meta: {
        title: 'menus.ai.ability',
        icon: 'ri:flashlight-line',
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
      path: 'routing-rule',
      name: 'AiRoutingRule',
      component: '/ai/routing-rule',
      meta: {
        title: 'menus.ai.routingRule',
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
      path: 'routing-target',
      name: 'AiRoutingTarget',
      component: '/ai/routing-target',
      meta: {
        title: 'menus.ai.routingTarget',
        icon: 'ri:share-forward-line',
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
      path: 'token',
      name: 'AiToken',
      component: '/ai/token',
      meta: {
        title: 'menus.ai.token',
        icon: 'ri:key-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '更新状态', authMark: 'status' },
          { title: '轮换密钥', authMark: 'rotate' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    }
  ]
}
