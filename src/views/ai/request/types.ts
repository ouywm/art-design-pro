export type RequestListItem = Api.AiRequest.RequestListItem
export type RequestDetailVo = Api.AiRequest.RequestDetailVo
export type RequestStatus = Api.AiRequest.RequestStatus
export type RequestExecutionListItem = Api.AiRequestExecution.RequestExecutionListItem

export type RequestSearchFormModel = Omit<
  Api.AiRequest.RequestSearchFilters,
  'createTimeStart' | 'createTimeEnd'
> & {
  createTimeRange?: [string, string]
}
