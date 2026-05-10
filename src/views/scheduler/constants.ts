import type { TagProps } from 'element-plus'

export interface SelectOption<T = string | number | boolean> {
  label: string
  value: T
}

// ============ Schedule Type ============

export const SCHEDULE_TYPE_OPTIONS: SelectOption<Api.Scheduler.ScheduleType>[] = [
  { label: 'Cron 表达式', value: 'Cron' },
  { label: '固定频率', value: 'FixedRate' },
  { label: '一次性', value: 'Oneshot' }
]

// ============ Trigger Type ============

export const TRIGGER_TYPE_OPTIONS: SelectOption<Api.Scheduler.TriggerType>[] = [
  { label: 'Cron 自动', value: 'Cron' },
  { label: '手动触发', value: 'Manual' },
  { label: '自动重试', value: 'Retry' }
]

// ============ Run State ============

export const RUN_STATE_OPTIONS: SelectOption<Api.Scheduler.RunState>[] = [
  { label: '执行中', value: 'Running' },
  { label: '成功', value: 'Succeeded' },
  { label: '失败', value: 'Failed' },
  { label: '超时', value: 'Timeout' },
  { label: '已丢弃', value: 'Discarded' }
]

// ============ Enabled ============

export const ENABLED_OPTIONS: SelectOption<boolean>[] = [
  { label: '启用', value: true },
  { label: '停用', value: false }
]

// ============ 工具函数 ============

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getScheduleTypeLabel = (value: Api.Scheduler.ScheduleType) =>
  getOptionLabel(SCHEDULE_TYPE_OPTIONS, value)

export const getTriggerTypeLabel = (value: Api.Scheduler.TriggerType) =>
  getOptionLabel(TRIGGER_TYPE_OPTIONS, value)

export const getRunStateLabel = (value: Api.Scheduler.RunState) =>
  getOptionLabel(RUN_STATE_OPTIONS, value)

// ============ Tag 颜色映射 ============

export const getRunStateTagType = (value: Api.Scheduler.RunState): TagProps['type'] => {
  switch (value) {
    case 'Succeeded':
      return 'success'
    case 'Failed':
      return 'danger'
    case 'Timeout':
      return 'warning'
    case 'Running':
      return 'primary'
    case 'Discarded':
      return 'info'
    default:
      return 'info'
  }
}

export const getTriggerTypeTagType = (value: Api.Scheduler.TriggerType): TagProps['type'] => {
  switch (value) {
    case 'Cron':
      return 'primary'
    case 'Manual':
      return 'success'
    case 'Retry':
      return 'warning'
    default:
      return 'info'
  }
}

export const getScheduleTypeTagType = (value: Api.Scheduler.ScheduleType): TagProps['type'] => {
  switch (value) {
    case 'Cron':
      return 'primary'
    case 'FixedRate':
      return 'success'
    case 'Oneshot':
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

// ============ 调度参数摘要展示 ============

export const summarizeSchedule = (
  scheduleType: Api.Scheduler.ScheduleType,
  cronExpr: string | null,
  intervalMs: number | null,
  fireTime: string | null
): string => {
  switch (scheduleType) {
    case 'Cron':
      return cronExpr || '-'
    case 'FixedRate':
      return intervalMs != null ? `${intervalMs} ms` : '-'
    case 'Oneshot':
      return fireTime || '-'
    default:
      return '-'
  }
}
