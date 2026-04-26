export type ChannelAccountListItem = Api.AiManage.ChannelAccountVo
export type ChannelAccountDetailVo = Api.AiManage.ChannelAccountDetailVo

export interface ChannelOption {
  label: string
  value: number
  channelType: Api.AiManage.ChannelType
  status: Api.AiManage.ChannelStatus
}

export type SearchFormModel = Pick<
  Api.AiManage.ChannelAccountQueryParams,
  'channelId' | 'status' | 'credentialType' | 'keyword'
>

export interface FormModel {
  channelId: number | undefined
  name: string
  credentialType: string
  credentialsText: string
  secretRef: string
  status: Api.AiManage.ChannelAccountStatus | undefined
  schedulable: boolean
  priority: number | undefined
  weight: number | undefined
  rateMultiplier: number | undefined
  concurrencyLimit: number | undefined
  quotaLimit: number | undefined
  testModel: string
  extraText: string
  remark: string
}
