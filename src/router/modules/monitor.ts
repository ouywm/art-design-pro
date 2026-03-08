import { AppRouteRecord } from '@/types/router'

export const monitorRoutes: AppRouteRecord = {
  path: '/monitor',
  name: 'Monitor',
  component: '/index/index',
  meta: {
    title: 'menus.monitor.title',
    icon: 'ri:pulse-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'server',
      name: 'ServerMonitor',
      component: '/monitor/server',
      meta: {
        title: 'menus.monitor.server',
        icon: 'ri:server-line'
      }
    },
    {
      path: 'cache',
      name: 'CacheMonitor',
      component: '/monitor/cache',
      meta: {
        title: 'menus.monitor.cache',
        icon: 'ri:database-2-line'
      }
    }
  ]
}
