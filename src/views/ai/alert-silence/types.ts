export type AlertSilenceListItem = Api.AiAlertSilence.AlertSilenceVo
export type AlertSilenceStatus = Api.AiAlertSilence.AlertSilenceStatus

export type AlertSilenceSearchFormModel = Api.AiAlertSilence.AlertSilenceSearchFilters

export interface AlertSilenceFormModel {
  alertRuleId: number | undefined
  scopeType: string
  scopeKey: string
  reason: string
  metadataText: string
  startTime: string | null
  endTime: string | null
}
