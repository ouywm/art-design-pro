import type { TagProps } from 'element-plus'

export interface SelectOption<T = string | number> {
  label: string
  value: T
}

export const REQUEST_LOG_TYPE_OPTIONS: SelectOption<Api.AiManage.RequestLogType>[] = [
  { label: '充值', value: 1 },
  { label: '消费', value: 2 },
  { label: '管理操作', value: 3 },
  { label: '系统', value: 4 }
]

export const REQUEST_LOG_STATUS_OPTIONS: SelectOption<Api.AiManage.RequestLogStatus>[] = [
  { label: '成功', value: 1 },
  { label: '失败', value: 2 },
  { label: '取消', value: 3 }
]

export const REQUEST_STATUS_OPTIONS: SelectOption<Api.AiManage.RequestStatus>[] = [
  { label: '待处理', value: 1 },
  { label: '处理中', value: 2 },
  { label: '成功', value: 3 },
  { label: '失败', value: 4 },
  { label: '取消', value: 5 }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getRequestLogTypeLabel = (value: Api.AiManage.RequestLogType) =>
  getOptionLabel(REQUEST_LOG_TYPE_OPTIONS, value)

export const getRequestLogStatusLabel = (value: Api.AiManage.RequestLogStatus) =>
  getOptionLabel(REQUEST_LOG_STATUS_OPTIONS, value)

export const getRequestStatusLabel = (value?: Api.AiManage.RequestStatus | null) => {
  if (value == null) return '-'
  return getOptionLabel(REQUEST_STATUS_OPTIONS, value)
}

export const getRequestLogStatusTagType = (
  value: Api.AiManage.RequestLogStatus
): TagProps['type'] => {
  switch (value) {
    case 1:
      return 'success'
    case 2:
      return 'danger'
    case 3:
      return 'info'
    default:
      return 'info'
  }
}

export const getRequestLogTypeTagType = (value: Api.AiManage.RequestLogType): TagProps['type'] => {
  switch (value) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'primary'
    case 4:
      return 'info'
    default:
      return 'info'
  }
}

export const getRequestStatusTagType = (
  value?: Api.AiManage.RequestStatus | null
): TagProps['type'] => {
  switch (value) {
    case 1:
      return 'info'
    case 2:
      return 'warning'
    case 3:
      return 'success'
    case 4:
      return 'danger'
    case 5:
      return 'info'
    default:
      return 'info'
  }
}
