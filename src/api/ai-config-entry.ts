import request from '@/utils/http'

export function fetchGetConfigEntryList(params: Api.AiManage.ConfigEntryQueryParams) {
  return request.get<Api.AiManage.ConfigEntryList>({
    url: '/api/config-entry/list',
    params
  })
}

export function fetchGetConfigEntryDetail(id: number) {
  return request.get<Api.AiManage.ConfigEntryVo>({
    url: `/api/config-entry/${id}`
  })
}

export function fetchCreateConfigEntry(params: Api.AiManage.CreateConfigEntryParams) {
  return request.post<null>({
    url: '/api/config-entry',
    params
  })
}

export function fetchUpdateConfigEntry(id: number, params: Api.AiManage.UpdateConfigEntryParams) {
  return request.put<null>({
    url: `/api/config-entry/${id}`,
    params
  })
}

export function fetchDeleteConfigEntry(id: number) {
  return request.del<null>({
    url: `/api/config-entry/${id}`
  })
}
