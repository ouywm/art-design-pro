export type UserNoticeListItem = Api.UserNotice.UserNoticeListItem
export type UserNoticeDetailVo = Api.UserNotice.UserNoticeDetailVo

export type UserNoticeSearchFormModel = Api.UserNotice.UserNoticeSearchFilters

export type UserNoticeFilterMode = 'all' | 'unread'

export interface UserNoticeInboxSearchModel {
  keyword?: string
  filterMode: UserNoticeFilterMode
}

export type UserNoticeInboxDetail = UserNoticeDetailVo & {
  noticeSummary?: string | null
  publishBy?: string | null
}
