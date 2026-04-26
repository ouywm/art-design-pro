export type VendorListItem = Api.AiManage.VendorVo

export type SearchFormModel = Pick<
  Api.AiManage.VendorQueryParams,
  'keyword' | 'vendorCode' | 'apiStyle' | 'enabled'
>

export interface FormModel {
  vendorCode: string
  vendorName: string
  apiStyle: Api.AiManage.ApiStyle | undefined
  icon: string
  description: string
  baseUrl: string
  docUrl: string
  metadataText: string
  vendorSort: number | undefined
  enabled: boolean
  remark: string
}
