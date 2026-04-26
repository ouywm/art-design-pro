import request from '@/utils/http'

export function fetchGetChannelAccountList(params: Api.AiManage.ChannelAccountQueryParams) {
  return request.get<Api.AiManage.ChannelAccountList>({
    url: '/api/channel-account/list',
    params
  })
}

export function fetchGetChannelAccountDetail(id: number) {
  return request.get<Api.AiManage.ChannelAccountDetailVo>({
    url: `/api/channel-account/${id}`
  })
}

export function fetchCreateChannelAccount(params: Api.AiManage.CreateChannelAccountParams) {
  return request.post<null>({
    url: '/api/channel-account',
    params
  })
}

export function fetchUpdateChannelAccount(
  id: number,
  params: Api.AiManage.UpdateChannelAccountParams
) {
  return request.put<null>({
    url: `/api/channel-account/${id}`,
    params
  })
}

export function fetchDeleteChannelAccount(id: number) {
  return request.del<null>({
    url: `/api/channel-account/${id}`
  })
}
