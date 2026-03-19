import request from '@/utils/http'

/** 获取系统公告列表 */
export function fetchGetNoticeList(params: Api.Notice.NoticeSearchParams) {
  return request.get<Api.Notice.NoticeList>({
    url: '/api/notice/list',
    params
  })
}

/** 获取系统公告详情 */
export function fetchGetNoticeDetail(id: number) {
  return request.get<Api.Notice.NoticeDetailVo>({
    url: `/api/notice/${id}`
  })
}

/** 创建系统公告 */
export function fetchCreateNotice(params: Api.Notice.CreateNoticeParams) {
  return request.post<null>({
    url: '/api/notice',
    params
  })
}

/** 更新系统公告 */
export function fetchUpdateNotice(id: number, params: Api.Notice.UpdateNoticeParams) {
  return request.put<null>({
    url: `/api/notice/${id}`,
    params
  })
}

/** 删除系统公告 */
export function fetchDeleteNotice(id: number) {
  return request.del<null>({
    url: `/api/notice/${id}`
  })
}

/** 发布系统公告 */
export function fetchPublishNotice(id: number) {
  return request.put<null>({
    url: `/api/notice/${id}/publish`
  })
}

/** 撤回系统公告 */
export function fetchRevokeNotice(id: number) {
  return request.put<null>({
    url: `/api/notice/${id}/revoke`
  })
}

/** 置顶系统公告 */
export function fetchPinNotice(id: number) {
  return request.put<null>({
    url: `/api/notice/${id}/pin`
  })
}

/** 取消置顶系统公告 */
export function fetchUnpinNotice(id: number) {
  return request.put<null>({
    url: `/api/notice/${id}/unpin`
  })
}
