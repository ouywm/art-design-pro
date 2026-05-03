import request from '@/utils/http'

export function fetchGetHandlers() {
  return request.get<Api.Scheduler.HandlerVo[]>({
    url: '/api/scheduler/handlers'
  })
}
