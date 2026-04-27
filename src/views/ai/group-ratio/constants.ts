import type { SelectOption } from '../channel/constants'

export const GROUP_RATIO_ENABLED_OPTIONS: SelectOption<boolean>[] = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getGroupRatioEnabledLabel = (value: boolean) =>
  getOptionLabel(GROUP_RATIO_ENABLED_OPTIONS, value)

export const getGroupRatioEnabledTagType = (value: boolean) => (value ? 'success' : 'info')
