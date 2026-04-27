import type { TagProps } from 'element-plus'

export interface SelectOption<T = string | number> {
  label: string
  value: T
}

export const TOKEN_STATUS_OPTIONS: SelectOption<Api.AiManage.TokenStatus>[] = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 },
  { label: '已过期', value: 3 },
  { label: '额度耗尽', value: 4 }
]

export const TOKEN_EDITABLE_STATUS_OPTIONS: SelectOption<Api.AiManage.TokenStatus>[] = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getTokenStatusLabel = (value: Api.AiManage.TokenStatus) =>
  getOptionLabel(TOKEN_STATUS_OPTIONS, value)

export const getTokenStatusTagType = (value: Api.AiManage.TokenStatus): TagProps['type'] => {
  switch (value) {
    case 1:
      return 'success'
    case 2:
      return 'info'
    case 3:
      return 'warning'
    case 4:
      return 'danger'
    default:
      return 'info'
  }
}
