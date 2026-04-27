import request from '@/utils/http'

export function fetchGetModelConfigList(params: Api.AiManage.ModelConfigQueryParams) {
  return request.get<Api.AiManage.ModelConfigList>({
    url: '/api/model-config/list',
    params
  })
}

export function fetchGetModelConfigDetail(id: number) {
  return request.get<Api.AiManage.ModelConfigVo>({
    url: `/api/model-config/${id}`
  })
}

export function fetchCreateModelConfig(params: Api.AiManage.CreateModelConfigParams) {
  return request.post<null>({
    url: '/api/model-config',
    params
  })
}

export function fetchUpdateModelConfig(id: number, params: Api.AiManage.UpdateModelConfigParams) {
  return request.put<null>({
    url: `/api/model-config/${id}`,
    params
  })
}

export function fetchDeleteModelConfig(id: number) {
  return request.del<null>({
    url: `/api/model-config/${id}`
  })
}
