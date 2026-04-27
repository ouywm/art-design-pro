export type ModelConfigListItem = Api.AiManage.ModelConfigVo

export interface VendorOption {
  label: string
  value: string
  enabled: boolean
}

export type SearchFormModel = Pick<
  Api.AiManage.ModelConfigQueryParams,
  'modelName' | 'modelType' | 'vendorCode' | 'enabled' | 'keyword'
>

export interface FormModel {
  modelName: string
  displayName: string
  modelType: Api.AiManage.ModelConfigType | undefined
  vendorCode: string
  supportedEndpoints: string[]
  inputRatio: number | undefined
  outputRatio: number | undefined
  cachedInputRatio: number | undefined
  reasoningRatio: number | undefined
  capabilities: string[]
  maxContext: number | undefined
  currency: string
  effectiveFrom: string
  metadataText: string
  enabled: boolean
  remark: string
}
