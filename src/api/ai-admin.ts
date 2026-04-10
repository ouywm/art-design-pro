import request from '@/utils/http'

/** 获取 AI 供应商列表 */
export function fetchGetAiVendorList(params: Api.AiVendor.VendorSearchParams) {
  return request.get<Api.AiVendor.VendorList>({
    url: '/api/ai/vendor/list',
    params
  })
}

/** 获取 AI 供应商详情 */
export function fetchGetAiVendorDetail(id: number) {
  return request.get<Api.AiVendor.VendorVo>({
    url: `/api/ai/vendor/${id}`
  })
}

/** 获取启用中的 AI 供应商 */
export function fetchGetEnabledAiVendorList() {
  return request.get<Api.AiVendor.VendorVo[]>({
    url: '/api/ai/vendor/enabled'
  })
}

/** 创建 AI 供应商 */
export function fetchCreateAiVendor(params: Api.AiVendor.CreateVendorParams) {
  return request.post<Api.AiVendor.VendorVo>({
    url: '/api/ai/vendor',
    params
  })
}

/** 更新 AI 供应商 */
export function fetchUpdateAiVendor(id: number, params: Api.AiVendor.UpdateVendorParams) {
  return request.put<Api.AiVendor.VendorVo>({
    url: `/api/ai/vendor/${id}`,
    params
  })
}

/** 删除 AI 供应商 */
export function fetchDeleteAiVendor(id: number) {
  return request.del<null>({
    url: `/api/ai/vendor/${id}`
  })
}

/** 获取 AI 渠道列表 */
export function fetchGetAiChannelList(params: Api.AiChannel.ChannelSearchParams) {
  return request.get<Api.AiChannel.ChannelList>({
    url: '/api/ai/channel/list',
    params
  })
}

/** 获取 AI 渠道详情 */
export function fetchGetAiChannelDetail(id: number) {
  return request.get<Api.AiChannel.ChannelDetailVo>({
    url: `/api/ai/channel/${id}`
  })
}

/** 创建 AI 渠道 */
export function fetchCreateAiChannel(params: Api.AiChannel.CreateChannelParams) {
  return request.post<null>({
    url: '/api/ai/channel',
    params
  })
}

/** 更新 AI 渠道 */
export function fetchUpdateAiChannel(id: number, params: Api.AiChannel.UpdateChannelParams) {
  return request.put<null>({
    url: `/api/ai/channel/${id}`,
    params
  })
}

/** 删除 AI 渠道 */
export function fetchDeleteAiChannel(id: number) {
  return request.del<null>({
    url: `/api/ai/channel/${id}`
  })
}

/** 获取 AI 渠道账号列表 */
export function fetchGetAiChannelAccountList(
  params: Api.AiChannelAccount.ChannelAccountSearchParams
) {
  return request.get<Api.AiChannelAccount.ChannelAccountList>({
    url: '/api/ai/channel-account/list',
    params
  })
}

/** 创建 AI 渠道账号 */
export function fetchCreateAiChannelAccount(
  params: Api.AiChannelAccount.CreateChannelAccountParams
) {
  return request.post<Api.AiChannelAccount.ChannelAccountVo>({
    url: '/api/ai/channel-account',
    params
  })
}

/** 更新 AI 渠道账号 */
export function fetchUpdateAiChannelAccount(
  id: number,
  params: Api.AiChannelAccount.UpdateChannelAccountParams
) {
  return request.put<Api.AiChannelAccount.ChannelAccountVo>({
    url: `/api/ai/channel-account/${id}`,
    params
  })
}

/** 删除 AI 渠道账号 */
export function fetchDeleteAiChannelAccount(id: number) {
  return request.del<null>({
    url: `/api/ai/channel-account/${id}`
  })
}

/** 获取 AI 渠道模型价格列表 */
export function fetchGetAiChannelModelPriceList(
  params: Api.AiChannelModelPrice.ChannelModelPriceSearchParams
) {
  return request.get<Api.AiChannelModelPrice.ChannelModelPriceList>({
    url: '/api/ai/channel-model-price/list',
    params
  })
}

/** 获取 AI 渠道模型价格详情 */
export function fetchGetAiChannelModelPriceDetail(id: number) {
  return request.get<Api.AiChannelModelPrice.ChannelModelPriceDetailVo>({
    url: `/api/ai/channel-model-price/${id}`
  })
}

