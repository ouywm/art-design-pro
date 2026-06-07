import { AppRouteRecord } from '@/types/router'

export const devToolsRoutes: AppRouteRecord = {
  path: '/dev-tools',
  name: 'DevTools',
  component: '/index/index',
  meta: {
    title: 'menus.devTools.title',
    icon: 'ri:tools-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'ai-generator',
      name: 'DevToolsAiGenerator',
      component: '/dev-tools/ai-generator',
      meta: {
        title: 'menus.devTools.aiGenerator',
        icon: 'ri:sparkling-2-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
