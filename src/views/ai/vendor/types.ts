export type VendorListItem = Api.AiVendor.VendorVo
export type VendorDetailVo = Api.AiVendor.VendorVo

export type VendorSearchFormModel = Api.AiVendor.VendorSearchFilters

export interface VendorFormModel {
  vendorCode: string
  vendorName: string
  apiStyle: string
  baseUrl: string
  docUrl: string
  icon: string
  description: string
  metadataText: string
  vendorSort: number | undefined
  enabled: boolean
  remark: string
}
