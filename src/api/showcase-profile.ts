import request from '@/utils/http'

/** 获取展示档案列表 */
export function fetchGetShowcaseProfileList(
  params: Api.ShowcaseProfile.ShowcaseProfileSearchParams
) {
  return request.get<Api.ShowcaseProfile.ShowcaseProfileList>({
    url: '/api/showcase_profile/list',
    params
  })
}

/** 获取展示档案详情 */
export function fetchGetShowcaseProfileDetail(id: number) {
  return request.get<Api.ShowcaseProfile.ShowcaseProfileDetailVo>({
    url: `/api/showcase_profile/${id}`
  })
}

/** 创建展示档案 */
export function fetchCreateShowcaseProfile(
  params: Api.ShowcaseProfile.CreateShowcaseProfileParams
) {
  return request.post<null>({
    url: '/api/showcase_profile',
    params
  })
}

/** 更新展示档案 */
export function fetchUpdateShowcaseProfile(
  id: number,
  params: Api.ShowcaseProfile.UpdateShowcaseProfileParams
) {
  return request.put<null>({
    url: `/api/showcase_profile/${id}`,
    params
  })
}

/** 删除展示档案 */
export function fetchDeleteShowcaseProfile(id: number) {
  return request.del<null>({
    url: `/api/showcase_profile/${id}`
  })
}
