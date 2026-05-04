import request from '@/utils/http'

// 仪表盘聚合(GET /api/scheduler/stats/overview)
export function fetchGetStatsOverview(params: Api.Scheduler.StatsQueryParams = {}) {
  return request.get<Api.Scheduler.StatsOverviewVo>({
    url: '/api/scheduler/stats/overview',
    params
  })
}

// 单任务统计(GET /api/scheduler/jobs/{id}/stats)
export function fetchGetJobStats(id: number, params: Api.Scheduler.StatsQueryParams = {}) {
  return request.get<Api.Scheduler.JobStatsVo>({
    url: `/api/scheduler/jobs/${id}/stats`,
    params
  })
}
