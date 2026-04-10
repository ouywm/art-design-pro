export type RequestExecutionListItem = Api.AiRequestExecution.RequestExecutionListItem
export type RequestExecutionDetailVo = Api.AiRequestExecution.RequestExecutionDetailVo
export type RequestExecutionStatus = Api.AiRequestExecution.RequestExecutionStatus

export type RequestExecutionSearchFormModel = Omit<
  Api.AiRequestExecution.RequestExecutionSearchFilters,
  'startedAtStart' | 'startedAtEnd'
> & {
  startedAtRange?: [string, string]
}
