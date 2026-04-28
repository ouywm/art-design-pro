export type DailyStatsListItem = Api.AiManage.DailyStatsVo
export type DailyStatsSummaryData = Api.AiManage.DailyStatsSummaryVo
export type DailyStatsDimensionItem = Api.AiManage.DailyStatsDimensionVo
export type DashboardOverviewData = Api.AiManage.DashboardOverviewVo

export type SearchFormModel = Omit<
  Pick<
    Api.AiManage.DailyStatsQueryParams,
    'userId' | 'projectId' | 'channelId' | 'accountId' | 'modelName' | 'startDate' | 'endDate'
  >,
  'startDate' | 'endDate'
> & {
  statsDateRange?: [string, string]
}