/** 创建 AI 渠道模型价格 */
export function fetchCreateAiChannelModelPrice(
  params: Api.AiChannelModelPrice.CreateChannelModelPriceParams
) {
  return request.post<Api.AiChannelModelPrice.ChannelModelPriceVo>({
    url: '/api/ai/channel-model-price',
    params
  })
}

/** 更新 AI 渠道模型价格 */
export function fetchUpdateAiChannelModelPrice(
  id: number,
  params: Api.AiChannelModelPrice.UpdateChannelModelPriceParams
) {
  return request.put<Api.AiChannelModelPrice.ChannelModelPriceVo>({
    url: `/api/ai/channel-model-price/${id}`,
    params
  })
}

/** 删除 AI 渠道模型价格 */
export function fetchDeleteAiChannelModelPrice(id: number) {
  return request.del<null>({
    url: `/api/ai/channel-model-price/${id}`
  })
}

/** 获取 AI 请求列表 */
export function fetchGetAiRequestList(params: Api.AiRequest.RequestSearchParams) {
  return request.get<Api.AiRequest.RequestList>({
    url: '/api/ai/request/list',
    params
  })
}

/** 获取 AI 请求详情 */
export function fetchGetAiRequestDetail(id: number) {
  return request.get<Api.AiRequest.RequestDetailVo>({
    url: `/api/ai/request/${id}`
  })
}

/** 获取 AI 请求执行列表 */
export function fetchGetAiRequestExecutions(id: number, params: Api.Common.CommonSearchParams) {
  return request.get<Api.AiRequestExecution.RequestExecutionList>({
    url: `/api/ai/request/${id}/executions`,
    params
  })
}

/** 获取 AI 请求执行列表 */
export function fetchGetAiRequestExecutionList(
  params: Api.AiRequestExecution.RequestExecutionSearchParams
) {
  return request.get<Api.AiRequestExecution.RequestExecutionList>({
    url: '/api/ai/request-execution/list',
    params
  })
}

/** 获取 AI 请求执行详情 */
export function fetchGetAiRequestExecutionDetail(id: number) {
  return request.get<Api.AiRequestExecution.RequestExecutionDetailVo>({
    url: `/api/ai/request-execution/${id}`
  })
}

/** 获取 AI 重试记录列表 */
export function fetchGetAiRetryAttemptList(params: Api.AiRetryAttempt.RetryAttemptSearchParams) {
  return request.get<Api.AiRetryAttempt.RetryAttemptList>({
    url: '/api/ai/retry-attempt/list',
    params
  })
}

/** 获取 AI 重试记录详情 */
export function fetchGetAiRetryAttemptDetail(id: number) {
  return request.get<Api.AiRetryAttempt.RetryAttemptDetailVo>({
    url: `/api/ai/retry-attempt/${id}`
  })
}

/** 获取 AI 告警规则列表 */
export function fetchGetAiAlertRuleList(params: Api.AiAlertRule.AlertRuleSearchParams) {
  return request.get<Api.AiAlertRule.AlertRuleList>({
    url: '/api/ai/alert-rule/list',
    params
  })
}

/** 获取 AI 告警规则详情 */
export function fetchGetAiAlertRuleDetail(id: number) {
  return request.get<Api.AiAlertRule.AlertRuleVo>({
    url: `/api/ai/alert-rule/${id}`
  })
}

/** 创建 AI 告警规则 */
export function fetchCreateAiAlertRule(params: Api.AiAlertRule.CreateAlertRuleParams) {
  return request.post<Api.AiAlertRule.AlertRuleVo>({
    url: '/api/ai/alert-rule',
    params
  })
}

/** 更新 AI 告警规则 */
export function fetchUpdateAiAlertRule(id: number, params: Api.AiAlertRule.UpdateAlertRuleParams) {
  return request.put<Api.AiAlertRule.AlertRuleVo>({
    url: `/api/ai/alert-rule/${id}`,
    params
  })
}

/** 删除 AI 告警规则 */
export function fetchDeleteAiAlertRule(id: number) {
  return request.del<null>({
    url: `/api/ai/alert-rule/${id}`
  })
}

/** 获取 AI 告警事件列表 */
export function fetchGetAiAlertEventList(params: Api.AiAlertEvent.AlertEventSearchParams) {
  return request.get<Api.AiAlertEvent.AlertEventList>({
    url: '/api/ai/alert-event/list',
    params
  })
}

/** 获取 AI 告警事件详情 */
export function fetchGetAiAlertEventDetail(id: number) {
  return request.get<Api.AiAlertEvent.AlertEventVo>({
    url: `/api/ai/alert-event/${id}`
  })
}

