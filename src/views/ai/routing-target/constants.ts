import type { SelectOption } from '../channel/constants'

export const ROUTING_TARGET_STATUS_OPTIONS: SelectOption<Api.AiManage.RoutingTargetStatus>[] = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 }
]

export const ROUTING_TARGET_TYPE_OPTIONS: SelectOption<Api.AiManage.RoutingTargetType>[] = [
  { label: '渠道', value: 'channel' },
  { label: '账号', value: 'account' },
  { label: '渠道分组', value: 'channel_group' },
  { label: '插件', value: 'plugin' },
  { label: '流水线', value: 'pipeline' }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getRoutingTargetStatusLabel = (value: Api.AiManage.RoutingTargetStatus) =>
  getOptionLabel(ROUTING_TARGET_STATUS_OPTIONS, value)

export const getRoutingTargetTypeLabel = (value: Api.AiManage.RoutingTargetType) =>
  getOptionLabel(ROUTING_TARGET_TYPE_OPTIONS, value, value || '-')

export const getRoutingTargetStatusTagType = (value: Api.AiManage.RoutingTargetStatus) =>
  value === 1 ? 'success' : 'info'
