export type AbilityListItem = Api.AiManage.AbilityVo
export type AbilityDetailVo = Api.AiManage.AbilityVo

export interface ChannelOption {
  label: string
  value: number
  status: Api.AiManage.ChannelStatus
}

export type SearchFormModel = Pick<
  Api.AiManage.AbilityQueryParams,
  'channelGroup' | 'endpointScope' | 'model' | 'channelId' | 'enabled' | 'keyword'
>

export interface FormModel {
  channelGroup: string
  endpointScope: string
  model: string
  channelId: number | undefined
  enabled: boolean
  priority: number | undefined
  weight: number | undefined
  routeConfigText: string
}
