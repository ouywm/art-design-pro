import type { SelectOption } from '../channel/constants'

export const MODEL_CONFIG_TYPE_OPTIONS: SelectOption<Api.AiManage.ModelConfigType>[] = [
  { label: 'Chat', value: 1 },
  { label: 'Embedding', value: 2 },
  { label: 'Image', value: 3 },
  { label: 'Audio', value: 4 },
  { label: 'Reasoning', value: 5 }
]

export const ENABLED_OPTIONS: SelectOption<boolean>[] = [
  { label: '启用', value: true },
  { label: '停用', value: false }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getModelConfigTypeLabel = (value: Api.AiManage.ModelConfigType) =>
  getOptionLabel(MODEL_CONFIG_TYPE_OPTIONS, value)

export const getEnabledLabel = (value: boolean) => getOptionLabel(ENABLED_OPTIONS, value)

export const getModelConfigTypeTagType = (value: Api.AiManage.ModelConfigType) => {
  switch (value) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'danger'
    case 4:
      return 'info'
    case 5:
      return 'primary'
    default:
      return 'info'
  }
}

export const getEnabledTagType = (value: boolean) => (value ? 'success' : 'info')
