export type TokenListItem = Api.AiManage.TokenVo
export type TokenDetailData = Api.AiManage.TokenDetailVo

export interface UserOption {
  label: string
  value: number
  status: Api.SystemManage.UserStatus
}

export type SearchFormModel = Pick<
  Api.AiManage.TokenQueryParams,
  | 'keyword'
  | 'userId'
  | 'status'
  | 'keyPrefix'
  | 'groupCodeOverride'
  | 'serviceAccountId'
  | 'projectId'
>

export interface FormModel {
  userId: number | undefined
  serviceAccountId: number | undefined
  projectId: number | undefined
  name: string
  remainQuota: number | undefined
  unlimitedQuota: boolean
  modelsText: string
  endpointScopes: string[]
  ipWhitelistText: string
  ipBlacklistText: string
  groupCodeOverride: string
  rpmLimit: number | undefined
  tpmLimit: number | undefined
  concurrencyLimit: number | undefined
  dailyQuotaLimit: number | undefined
  monthlyQuotaLimit: number | undefined
  expireTime: string
  status: Api.AiManage.TokenStatus | undefined
  remark: string
}

export interface TokenKeyResult {
  action: 'create' | 'rotate'
  tokenName: string
  keyPrefix: string
  rawKey: string
}
