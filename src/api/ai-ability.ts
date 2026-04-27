import request from '@/utils/http'

export function fetchGetAbilityList(params: Api.AiManage.AbilityQueryParams) {
  return request.get<Api.AiManage.AbilityList>({
    url: '/api/ability/list',
    params
  })
}

export function fetchGetAbilityDetail(id: number) {
  return request.get<Api.AiManage.AbilityVo>({
    url: `/api/ability/${id}`
  })
}

export function fetchCreateAbility(params: Api.AiManage.CreateAbilityParams) {
  return request.post<null>({
    url: '/api/ability',
    params
  })
}

export function fetchUpdateAbility(id: number, params: Api.AiManage.UpdateAbilityParams) {
  return request.put<null>({
    url: `/api/ability/${id}`,
    params
  })
}

export function fetchDeleteAbility(id: number) {
  return request.del<null>({
    url: `/api/ability/${id}`
  })
}
