import request from '@/utils/http'

export function fetchGetRoutingRuleList(params: Api.AiManage.RoutingRuleQueryParams) {
  return request.get<Api.AiManage.RoutingRuleList>({
    url: '/api/routing-rule/list',
    params
  })
}

export function fetchGetRoutingRuleDetail(id: number) {
  return request.get<Api.AiManage.RoutingRuleVo>({
    url: `/api/routing-rule/${id}`
  })
}

export function fetchCreateRoutingRule(params: Api.AiManage.CreateRoutingRuleParams) {
  return request.post<null>({
    url: '/api/routing-rule',
    params
  })
}

export function fetchUpdateRoutingRule(id: number, params: Api.AiManage.UpdateRoutingRuleParams) {
  return request.put<null>({
    url: `/api/routing-rule/${id}`,
    params
  })
}

export function fetchDeleteRoutingRule(id: number) {
  return request.del<null>({
    url: `/api/routing-rule/${id}`
  })
}
