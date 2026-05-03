import request from '@/utils/http'

// 列表接口:把前端 1-indexed page 转成后端 0-indexed
export function fetchGetRunList(params: Api.Scheduler.JobRunQueryParams) {
  const { page = 1, size = 20, ...rest } = params
  return request.get<Api.Scheduler.JobRunList>({
    url: '/api/scheduler/runs',
    params: { page: page - 1, size, ...rest }
  })
}

export function fetchGetRunDetail(id: number) {
  return request.get<Api.Scheduler.JobRunVo>({
    url: `/api/scheduler/runs/${id}`
  })
}
