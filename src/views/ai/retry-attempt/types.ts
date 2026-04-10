export type RetryAttemptListItem = Api.AiRetryAttempt.RetryAttemptListItem
export type RetryAttemptDetailVo = Api.AiRetryAttempt.RetryAttemptDetailVo
export type RetryAttemptStatus = Api.AiRetryAttempt.RetryAttemptStatus

export type RetryAttemptSearchFormModel = Omit<
  Api.AiRetryAttempt.RetryAttemptSearchFilters,
  'nextRetryAtStart' | 'nextRetryAtEnd' | 'createTimeStart' | 'createTimeEnd'
> & {
  nextRetryAtRange?: [string, string]
  createTimeRange?: [string, string]
}
