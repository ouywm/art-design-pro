export type DailyStatsListItem = Api.AiDailyStats.DailyStatsVo

export type DailyStatsSearchFormModel = Omit<
  Api.AiDailyStats.DailyStatsSearchFilters,
  'statsDateStart' | 'statsDateEnd'
> & {
  statsDateRange?: [string, string]
}
