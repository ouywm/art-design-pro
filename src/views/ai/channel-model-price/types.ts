export type ChannelModelPriceListItem = Api.AiChannelModelPrice.ChannelModelPriceVo
export type ChannelModelPriceDetailVo = Api.AiChannelModelPrice.ChannelModelPriceDetailVo
export type ChannelModelPriceVersionVo = Api.AiChannelModelPrice.ChannelModelPriceVersionVo
export type ChannelModelPriceBillingMode = Api.AiChannelModelPrice.ChannelModelPriceBillingMode
export type ChannelModelPriceStatus = Api.AiChannelModelPrice.ChannelModelPriceStatus
export type ChannelModelPriceVersionStatus = Api.AiChannelModelPrice.ChannelModelPriceVersionStatus

export type ChannelModelPriceSearchFormModel =
  Api.AiChannelModelPrice.ChannelModelPriceSearchFilters

export interface ChannelModelPriceFormModel {
  channelId: number | undefined
  modelName: string
  billingMode: ChannelModelPriceBillingMode | undefined
  currency: string
  priceConfigText: string
  status: ChannelModelPriceStatus | undefined
  referenceId: string
  remark: string
}
