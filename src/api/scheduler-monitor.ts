import request from '@/utils/http'

export function fetchGetMetrics() {
  return request.get<Api.Scheduler.MetricsSnapshot>({
    url: '/api/scheduler/metrics'
  })
}

export function fetchGetInstances() {
  return request.get<Api.Scheduler.JobInstance[]>({
    url: '/api/scheduler/instances'
  })
}
