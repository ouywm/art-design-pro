import request from '@/utils/http'

/** 获取在线用户列表 */
export function fetchGetOnlineUserList(params: Api.Common.CommonSearchParams) {
  return request.get<Api.Online.OnlineUserList>({
    url: '/api/online/list',
    params
  })
}

/** 强制下线在线用户 */
export function fetchKickOnlineUser(loginId: string) {
  return request.del<null>({
    url: `/api/online/${encodeURIComponent(loginId)}`
  })
}

/** 踢下指定设备 */
export function fetchKickOnlineDevice(loginId: string, device: string) {
  return request.del<null>({
    url: `/api/online/${encodeURIComponent(loginId)}/${encodeURIComponent(device)}`
  })
}
