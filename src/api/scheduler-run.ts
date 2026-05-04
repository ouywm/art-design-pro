import request from '@/utils/http'

export function fetchGetRunList(params: Api.Scheduler.JobRunQueryParams) {
  return request.get<Api.Scheduler.JobRunList>({
    url: '/api/scheduler/runs',
    params
  })
}

export function fetchGetRunDetail(id: number) {
  return request.get<Api.Scheduler.JobRunVo>({
    url: `/api/scheduler/runs/${id}`
  })
}
