import request from '@/utils/http'

export function fetchGetJobList(params: Api.Scheduler.JobQueryParams) {
  return request.get<Api.Scheduler.JobList>({
    url: '/api/scheduler/jobs',
    params
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

// ============ 批量操作(v3 新增) ============

export function fetchBatchToggleJobs(params: Api.Scheduler.BatchToggleParams) {
  return request.post<Api.Scheduler.BatchResultVo>({
    url: '/api/scheduler/jobs/batch/toggle',
    params
  })
}

export function fetchBatchTriggerJobs(params: Api.Scheduler.BatchIdsParams) {
  return request.post<Api.Scheduler.BatchResultVo>({
    url: '/api/scheduler/jobs/batch/trigger',
    params
  })
}

export function fetchBatchDeleteJobs(params: Api.Scheduler.BatchIdsParams) {
  return request.del<Api.Scheduler.BatchResultVo>({
    url: '/api/scheduler/jobs/batch',
    params
  })
}

// ============ 依赖 ============

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
