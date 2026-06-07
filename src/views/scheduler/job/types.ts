export type JobListItem = Api.Scheduler.Job
export type JobDetailData = Api.Scheduler.Job

// 搜索表单模型
export interface SearchFormModel {
  namespace?: string
  appName?: string
  likeDescription?: string
  likeHandleName?: string
}

// 新增/编辑表单模型
export interface FormModel {
  appName: string
  namespace: string
  key: string
  description: string
  scheduleType: Api.Scheduler.JobScheduleType
  cronValue: string
  delaySecond: number | undefined
  intervalSecond: number | undefined
  runMode: Api.Scheduler.JobRunMode
  handleName: string
  triggerParamText: string
  routerStrategy: Api.Scheduler.JobRouterStrategy
  pastDueStrategy: Api.Scheduler.JobPastDueStrategy
  blockingStrategy: Api.Scheduler.JobBlockingStrategy
  timeoutSecond: number
  tryTimes: number
  retryInterval: number
  enable: boolean
}
