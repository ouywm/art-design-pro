export type ChannelListItem = Api.AiManage.ChannelVo
export type ChannelDetailVo = Api.AiManage.ChannelDetailVo

export interface VendorOption {
  label: string
  value: string
  enabled: boolean
}

export type SearchFormModel = Pick<
  Api.AiManage.ChannelQueryParams,
  'keyword' | 'status' | 'channelType' | 'vendorCode' | 'channelGroup'
>

export interface FormModel {
  name: string
  channelType: Api.AiManage.ChannelType | undefined
  vendorCode: string
  baseUrl: string
  modelsText: string
  modelMappingText: string
  channelGroup: string
  endpointScopes: string[]
  capabilities: string[]
  weight: number | undefined
  priority: number | undefined
  configText: string
  autoBan: boolean
  testModel: string
  status: Api.AiManage.ChannelStatus | undefined
  remark: string
}
