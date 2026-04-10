export type AlertRuleListItem = Api.AiAlertRule.AlertRuleVo
export type AlertRuleDetailVo = Api.AiAlertRule.AlertRuleVo
export type AlertRuleStatus = Api.AiAlertRule.AlertRuleStatus

export type AlertRuleSearchFormModel = Api.AiAlertRule.AlertRuleSearchFilters

export interface AlertRuleFormModel {
  domainCode: string
  ruleCode: string
  ruleName: string
  severity: number | undefined
  metricKey: string
  conditionExpr: string
  thresholdConfigText: string
  channelConfigText: string
  silenceSeconds: number | undefined
  status: AlertRuleStatus | undefined
}
