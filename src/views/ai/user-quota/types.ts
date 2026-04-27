export type UserQuotaListItem = Api.AiManage.UserQuotaVo
export type UserQuotaDetailVo = Api.AiManage.UserQuotaVo

export interface UserOption {
  label: string
  value: number
  status: Api.SystemManage.UserStatus
}

export type SearchFormModel = Pick<
  Api.AiManage.UserQuotaQueryParams,
  'userId' | 'status' | 'channelGroup' | 'keyword'
>

export interface FormModel {
  userId: number | undefined
  channelGroup: string
  status: Api.AiManage.UserQuotaStatus | undefined
  quota: number | undefined
  dailyQuotaLimit: number | undefined
  monthlyQuotaLimit: number | undefined
  remark: string
}

export interface AdjustFormModel {
  quotaDelta: number | undefined
  referenceNo: string
  reason: string
}
