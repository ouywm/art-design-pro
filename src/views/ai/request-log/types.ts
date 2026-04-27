export type RequestLogListItem = Api.AiManage.RequestLogVo
export type RequestDetailData = Api.AiManage.RequestDetailVo

export type SearchFormModel = Omit<
  Pick<
    Api.AiManage.RequestLogQueryParams,
    | 'keyword'
    | 'requestId'
    | 'status'
    | 'logType'
    | 'endpoint'
    | 'modelName'
    | 'userId'
    | 'tokenId'
    | 'channelId'
    | 'startTime'
    | 'endTime'
  >,
  'startTime' | 'endTime'
> & {
  requestTimeRange?: [string, string]
}
