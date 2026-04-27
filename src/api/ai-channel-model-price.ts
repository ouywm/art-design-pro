import request from '@/utils/http'

export function fetchGetChannelModelPriceList(params: Api.AiManage.ChannelModelPriceQueryParams) {
  return request.get<Api.AiManage.ChannelModelPriceList>({
    url: '/api/channel-model-price/list',
    params
  })
}

export function fetchGetChannelModelPriceDetail(id: number) {
  return request.get<Api.AiManage.ChannelModelPriceDetailVo>({
    url: `/api/channel-model-price/${id}`
  })
}

export function fetchGetChannelModelPriceVersions(id: number) {
  return request.get<Api.AiManage.ChannelModelPriceVersionVo[]>({
    url: `/api/channel-model-price/${id}/versions`
  })
}

export function fetchCreateChannelModelPrice(params: Api.AiManage.CreateChannelModelPriceParams) {
  return request.post<null>({
    url: '/api/channel-model-price',
    params
  })
}

export function fetchUpdateChannelModelPrice(
  id: number,
  params: Api.AiManage.UpdateChannelModelPriceParams
) {
  return request.put<null>({
    url: `/api/channel-model-price/${id}`,
    params
  })
}

export function fetchDeleteChannelModelPrice(id: number) {
  return request.del<null>({
    url: `/api/channel-model-price/${id}`
  })
}
