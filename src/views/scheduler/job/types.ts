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

// 新增/编辑表单模型
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
  // 执行参数
  paramsJsonText: string
  // 执行控制
  enabled: boolean
  timeoutMs: number
  retryMax: number
  // 租户
  tenantId: number | undefined
}

// 手动触发表单
export interface TriggerFormModel {
  paramsOverrideText: string
}

// handler 下拉选项
export interface HandlerOption {
  label: string
  value: string
  description?: string
}