/** 确认 AI 告警事件 */
export function fetchAckAiAlertEvent(id: number) {
  return request.put<Api.AiAlertEvent.AlertEventVo>({
    url: `/api/ai/alert-event/${id}/ack`
  })
}

/** 解决 AI 告警事件 */
export function fetchResolveAiAlertEvent(id: number) {
  return request.put<Api.AiAlertEvent.AlertEventVo>({
    url: `/api/ai/alert-event/${id}/resolve`
  })
}

/** 忽略 AI 告警事件 */
export function fetchIgnoreAiAlertEvent(id: number) {
  return request.put<Api.AiAlertEvent.AlertEventVo>({
    url: `/api/ai/alert-event/${id}/ignore`
  })
}

/** 获取 AI 告警静默列表 */
export function fetchGetAiAlertSilenceList(params: Api.AiAlertSilence.AlertSilenceSearchParams) {
  return request.get<Api.AiAlertSilence.AlertSilenceList>({
    url: '/api/ai/alert-silence/list',
    params
  })
}

/** 创建 AI 告警静默 */
export function fetchCreateAiAlertSilence(params: Api.AiAlertSilence.CreateAlertSilenceParams) {
  return request.post<Api.AiAlertSilence.AlertSilenceVo>({
    url: '/api/ai/alert-silence',
    params
  })
}

/** 删除 AI 告警静默 */
export function fetchDeleteAiAlertSilence(id: number) {
  return request.del<null>({
    url: `/api/ai/alert-silence/${id}`
  })
}

/** 获取 AI 日统计列表 */
export function fetchGetAiDailyStatsList(params: Api.AiDailyStats.DailyStatsSearchParams) {
  return request.get<Api.AiDailyStats.DailyStatsList>({
    url: '/api/ai/daily-stats/list',
    params
  })
}

/** 获取 Guardrail 配置列表 */
export function fetchGetAiGuardrailConfigList() {
  return request.get<Api.AiGuardrail.GuardrailConfigList>({
    url: '/api/ai/guardrail/config'
  })
}

/** 获取 Guardrail 配置详情 */
export function fetchGetAiGuardrailConfigDetail(id: number) {
  return request.get<Api.AiGuardrail.GuardrailConfigVo>({
    url: `/api/ai/guardrail/config/${id}`
  })
}

/** 创建 Guardrail 配置 */
export function fetchCreateAiGuardrailConfig(params: Api.AiGuardrail.CreateGuardrailConfigParams) {
  return request.post<Api.AiGuardrail.GuardrailConfigVo>({
    url: '/api/ai/guardrail/config',
    params
  })
}

/** 更新 Guardrail 配置 */
export function fetchUpdateAiGuardrailConfig(
  id: number,
  params: Api.AiGuardrail.UpdateGuardrailConfigParams
) {
  return request.put<Api.AiGuardrail.GuardrailConfigVo>({
    url: `/api/ai/guardrail/config/${id}`,
    params
  })
}

/** 删除 Guardrail 配置 */
export function fetchDeleteAiGuardrailConfig(id: number) {
  return request.del<null>({
    url: `/api/ai/guardrail/config/${id}`
  })
}

/** 获取 Guardrail 规则列表 */
export function fetchGetAiGuardrailRuleList(params: Api.AiGuardrail.GuardrailRuleSearchParams) {
  return request.get<Api.AiGuardrail.GuardrailRuleList>({
    url: '/api/ai/guardrail/rule',
    params
  })
}

/** 获取 Guardrail 违规记录列表 */
export function fetchGetAiGuardrailViolationList(
  params: Api.AiGuardrail.GuardrailViolationSearchParams
) {
  return request.get<Api.AiGuardrail.GuardrailViolationList>({
    url: '/api/ai/guardrail/violation',
    params
  })
}

/** 获取 Prompt Protection 规则列表 */
export function fetchGetAiPromptProtectionRuleList(params: Api.Common.CommonSearchParams) {
  return request.get<Api.AiGuardrail.PromptProtectionRuleList>({
    url: '/api/ai/guardrail/prompt-protection',
    params
  })
}

/** 获取 Guardrail 日统计列表 */
export function fetchGetAiGuardrailMetricDailyList(params: Api.Common.CommonSearchParams) {
  return request.get<Api.AiGuardrail.GuardrailMetricDailyList>({
    url: '/api/ai/guardrail/metric-daily',
    params
  })
}
