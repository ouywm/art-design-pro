import request from '@/utils/http'

export function fetchGetChannelList(params: Api.AiManage.ChannelQueryParams) {
  return request.get<Api.AiManage.ChannelList>({
    url: '/api/channel/list',
    params
  })
}

export function fetchGetChannelDetail(id: number) {
  return request.get<Api.AiManage.ChannelDetailVo>({
    url: `/api/channel/${id}`
  })
}

export function fetchCreateChannel(params: Api.AiManage.CreateChannelParams) {
  return request.post<null>({
    url: '/api/channel',
    params
  })
}

export function fetchUpdateChannel(id: number, params: Api.AiManage.UpdateChannelParams) {
  return request.put<null>({
    url: `/api/channel/${id}`,
    params
  })
}

export function fetchDeleteChannel(id: number) {
  return request.del<null>({
    url: `/api/channel/${id}`
  })
}

export function fetchBatchDeleteChannels(params: Api.AiManage.BatchDeleteChannelParams) {
  return request.post<{ deleted: number }>({
    url: '/api/channel/batch-delete',
    params
  })
}

export function fetchGetChannelStatusCounts(params?: { channelType?: Api.AiManage.ChannelType }) {
  return request.get<Api.AiManage.ChannelStatusCountsVo>({
    url: '/api/channel/status-counts',
    params
  })
}
