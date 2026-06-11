import type {
  FeedbackItem,
  FeedbackPageResponse,
  FeedbackPriority,
  FeedbackQueryParams,
  FeedbackStatus,
  FeedbackType
} from './types'

export const FEEDBACK_TYPE_LABEL: Record<FeedbackType, string> = {
  feature: '功能建议',
  experience: '体验问题',
  bug: 'Bug 反馈'
}

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  pending: '待处理',
  resolved: '已解决',
  closed: '已关闭'
}

export const FEEDBACK_PRIORITY_LABEL: Record<FeedbackPriority, string> = {
  urgent: '紧急',
  medium: '中',
  low: '低'
}

export const FEEDBACK_TYPE_OPTIONS = [
  { label: FEEDBACK_TYPE_LABEL.feature, value: 'feature' },
  { label: FEEDBACK_TYPE_LABEL.experience, value: 'experience' },
  { label: FEEDBACK_TYPE_LABEL.bug, value: 'bug' }
] as const

export const FEEDBACK_STATUS_OPTIONS = [
  { label: FEEDBACK_STATUS_LABEL.pending, value: 'pending' },
  { label: FEEDBACK_STATUS_LABEL.resolved, value: 'resolved' },
  { label: FEEDBACK_STATUS_LABEL.closed, value: 'closed' }
] as const

export const feedbackList: FeedbackItem[] = [
  {
    id: 'FDB1762752353777',
    title: '111',
    type: 'feature',
    status: 'pending',
    priority: 'urgent',
    contactName: '真的帅',
    contactWay: 'Super',
    pagePath: '/system/feedback',
    submitTime: '2026-06-05 10:45:23',
    submitUser: 'Super',
    description: '希望反馈列表可以快速定位待处理的问题，并支持后续跟进记录。'
  },
  {
    id: 'FDB17710218566017',
    title: '21312',
    type: 'experience',
    status: 'pending',
    priority: 'medium',
    contactName: '真的帅',
    contactWay: 'Super',
    pagePath: '/template/banners',
    submitTime: '2026-05-25 19:56:58',
    submitUser: 'Super',
    description: '模板页面素材选择时，希望能更明显地区分已选择和未选择状态。'
  },
  {
    id: 'FDB17727173867144',
    title: '菜单管理的菜单展开体验很差',
    type: 'experience',
    status: 'resolved',
    priority: 'medium',
    contactName: '真的帅',
    contactWay: 'Super',
    pagePath: '/system/menu',
    submitTime: '2026-04-27 22:26:13',
    submitUser: 'Super',
    description: '菜单层级较多时展开不够顺手，希望保留当前展开状态。'
  },
  {
    id: 'FDB17727003646740',
    title: '修改系统配置后主题色被重置',
    type: 'bug',
    status: 'resolved',
    priority: 'medium',
    contactName: '真的帅',
    contactWay: 'Super',
    pagePath: '/dashboard/analytics',
    submitTime: '2026-04-27 22:07:16',
    submitUser: 'Super',
    description: '系统配置保存后主题色恢复默认，需要确认是否有缓存覆盖。'
  },
  {
    id: 'FDB1778924791674514',
    title: '233',
    type: 'feature',
    status: 'closed',
    priority: 'low',
    contactName: '真的帅',
    contactWay: 'Super',
    pagePath: '/system/feedback',
    submitTime: '2026-05-16 17:46:31',
    submitUser: 'Super',
    description: '建议反馈入口可以加一个快捷悬浮按钮。'
  },
  {
    id: 'FDB177892474956343',
    title: '34343',
    type: 'feature',
    status: 'closed',
    priority: 'low',
    contactName: '真的帅',
    contactWay: 'Super',
    pagePath: '/system/login-log',
    submitTime: '2026-05-16 17:45:49',
    submitUser: 'Super',
    description: '登录日志筛选条件希望支持记忆上次选择。'
  },
  {
    id: 'FDB17788207889036',
    title: '前端可以加一点组件',
    type: 'feature',
    status: 'closed',
    priority: 'low',
    contactName: '真的帅',
    contactWay: 'Super',
    pagePath: '/system/user-center',
    submitTime: '2026-05-05 00:07:58',
    submitUser: 'Super',
    description: '组件中心可以继续补一些业务常用组件。'
  },
  {
    id: 'FDB177745719531376',
    title: '111',
    type: 'feature',
    status: 'closed',
    priority: 'low',
    contactName: '真的帅',
    contactWay: 'Super',
    pagePath: '/dashboard/pricing',
    submitTime: '2026-04-30 02:06:35',
    submitUser: 'Super',
    description: '价格页视觉层级可以更轻一点。'
  },
  {
    id: 'FDB177742672920608',
    title: '33',
    type: 'feature',
    status: 'closed',
    priority: 'low',
    contactName: '真的帅',
    contactWay: 'Super',
    pagePath: '/system/site-setting',
    submitTime: '2026-04-29 17:38:49',
    submitUser: 'Super',
    description: '站点设置页建议加入保存前预览。'
  },
  {
    id: 'FDB177613745103740',
    title: '测试问题',
    type: 'feature',
    status: 'closed',
    priority: 'low',
    contactName: 'Super',
    contactWay: 'Super',
    pagePath: '/system/user',
    submitTime: '2026-04-14 19:30:51',
    submitUser: 'Super',
    description: '测试反馈数据，用于验证列表分页和详情展示。'
  }
]

export async function fetchFeedbackList(
  params: FeedbackQueryParams
): Promise<FeedbackPageResponse> {
  const keyword = params.keyword?.trim().toLowerCase()

  const filtered = feedbackList.filter((item) => {
    const keywordMatched =
      !keyword ||
      [item.id, item.title, item.description, item.contactWay, item.pagePath].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    const typeMatched = !params.type || item.type === params.type
    const statusMatched = !params.status || item.status === params.status

    return keywordMatched && typeMatched && statusMatched
  })

  const start = (params.page - 1) * params.size
  const content = filtered.slice(start, start + params.size)

  return Promise.resolve({
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / params.size),
    page: params.page,
    size: params.size
  })
}
