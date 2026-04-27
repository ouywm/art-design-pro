import request from '@/utils/http'

export function fetchGetRequestLogList(params: Api.AiManage.RequestLogQueryParams) {
  return request.get<Api.AiManage.RequestLogList>({
    url: '/api/request-log/list',
    params
  })
}

export function fetchGetRequestLogDetail(id: number) {
  return request.get<Api.AiManage.RequestLogVo>({
    url: `/api/request-log/${id}`
  })
}

export function fetchGetRequestDetail(id: number) {
  return request.get<Api.AiManage.RequestDetailVo>({
    url: `/api/request/${id}`
  })
}

export function fetchGetRequestDetailByRequestId(requestId: string) {
  return request.get<Api.AiManage.RequestDetailVo>({
    url: `/api/request/by-request-id/${requestId}`
  })
}
