export type RunListItem = Api.Scheduler.JobRunVo
export type RunDetailData = Api.Scheduler.JobRunVo

export interface SearchFormModel {
  jobId?: number
  traceId?: string
  triggerType?: Api.Scheduler.TriggerType
  state?: Api.Scheduler.RunState
  instance?: string
  dateRange?: [string, string] | null
}
