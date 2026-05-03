export type JobListItem = Api.Scheduler.JobVo
export type JobDetailData = Api.Scheduler.JobDetailVo

// 搜索表单模型
export interface SearchFormModel {
  name?: string
  groupName?: string
  handler?: string
  scheduleType?: Api.Scheduler.ScheduleType
  enabled?: boolean
  tenantId?: number
}

// 抽屉新增/编辑表单模型
export interface FormModel {
  // 基础信息
  name: string
  groupName: string
  description: string
  handler: string
  scheduleType: Api.Scheduler.ScheduleType
  // 调度参数(联动)
  cronExpr: string
  intervalMs: number | undefined
  fireTime: string
  // 脚本(handler 联动)
  script: string
  scriptEngine: Api.Scheduler.ScriptEngine | undefined
  // 执行参数
  paramsJsonText: string
  // 执行控制
  enabled: boolean
  blocking: Api.Scheduler.BlockingStrategy
  misfire: Api.Scheduler.MisfireStrategy
  routeStrategy: Api.Scheduler.RouteStrategy
  timeoutMs: number
  retryMax: number
  retryBackoff: Api.Scheduler.RetryBackoff
  // 去重
  uniqueKey: string
  // 分片(高级)
  shardTotal: number | undefined
  // 租户
  tenantId: number | undefined
}

// 手动触发表单
export interface TriggerFormModel {
  paramsOverrideText: string
}

// 依赖面板里的添加表单
export interface AddDependencyFormModel {
  downstreamId: number | undefined
  onState: Api.Scheduler.DependencyOnState
}

// handler 下拉选项
export interface HandlerOption {
  label: string
  value: string
}

// job 下拉选项(依赖管理时选 downstream 用)
export interface JobOption {
  label: string
  value: number
  disabled?: boolean
}
