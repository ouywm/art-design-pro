import type { SelectOption } from '../channel/constants'

export const ROUTING_RULE_STATUS_OPTIONS: SelectOption<Api.AiManage.RoutingRuleStatus>[] = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 }
]

export const ROUTING_RULE_MATCH_TYPE_OPTIONS: SelectOption<string>[] = [
  { label: 'JSON 条件', value: 'json' },
  { label: 'Header', value: 'header' },
  { label: '模型匹配', value: 'model' },
  { label: 'Endpoint', value: 'endpoint' },
  { label: '表达式', value: 'expr' }
]

export const ROUTING_RULE_ROUTE_STRATEGY_OPTIONS: SelectOption<string>[] = [
  { label: 'Weighted', value: 'weighted' },
  { label: 'Priority', value: 'priority' },
  { label: 'Hash', value: 'hash' },
  { label: 'Latency', value: 'latency' }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getRoutingRuleStatusLabel = (value: Api.AiManage.RoutingRuleStatus) =>
  getOptionLabel(ROUTING_RULE_STATUS_OPTIONS, value)

export const getRoutingRuleMatchTypeLabel = (value: string) =>
  getOptionLabel(ROUTING_RULE_MATCH_TYPE_OPTIONS, value, value || '-')

export const getRoutingRuleRouteStrategyLabel = (value: string) =>
  getOptionLabel(ROUTING_RULE_ROUTE_STRATEGY_OPTIONS, value, value || '-')

export const getRoutingRuleStatusTagType = (value: Api.AiManage.RoutingRuleStatus) =>
  value === 1 ? 'success' : 'info'
