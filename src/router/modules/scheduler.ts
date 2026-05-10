import { AppRouteRecord } from '@/types/router'

export const schedulerRoutes: AppRouteRecord = {
  path: '/scheduler',
  name: 'Scheduler',
  component: '/index/index',
  meta: {
    title: 'menus.scheduler.title',
    icon: 'ri:timer-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'job',
      name: 'SchedulerJob',
      component: '/scheduler/job',
      meta: {
        title: 'menus.scheduler.job',
        icon: 'ri:list-check-2',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '启停', authMark: 'toggle' },
          { title: '触发', authMark: 'trigger' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'run',
      name: 'SchedulerRun',
      component: '/scheduler/run',
      meta: {
        title: 'menus.scheduler.run',
        icon: 'ri:history-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
