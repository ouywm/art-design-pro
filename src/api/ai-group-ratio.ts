import request from '@/utils/http'

export function fetchGetGroupRatioList(params: Api.AiManage.GroupRatioQueryParams) {
  return request.get<Api.AiManage.GroupRatioList>({
    url: '/api/group-ratio/list',
    params
  })
}

export function fetchGetGroupRatioDetail(id: number) {
  return request.get<Api.AiManage.GroupRatioVo>({
    url: `/api/group-ratio/${id}`
  })
}

export function fetchCreateGroupRatio(params: Api.AiManage.CreateGroupRatioParams) {
  return request.post<null>({
    url: '/api/group-ratio',
    params
  })
}

export function fetchUpdateGroupRatio(id: number, params: Api.AiManage.UpdateGroupRatioParams) {
  return request.put<null>({
    url: `/api/group-ratio/${id}`,
    params
  })
}

export function fetchDeleteGroupRatio(id: number) {
  return request.del<null>({
    url: `/api/group-ratio/${id}`
  })
}
