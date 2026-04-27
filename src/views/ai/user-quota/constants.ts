import type { SelectOption } from '../channel/constants'

export const USER_QUOTA_STATUS_OPTIONS: SelectOption<Api.AiManage.UserQuotaStatus>[] = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 2 },
  { label: '冻结', value: 3 }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getUserQuotaStatusLabel = (value: Api.AiManage.UserQuotaStatus) =>
  getOptionLabel(USER_QUOTA_STATUS_OPTIONS, value)

export const getUserQuotaStatusTagType = (value: Api.AiManage.UserQuotaStatus) => {
  switch (value) {
    case 1:
      return 'success'
    case 2:
      return 'info'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
}
