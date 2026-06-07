import type { TagProps } from 'element-plus'

export interface SelectOption<T = string | number | boolean> {
  label: string
  value: T
}

// ============ Schedule Type ============

export const SCHEDULE_TYPE_OPTIONS: SelectOption<Api.Scheduler.JobScheduleType>[] = [
  { label: 'Cron 表达式', value: 'CRON' },
  { label: '固定间隔', value: 'INTERVAL' },
  { label: '延迟执行', value: 'DELAY' },
  { label: '不自动调度', value: 'NONE' }
]

export const RUN_MODE_OPTIONS: SelectOption<Api.Scheduler.JobRunMode>[] = [
  { label: 'Bean 处理器', value: 'BEAN' },
  { label: 'Groovy Glue', value: 'GLUE_GROOVY' },
  { label: 'Shell Glue', value: 'GLUE_SHELL' },
  { label: 'Python Glue', value: 'GLUE_PYTHON' },
  { label: 'PHP Glue', value: 'GLUE_PHP' },
  { label: 'Node.js Glue', value: 'GLUE_NODEJS' },
  { label: 'PowerShell Glue', value: 'GLUE_POWERSHELL' }
]

export const ROUTER_STRATEGY_OPTIONS: SelectOption<Api.Scheduler.JobRouterStrategy>[] = [
  { label: '第一个', value: 'FIRST' },
  { label: '最后一个', value: 'LAST' },
  { label: '轮询', value: 'ROUND_ROBIN' },
  { label: '随机', value: 'RANDOM' },
  { label: '一致性 Hash', value: 'CONSISTENT_HASH' },
  { label: '分片广播', value: 'SHARDING_BROADCAST' }
]

export const PAST_DUE_STRATEGY_OPTIONS: SelectOption<Api.Scheduler.JobPastDueStrategy>[] = [
  { label: '默认', value: 'DEFAULT' },
  { label: '忽略', value: 'IGNORE' },
  { label: '立即执行', value: 'EXECUTE' }
]

export const BLOCKING_STRATEGY_OPTIONS: SelectOption<Api.Scheduler.JobBlockingStrategy>[] = [
  { label: '串行执行', value: 'SERIAL_EXECUTION' },
  { label: '丢弃后续', value: 'DISCARD_LATER' },
  { label: '覆盖早期', value: 'COVER_EARLY' },
  { label: '其他', value: 'OTHER' }
]

export const ENABLED_OPTIONS: SelectOption<boolean>[] = [
  { label: '启用', value: true },
  { label: '停用', value: false }
]

// ============ 工具函数 ============

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getScheduleTypeLabel = (value: Api.Scheduler.JobScheduleType) =>
  getOptionLabel(SCHEDULE_TYPE_OPTIONS, value)

export const getRunModeLabel = (value: Api.Scheduler.JobRunMode) =>
  getOptionLabel(RUN_MODE_OPTIONS, value)

export const getRouterStrategyLabel = (value: Api.Scheduler.JobRouterStrategy) =>
  getOptionLabel(ROUTER_STRATEGY_OPTIONS, value)

export const getTaskStatusLabel = (value: string | null | undefined) => value || '-'

export const getTaskStatusTagType = (value: string | null | undefined): TagProps['type'] => {
  const status = String(value || '').toUpperCase()
  if (status.includes('SUCCESS') || status.includes('SUCCEEDED')) return 'success'
  if (status.includes('FAIL') || status.includes('ERROR')) return 'danger'
  if (status.includes('RUNNING') || status.includes('EXECUTING')) return 'primary'
  if (status.includes('TIMEOUT')) return 'warning'
  return 'info'
}

export const getScheduleTypeTagType = (value: Api.Scheduler.JobScheduleType): TagProps['type'] => {
  switch (value) {
    case 'CRON':
      return 'primary'
    case 'INTERVAL':
      return 'success'
    case 'DELAY':
      return 'warning'
    case 'NONE':
      return 'info'
    default:
      return 'info'
  }
}

// ============ Cron 模板 ============

export interface CronTemplate {
  label: string
  value: string
}

// 6 段 cron 模板:秒 分 时 日 月 周
export const CRON_TEMPLATES: CronTemplate[] = [
  { label: '每分钟', value: '0 * * * * *' },
  { label: '每 5 分钟', value: '0 */5 * * * *' },
  { label: '每 10 分钟', value: '0 */10 * * * *' },
  { label: '每小时整点', value: '0 0 * * * *' },
  { label: '每天凌晨 3 点', value: '0 0 3 * * *' },
  { label: '每天 9 点', value: '0 0 9 * * *' },
  { label: '每周一 9 点', value: '0 0 9 * * 1' },
  { label: '每月 1 号 0 点', value: '0 0 0 1 * *' }
]

export const summarizeSchedule = (
  scheduleType: Api.Scheduler.JobScheduleType,
  cronValue: string | null,
  intervalSecond: number | null,
  delaySecond: number | null
): string => {
  switch (scheduleType) {
    case 'CRON':
      return cronValue || '-'
    case 'INTERVAL':
      return intervalSecond != null ? `${intervalSecond} 秒` : '-'
    case 'DELAY':
      return delaySecond != null ? `${delaySecond} 秒后` : '-'
    case 'NONE':
      return '不自动调度'
    default:
      return '-'
  }
}
