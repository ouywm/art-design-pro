import request from '@/utils/http'

export function fetchGetVendorList(params: Api.AiManage.VendorQueryParams) {
  return request.get<Api.AiManage.VendorList>({
    url: '/api/vendor/list',
    params
  })
}

export function fetchGetVendorDetail(id: number) {
  return request.get<Api.AiManage.VendorVo>({
    url: `/api/vendor/${id}`
  })
}

export function fetchCreateVendor(params: Api.AiManage.CreateVendorParams) {
  return request.post<null>({
    url: '/api/vendor',
    params
  })
}

export function fetchUpdateVendor(id: number, params: Api.AiManage.UpdateVendorParams) {
  return request.put<null>({
    url: `/api/vendor/${id}`,
    params
  })
}

export function fetchDeleteVendor(id: number) {
  return request.del<null>({
    url: `/api/vendor/${id}`
  })
}
