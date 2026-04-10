export type AlertEventListItem = Api.AiAlertEvent.AlertEventVo
export type AlertEventDetailVo = Api.AiAlertEvent.AlertEventVo
export type AlertEventStatus = Api.AiAlertEvent.AlertEventStatus

export type AlertEventSearchFormModel = Omit<
  Api.AiAlertEvent.AlertEventSearchFilters,
  'lastTriggeredAtStart' | 'lastTriggeredAtEnd'
> & {
  lastTriggeredAtRange?: [string, string]
}
