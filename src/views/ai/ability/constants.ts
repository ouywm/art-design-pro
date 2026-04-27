import type { SelectOption } from '../channel/constants'

export const ABILITY_ENABLED_OPTIONS: SelectOption<boolean>[] = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getAbilityEnabledLabel = (value: boolean) =>
  getOptionLabel(ABILITY_ENABLED_OPTIONS, value)

export const getAbilityEnabledTagType = (value: boolean) => (value ? 'success' : 'info')
