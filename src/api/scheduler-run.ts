import request from '@/utils/http'

const emptyTaskPage = (page = 1, size = 20): Api.Scheduler.JobTaskList => ({
  content: [],
  page,
  size,
  totalElements: 0,
  totalPages: 0
})

export function fetchGetRunList(params: Api.Scheduler.JobTasksQuery & { jobId?: number }) {
  const { jobId, ...query } = params
  if (!jobId) {
    return Promise.resolve(emptyTaskPage(query.page, query.size))
  }

  return request.get<Api.Scheduler.JobTaskList>({
    url: `/api/job/${jobId}/tasks`,
    params: query
  })
}

export function fetchGetLatestRunList(params: Api.Scheduler.JobTasksQuery & { jobId?: number }) {
  const { jobId, ...query } = params
  if (!jobId) {
    return Promise.resolve(emptyTaskPage(query.page, query.size))
  }

  return request.get<Api.Scheduler.JobTaskList>({
    url: `/api/job/${jobId}/latest-history`,
    params: query
  })
}
