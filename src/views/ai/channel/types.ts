export type ChannelListItem = Api.AiChannel.ChannelListItem
export type ChannelDetailVo = Api.AiChannel.ChannelDetailVo
export type ChannelType = Api.AiChannel.ChannelType
export type ChannelStatus = Api.AiChannel.ChannelStatus
export type ChannelLastHealthStatus = Api.AiChannel.ChannelLastHealthStatus

export type ChannelSearchFormModel = Api.AiChannel.ChannelSearchFilters

export interface ChannelFormModel {
  name: string
  channelType: ChannelType | undefined
  vendorCode: string
  baseUrl: string
  channelGroup: string
  modelsText: string
  modelMappingText: string
  endpointScopes: string[]
  capabilitiesText: string
  configText: string
  weight: number | undefined
  priority: number | undefined
  autoBan: boolean
  testModel: string
  status: ChannelStatus | undefined
  remark: string
}
