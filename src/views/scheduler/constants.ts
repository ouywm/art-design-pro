import type { TagProps } from 'element-plus'

export interface SelectOption<T = string | number | boolean> {
  label: string
  value: T
}

// ============ Schedule Type ============

export const SCHEDULE_TYPE_OPTIONS: SelectOption<Api.Scheduler.ScheduleType>[] = [
  { label: 'Cron 表达式', value: 'Cron' },
  { label: '固定频率', value: 'FixedRate' },
  { label: '固定延迟', value: 'FixedDelay' },
  { label: '一次性', value: 'Oneshot' }
]

// ============ Blocking Strategy ============

export const BLOCKING_STRATEGY_OPTIONS: SelectOption<Api.Scheduler.BlockingStrategy>[] = [
  { label: '串行排队', value: 'Serial' },
  { label: '丢弃新触发', value: 'Discard' },
  { label: '取消旧任务', value: 'Override' }
]

// ============ Misfire Strategy ============

export const MISFIRE_STRATEGY_OPTIONS: SelectOption<Api.Scheduler.MisfireStrategy>[] = [
  { label: '立即补跑一次', value: 'FireNow' },
  { label: '忽略', value: 'Ignore' },
  { label: '全部补跑', value: 'Reschedule' }
]

// ============ Route Strategy ============

export const ROUTE_STRATEGY_OPTIONS: SelectOption<Api.Scheduler.RouteStrategy>[] = [
  { label: '第一个实例', value: 'First' },
  { label: '最后一个实例', value: 'Last' },
  { label: '轮询', value: 'RoundRobin' },
  { label: '随机', value: 'Random' },
  { label: '一致性哈希', value: 'ConsistentHash' },
  { label: '最不繁忙', value: 'LeastFrequently' },
  { label: '最久未运行', value: 'LeastRecently' },
  { label: '故障转移', value: 'Failover' },
  { label: '忙时切换', value: 'Busyover' },
  { label: '分片广播', value: 'ShardingBroadcast' }
]

// ============ Retry Backoff ============

export const RETRY_BACKOFF_OPTIONS: SelectOption<Api.Scheduler.RetryBackoff>[] = [
  { label: '指数退避', value: 'Exponential' },
  { label: '线性退避', value: 'Linear' },
  { label: '固定 60 秒', value: 'Fixed' }
]

// ============ Trigger Type ============

export const TRIGGER_TYPE_OPTIONS: SelectOption<Api.Scheduler.TriggerType>[] = [
  { label: 'Cron 自动', value: 'Cron' },
  { label: '手动触发', value: 'Manual' },
  { label: '自动重试', value: 'Retry' },
  { label: '依赖触发', value: 'Workflow' },
  { label: 'Misfire 补跑', value: 'Misfire' },
  { label: 'API 调用', value: 'Api' }
]

// ============ Run State ============

export const RUN_STATE_OPTIONS: SelectOption<Api.Scheduler.RunState>[] = [
  { label: '已入队', value: 'Enqueued' },
  { label: '执行中', value: 'Running' },
  { label: '成功', value: 'Succeeded' },
  { label: '失败', value: 'Failed' },
  { label: '超时', value: 'Timeout' },
  { label: '已取消', value: 'Canceled' },
  { label: '已丢弃', value: 'Discarded' }
]

// ============ Script Engine ============

export const SCRIPT_ENGINE_OPTIONS: SelectOption<Api.Scheduler.ScriptEngine>[] = [
  { label: 'Rhai', value: 'rhai' },
  { label: 'Lua (未实现)', value: 'lua' }
]

// ============ Dependency On State ============

export const DEPENDENCY_ON_STATE_OPTIONS: SelectOption<Api.Scheduler.DependencyOnState>[] = [
  { label: '成功时触发', value: 'Succeeded' },
  { label: '失败时触发', value: 'Failed' },
  { label: '总是触发', value: 'Always' }
]

// ============ Enabled ============

export const ENABLED_OPTIONS: SelectOption<boolean>[] = [
  { label: '启用', value: true },
  { label: '停用', value: false }
]

// ============ Stats Period ============

export const STATS_PERIOD_OPTIONS: SelectOption<Api.Scheduler.StatsPeriod>[] = [
  { label: '近 1 小时', value: '1h' },
  { label: '近 24 小时', value: '24h' },
  { label: '近 7 天', value: '7d' },
  { label: '近 30 天', value: '30d' }
]

// ============ 工具函数 ============

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getScheduleTypeLabel = (value: Api.Scheduler.ScheduleType) =>
  getOptionLabel(SCHEDULE_TYPE_OPTIONS, value)

export const getBlockingStrategyLabel = (value: Api.Scheduler.BlockingStrategy) =>
  getOptionLabel(BLOCKING_STRATEGY_OPTIONS, value)

export const getMisfireStrategyLabel = (value: Api.Scheduler.MisfireStrategy) =>
  getOptionLabel(MISFIRE_STRATEGY_OPTIONS, value)

export const getRouteStrategyLabel = (value: Api.Scheduler.RouteStrategy) =>
  getOptionLabel(ROUTE_STRATEGY_OPTIONS, value)

export const getRetryBackoffLabel = (value: Api.Scheduler.RetryBackoff) =>
  getOptionLabel(RETRY_BACKOFF_OPTIONS, value)

export const getTriggerTypeLabel = (value: Api.Scheduler.TriggerType) =>
  getOptionLabel(TRIGGER_TYPE_OPTIONS, value)

export const getRunStateLabel = (value: Api.Scheduler.RunState) =>
  getOptionLabel(RUN_STATE_OPTIONS, value)

export const getDependencyOnStateLabel = (value: Api.Scheduler.DependencyOnState) =>
  getOptionLabel(DEPENDENCY_ON_STATE_OPTIONS, value)

// ============ Tag 颜色映射 ============

export const getRunStateTagType = (value: Api.Scheduler.RunState): TagProps['type'] => {
  switch (value) {
    case 'Succeeded':
      return 'success'
    case 'Failed':
      return 'danger'
    case 'Timeout':
      return 'warning'
    case 'Enqueued':
    case 'Running':
      return 'primary'
    case 'Canceled':
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
    case 'Workflow':
      return 'info'
    case 'Misfire':
      return 'warning'
    case 'Api':
      return 'info'
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
    case 'FixedDelay':
      return 'warning'
    case 'Oneshot':
      return 'info'
    default:
      return 'info'
  }
}

export const getDependencyOnStateTagType = (
  value: Api.Scheduler.DependencyOnState
): TagProps['type'] => {
  switch (value) {
    case 'Succeeded':
      return 'success'
    case 'Failed':
      return 'danger'
    case 'Always':
      return 'info'
    default:
      return 'info'
  }
}

// ============ 常量 ============

export const RHAI_HANDLER = 'script::rhai'
export const DEFAULT_SCRIPT_ENGINE: Api.Scheduler.ScriptEngine = 'rhai'

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
    case 'FixedDelay':
      return intervalMs != null ? `${intervalMs} ms` : '-'
    case 'Oneshot':
      return fireTime || '-'
    default:
      return '-'
  }
}
