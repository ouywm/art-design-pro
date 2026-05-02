export type ChannelAccountListItem = Api.AiManage.ChannelAccountVo
export type ChannelAccountDetailVo = Api.AiManage.ChannelAccountDetailVo

export interface ChannelOption {
  label: string
  value: number
  channelType: Api.AiManage.ChannelType
  status: Api.AiManage.ChannelStatus
  models: string[]
  testModel: string
}

export type OpenAiOAuthDialogMode = 'create' | 'rebind'

export type SearchFormModel = Pick<
  Api.AiManage.ChannelAccountQueryParams,
  'channelId' | 'status' | 'credentialType' | 'keyword'
>

export interface FormModel {
  channelId: number | undefined
  name: string
  credentialType: string
  credentialsText: string
  redirectUri: string
  oauthSessionId: string
  oauthAuthUrl: string
  oauthCode: string
  oauthState: string
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

export interface OpenAiOAuthFormModel {
  channelId: number | undefined
  accountId: number | undefined
  name: string
  remark: string
  testModel: string
  redirectUri: string
  sessionId: string
  authUrl: string
  code: string
  state: string
}

export interface OpenAiOAuthPendingPayload {
  mode: OpenAiOAuthDialogMode
  createdAt: number
  sessionId: string
  redirectUri: string
  authUrl?: string
  channelId?: number
  accountId?: number
  name: string
  secretRef?: string
  status?: Api.AiManage.ChannelAccountStatus
  schedulable?: boolean
  priority?: number
  weight?: number
  rateMultiplier?: number
  concurrencyLimit?: number
  quotaLimit?: number
  remark?: string
  testModel?: string
  code?: string
  state?: string
}

export interface OpenAiOAuthCallbackParams {
  code?: string
  state?: string
  error?: string
  errorDescription?: string
}
