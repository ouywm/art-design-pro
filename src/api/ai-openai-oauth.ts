import request from '@/utils/http'

export function fetchGenerateOpenAiOAuthAuthUrl(
  params: Api.AiManage.GenerateOpenAiOAuthAuthUrlParams
) {
  return request.post<Api.AiManage.OpenAiOAuthAuthUrlVo>({
    url: '/api/openai-oauth/auth-url',
    params
  })
}

export function fetchExchangeOpenAiOAuthCode(params: Api.AiManage.ExchangeOpenAiOAuthCodeParams) {
  return request.post<Api.AiManage.OpenAiOAuthExchangeVo>({
    url: '/api/openai-oauth/exchange',
    params
  })
}

export function fetchRefreshOpenAiOAuthToken(params: Api.AiManage.RefreshOpenAiOAuthTokenParams) {
  return request.post<Api.AiManage.OpenAiOAuthRefreshVo>({
    url: '/api/openai-oauth/refresh',
    params
  })
}
