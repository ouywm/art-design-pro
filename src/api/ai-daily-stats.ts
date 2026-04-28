import request from '@/utils/http'

export function fetchGetDailyStatsList(params: Api.AiManage.DailyStatsQueryParams) {
  return request.get<Api.AiManage.DailyStatsList>({
    url: '/api/daily-stats/list',
    params
  })
}

export function fetchGetDailyStatsSummary(params: Api.AiManage.DailyStatsQueryFilters) {
  return request.get<Api.AiManage.DailyStatsSummaryVo>({
    url: '/api/daily-stats/summary',
    params
  })
}

export function fetchGetDailyStatsDashboard(params: Api.AiManage.DashboardQueryParams) {
  return request.get<Api.AiManage.DashboardOverviewVo>({
    url: '/api/daily-stats/dashboard',
    params
  })
}
