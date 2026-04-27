import request from '@/utils/http'

export function fetchGetTokenList(params: Api.AiManage.TokenQueryParams) {
  return request.get<Api.AiManage.TokenList>({
    url: '/api/token/list',
    params
  })
}

export function fetchGetTokenDetail(id: number) {
  return request.get<Api.AiManage.TokenDetailVo>({
    url: `/api/token/${id}`
  })
}

export function fetchCreateToken(params: Api.AiManage.CreateTokenParams) {
  return request.post<Api.AiManage.CreatedTokenVo>({
    url: '/api/token',
    params
  })
}

export function fetchUpdateToken(id: number, params: Api.AiManage.UpdateTokenParams) {
  return request.put<null>({
    url: `/api/token/${id}`,
    params
  })
}

export function fetchUpdateTokenStatus(id: number, params: Api.AiManage.UpdateTokenStatusParams) {
  return request.put<null>({
    url: `/api/token/${id}/status`,
    params
  })
}

export function fetchRotateTokenKey(id: number) {
  return request.post<Api.AiManage.RotatedTokenKeyVo>({
    url: `/api/token/${id}/rotate-key`
  })
}

export function fetchDeleteToken(id: number) {
  return request.del<null>({
    url: `/api/token/${id}`
  })
}

export function fetchBatchDeleteTokens(params: Api.AiManage.BatchDeleteTokenParams) {
  return request.post<Api.AiManage.BatchDeleteTokenResult>({
    url: '/api/token/batch-delete',
    params
  })
}
