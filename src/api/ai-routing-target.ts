import request from '@/utils/http'

export function fetchGetRoutingTargetList(params: Api.AiManage.RoutingTargetQueryParams) {
  return request.get<Api.AiManage.RoutingTargetList>({
    url: '/api/routing-target/list',
    params
  })
}

export function fetchGetRoutingTargetDetail(id: number) {
  return request.get<Api.AiManage.RoutingTargetVo>({
    url: `/api/routing-target/${id}`
  })
}

export function fetchCreateRoutingTarget(params: Api.AiManage.CreateRoutingTargetParams) {
  return request.post<null>({
    url: '/api/routing-target',
    params
  })
}

export function fetchUpdateRoutingTarget(
  id: number,
  params: Api.AiManage.UpdateRoutingTargetParams
) {
  return request.put<null>({
    url: `/api/routing-target/${id}`,
    params
  })
}

export function fetchDeleteRoutingTarget(id: number) {
  return request.del<null>({
    url: `/api/routing-target/${id}`
  })
}
