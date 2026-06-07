import request from '@/utils/http'

export function fetchGetJobList(params: Api.Scheduler.JobListQuery) {
  return request.get<Api.Scheduler.JobList>({
    url: '/api/job/list',
    params
  })
}

export function fetchGetJobDetail(id: number) {
  return request.get<Api.Scheduler.Job>({
    url: `/api/job/${id}`
  })
}

export function fetchCreateJob(params: Api.Scheduler.CreateJobPayload) {
  return request.post<null>({
    url: '/api/job',
    params
  })
}

export function fetchUpdateJob(id: number, params: Api.Scheduler.UpdateJobPayload) {
  return request.put<null>({
    url: `/api/job/${id}`,
    params
  })
}

export function fetchDeleteJob(id: number) {
  return request.del<null>({
    url: `/api/job/${id}`
  })
}

export function fetchToggleJob(id: number, enable: boolean) {
  return request.put<null>({
    url: `/api/job/${id}/${enable ? 'enable' : 'disable'}`
  })
}

export function fetchGetJobNamespaces() {
  return request.get<Api.Scheduler.JobNamespace[]>({
    url: '/api/job/namespaces'
  })
}

export function fetchGetJobApps() {
  return request.get<string[]>({
    url: '/api/job/apps'
  })
}

export function fetchGetJobIdByKey(params: Api.Scheduler.JobKeyQuery) {
  return request.get<number>({
    url: '/api/job/query-id-by-key',
    params
  })
}

export function fetchGetJobByKey(params: Api.Scheduler.JobKeyQuery) {
  return request.get<Api.Scheduler.Job>({
    url: '/api/job/query-by-key',
    params
  })
}
