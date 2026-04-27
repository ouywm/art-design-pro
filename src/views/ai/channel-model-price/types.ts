export type ChannelModelPriceListItem = Api.AiManage.ChannelModelPriceVo
export type ChannelModelPriceDetailVo = Api.AiManage.ChannelModelPriceDetailVo
export type ChannelModelPriceVersionVo = Api.AiManage.ChannelModelPriceVersionVo

export interface ChannelOption {
  label: string
  value: number
  status: Api.AiManage.ChannelStatus
}

export type SearchFormModel = Pick<
  Api.AiManage.ChannelModelPriceQueryParams,
  'channelId' | 'modelName' | 'status' | 'billingMode' | 'keyword'
>

export interface FormModel {
  channelId: number | undefined
  modelName: string
  billingMode: Api.AiManage.ChannelModelPriceBillingMode | undefined
  currency: string
  inputPerMillion: string
  outputPerMillion: string
  cacheReadPerMillion: string
  cacheWritePerMillion: string
  reasoningPerMillion: string
  status: Api.AiManage.ChannelModelPriceStatus | undefined
  remark: string
}
