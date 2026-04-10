export type ChannelAccountListItem = Api.AiChannelAccount.ChannelAccountVo
export type ChannelAccountStatus = Api.AiChannelAccount.ChannelAccountStatus

export type ChannelAccountSearchFormModel = Api.AiChannelAccount.ChannelAccountSearchFilters

export interface ChannelAccountFormModel {
  channelId: number | undefined
  name: string
  credentialType: string
  credentialsText: string
  secretRef: string
  status: ChannelAccountStatus | undefined
  schedulable: boolean
  priority: number | undefined
  weight: number | undefined
  rateMultiplier: number | undefined
  concurrencyLimit: number | undefined
  quotaLimit: number | undefined
  balance: number | undefined
  expiresAt: string | null
  testModel: string
  extraText: string
  remark: string
}
