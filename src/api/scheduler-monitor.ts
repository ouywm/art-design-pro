import request from '@/utils/http'

export function fetchGetMetrics() {
  return request.get<Api.Scheduler.MetricsSnapshot>({
    url: '/api/scheduler/metrics'
  })
}
