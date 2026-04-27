import type { SelectOption } from '../channel/constants'

export const CHANNEL_MODEL_PRICE_BILLING_MODE_OPTIONS: SelectOption<Api.AiManage.ChannelModelPriceBillingMode>[] =
  [
    { label: '按 Token', value: 1 },
    { label: '按请求', value: 2 },
    { label: '按媒体单位', value: 3 }
  ]

export const SUPPORTED_BILLING_MODE_OPTIONS: SelectOption<Api.AiManage.ChannelModelPriceBillingMode>[] =
  [{ label: '按 Token', value: 1 }]

export const CHANNEL_MODEL_PRICE_STATUS_OPTIONS: SelectOption<Api.AiManage.ChannelModelPriceStatus>[] =
  [
    { label: '启用', value: 1 },
    { label: '停用', value: 2 }
  ]

export const CHANNEL_MODEL_PRICE_VERSION_STATUS_OPTIONS: SelectOption<Api.AiManage.ChannelModelPriceVersionStatus>[] =
  [
    { label: '生效中', value: 1 },
    { label: '已归档', value: 2 }
  ]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getChannelModelPriceBillingModeLabel = (
  value: Api.AiManage.ChannelModelPriceBillingMode
) => getOptionLabel(CHANNEL_MODEL_PRICE_BILLING_MODE_OPTIONS, value)

export const getChannelModelPriceStatusLabel = (value: Api.AiManage.ChannelModelPriceStatus) =>
  getOptionLabel(CHANNEL_MODEL_PRICE_STATUS_OPTIONS, value)

export const getChannelModelPriceVersionStatusLabel = (
  value: Api.AiManage.ChannelModelPriceVersionStatus
) => getOptionLabel(CHANNEL_MODEL_PRICE_VERSION_STATUS_OPTIONS, value)

export const getChannelModelPriceStatusTagType = (value: Api.AiManage.ChannelModelPriceStatus) =>
  value === 1 ? 'success' : 'info'

export const getChannelModelPriceVersionStatusTagType = (
  value: Api.AiManage.ChannelModelPriceVersionStatus
) => (value === 1 ? 'success' : 'info')

export const getChannelModelPriceBillingModeTagType = (
  value: Api.AiManage.ChannelModelPriceBillingMode
) => {
  switch (value) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'info'
    default:
      return 'info'
  }
}
