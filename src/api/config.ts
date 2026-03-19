import request from '@/utils/http'

/** 获取系统参数分组列表 */
export function fetchGetConfigGroupList(params: Api.ConfigGroup.ConfigGroupSearchParams) {
  return request.get<Api.ConfigGroup.ConfigGroupList>({
    url: '/api/config/group/list',
    params
  })
}

/** 获取系统参数分组详情 */
export function fetchGetConfigGroupDetail(id: number) {
  return request.get<Api.ConfigGroup.ConfigGroupVo>({
    url: `/api/config/group/${id}`
  })
}

/** 创建系统参数分组 */
export function fetchCreateConfigGroup(params: Api.ConfigGroup.CreateConfigGroupParams) {
  return request.post<null>({
    url: '/api/config/group',
    params
  })
}

/** 更新系统参数分组 */
export function fetchUpdateConfigGroup(
  id: number,
  params: Api.ConfigGroup.UpdateConfigGroupParams
) {
  return request.put<null>({
    url: `/api/config/group/${id}`,
    params
  })
}

/** 删除系统参数分组 */
export function fetchDeleteConfigGroup(id: number) {
  return request.del<null>({
    url: `/api/config/group/${id}`
  })
}

/** 按分组获取系统参数配置 */
export function fetchGetGroupedConfigList(params: Api.Config.ConfigGroupedQueryParams) {
  return request.get<Api.Config.ConfigGroupedList>({
    url: '/api/config/grouped',
    params
  })
}

/** 获取系统参数配置详情 */
export function fetchGetConfigDetail(id: number) {
  return request.get<Api.Config.ConfigDetailVo>({
    url: `/api/config/${id}`
  })
}

/** 创建系统参数配置 */
export function fetchCreateConfig(params: Api.Config.CreateConfigParams) {
  return request.post<null>({
    url: '/api/config',
    params
  })
}

/** 更新系统参数配置 */
export function fetchUpdateConfig(id: number, params: Api.Config.UpdateConfigParams) {
  return request.put<null>({
    url: `/api/config/${id}`,
    params
  })
}

/** 删除系统参数配置 */
export function fetchDeleteConfig(id: number) {
  return request.del<null>({
    url: `/api/config/${id}`
  })
}

/** 根据配置键获取配置 */
export function fetchGetConfigByKey(configKey: string) {
  return request.get<Api.Config.ConfigValueVo>({
    url: `/api/config/by-key/${configKey}`
  })
}

/** 批量获取配置 */
export function fetchGetConfigByKeys(params: Api.Config.ConfigKeysParams) {
  return request.post<Record<string, Api.Config.ConfigValueVo>>({
    url: '/api/config/by-keys',
    params
  })
}
