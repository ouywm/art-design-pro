export type GroupRatioListItem = Api.AiManage.GroupRatioVo
export type GroupRatioDetailVo = Api.AiManage.GroupRatioVo

export interface GroupCodeOption {
  label: string
  value: string
  enabled: boolean
}

export type SearchFormModel = Pick<
  Api.AiManage.GroupRatioQueryParams,
  'groupCode' | 'enabled' | 'keyword'
>

export interface FormModel {
  groupCode: string
  groupName: string
  ratio: number | undefined
  enabled: boolean
  modelWhitelist: string[]
  modelBlacklist: string[]
  endpointScopes: string[]
  fallbackGroupCode: string
  policyText: string
  remark: string
}
