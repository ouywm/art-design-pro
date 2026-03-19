import request from '@/utils/http'

/** 获取当前用户公告列表 */
export function fetchGetUserNoticeList(params: Api.UserNotice.UserNoticeSearchParams) {
  return request.get<Api.UserNotice.UserNoticeList>({
    url: '/api/user/notice/list',
    params
  })
}

/** 获取最新公告列表 */
export function fetchGetLatestUserNoticeList(params?: Api.UserNotice.UserNoticeLatestParams) {
  return request.get<Api.UserNotice.UserNoticeListItem[]>({
    url: '/api/user/notice/latest',
    params
  })
}

/** 获取未读公告数量 */
export function fetchGetUserNoticeUnreadCount() {
  return request.get<Api.UserNotice.NoticeUnreadCountVo>({
    url: '/api/user/notice/unread-count'
  })
}

/** 获取当前用户公告详情 */
export function fetchGetUserNoticeDetail(id: number) {
  return request.get<Api.UserNotice.UserNoticeDetailVo>({
    url: `/api/user/notice/${id}`
  })
}

/** 标记公告已读 */
export function fetchReadUserNotice(id: number) {
  return request.put<null>({
    url: `/api/user/notice/${id}/read`
  })
}

/** 全部公告标记已读 */
export function fetchReadAllUserNotice() {
  return request.put<null>({
    url: '/api/user/notice/read-all'
  })
}
