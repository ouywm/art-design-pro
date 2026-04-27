export type ConfigEntryListItem = Api.AiManage.ConfigEntryVo
export type ConfigEntryDetailVo = Api.AiManage.ConfigEntryVo

export type SearchFormModel = Pick<
  Api.AiManage.ConfigEntryQueryParams,
  'scopeType' | 'scopeId' | 'category' | 'configKey' | 'status' | 'keyword'
>

export interface FormModel {
  scopeType: Api.AiManage.ConfigEntryScopeType | undefined
  scopeId: number | undefined
  category: string
  configKey: string
  configValueText: string
  secretRef: string
  status: Api.AiManage.ConfigEntryStatus | undefined
  remark: string
}
