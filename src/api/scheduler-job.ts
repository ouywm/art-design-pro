import request from '@/utils/http'

// 列表接口:把前端 1-indexed page 转成后端 0-indexed
export function fetchGetJobList(params: Api.Scheduler.JobQueryParams) {
  const { page = 1, size = 20, ...rest } = params
  return request.get<Api.Scheduler.JobList>({
    url: '/api/scheduler/jobs',
    params: { page: page - 1, size, ...rest }
  })
}

export function fetchGetJobDetail(id: number) {
  return request.get<Api.Scheduler.JobDetailVo>({
    url: `/api/scheduler/jobs/${id}`
  })
}

export function fetchCreateJob(params: Api.Scheduler.CreateJobParams) {
  return request.post<Api.Scheduler.JobDetailVo>({
    url: '/api/scheduler/jobs',
    params
  })
}

export function fetchUpdateJob(id: number, params: Api.Scheduler.UpdateJobParams) {
  return request.put<Api.Scheduler.JobDetailVo>({
    url: `/api/scheduler/jobs/${id}`,
    params
  })
}

export function fetchDeleteJob(id: number) {
  return request.del<null>({
    url: `/api/scheduler/jobs/${id}`
  })
}

export function fetchToggleJob(id: number, params: Api.Scheduler.ToggleJobEnabledParams) {
  return request.post<Api.Scheduler.JobDetailVo>({
    url: `/api/scheduler/jobs/${id}/toggle`,
    params
  })
}

export function fetchTriggerJob(id: number, params: Api.Scheduler.TriggerJobParams) {
  return request.post<null>({
    url: `/api/scheduler/jobs/${id}/trigger`,
    params
  })
}

export function fetchGetJobDependencies(id: number) {
  return request.get<Api.Scheduler.JobDependencyListVo>({
    url: `/api/scheduler/jobs/${id}/dependencies`
  })
}

export function fetchAddJobDependency(id: number, params: Api.Scheduler.AddJobDependencyParams) {
  return request.post<number>({
    url: `/api/scheduler/jobs/${id}/dependencies`,
    params
  })
}

export function fetchDeleteJobDependency(id: number, depId: number) {
  return request.del<null>({
    url: `/api/scheduler/jobs/${id}/dependencies/${depId}`
  })
}
