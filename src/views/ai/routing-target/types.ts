export type RoutingTargetListItem = Api.AiManage.RoutingTargetVo
export type RoutingTargetDetailVo = Api.AiManage.RoutingTargetVo

export interface RoutingRuleOption {
  label: string
  value: number
  status: Api.AiManage.RoutingRuleStatus
}

export interface ChannelOption {
  label: string
  value: number
  status: Api.AiManage.ChannelStatus
}

export interface AccountOption {
  label: string
  value: number
  status: Api.AiManage.ChannelAccountStatus
}

export type SearchFormModel = Pick<
  Api.AiManage.RoutingTargetQueryParams,
  'routingRuleId' | 'targetType' | 'channelId' | 'status' | 'keyword'
>

export interface FormModel {
  routingRuleId: number | undefined
  targetType: Api.AiManage.RoutingTargetType
  channelId: number | undefined
  accountId: number | undefined
  pluginId: number | undefined
  targetKey: string
  weight: number | undefined
  priority: number | undefined
  cooldownSeconds: number | undefined
  configText: string
  status: Api.AiManage.RoutingTargetStatus | undefined
}
