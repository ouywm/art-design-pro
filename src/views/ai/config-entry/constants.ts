import type { SelectOption } from '../channel/constants'

export const CONFIG_ENTRY_STATUS_OPTIONS: SelectOption<Api.AiManage.ConfigEntryStatus>[] = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 }
]

export const CONFIG_ENTRY_SCOPE_TYPE_OPTIONS: SelectOption<Api.AiManage.ConfigEntryScopeType>[] = [
  { label: '系统', value: 'system' },
  { label: '组织', value: 'organization' },
  { label: '项目', value: 'project' },
  { label: '供应商', value: 'provider' },
  { label: '模型', value: 'model' },
  { label: '插件', value: 'plugin' }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getConfigEntryStatusLabel = (value: Api.AiManage.ConfigEntryStatus) =>
  getOptionLabel(CONFIG_ENTRY_STATUS_OPTIONS, value)

export const getConfigEntryScopeTypeLabel = (value: Api.AiManage.ConfigEntryScopeType) =>
  getOptionLabel(CONFIG_ENTRY_SCOPE_TYPE_OPTIONS, value)

export const getConfigEntryStatusTagType = (value: Api.AiManage.ConfigEntryStatus) =>
  value === 1 ? 'success' : 'info'
