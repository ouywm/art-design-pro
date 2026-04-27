import request from '@/utils/http'

export function fetchGetUserQuotaList(params: Api.AiManage.UserQuotaQueryParams) {
  return request.get<Api.AiManage.UserQuotaList>({
    url: '/api/user-quota/list',
    params
  })
}

export function fetchGetUserQuotaDetail(id: number) {
  return request.get<Api.AiManage.UserQuotaVo>({
    url: `/api/user-quota/${id}`
  })
}

export function fetchCreateUserQuota(params: Api.AiManage.CreateUserQuotaParams) {
  return request.post<null>({
    url: '/api/user-quota',
    params
  })
}

export function fetchUpdateUserQuota(id: number, params: Api.AiManage.UpdateUserQuotaParams) {
  return request.put<null>({
    url: `/api/user-quota/${id}`,
    params
  })
}

export function fetchAdjustUserQuota(id: number, params: Api.AiManage.AdjustUserQuotaParams) {
  return request.post<null>({
    url: `/api/user-quota/${id}/adjust`,
    params
  })
}
