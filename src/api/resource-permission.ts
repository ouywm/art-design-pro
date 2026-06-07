import request from '@/utils/http'

/** 查询资源列表 */
export function fetchGetResourceList(params: Api.ResourcePermission.ResourceQuery) {
  return request.get<Api.ResourcePermission.ResourceList>({
    url: '/api/system/resource/list',
    params
  })
}

/** 查询资源选项 */
export function fetchGetResourceOptions() {
  return request.get<Api.ResourcePermission.ResourceOption[]>({
    url: '/api/system/resource/options'
  })
}

/** 查询资源详情 */
export function fetchGetResourceDetail(id: number) {
  return request.get<Api.ResourcePermission.Resource>({
    url: `/api/system/resource/${id}`
  })
}

/** 创建资源 */
export function fetchCreateResource(params: Api.ResourcePermission.CreateResourceRequest) {
  return request.post<null>({
    url: '/api/system/resource',
    params
  })
}

/** 更新资源 */
export function fetchUpdateResource(
  id: number,
  params: Api.ResourcePermission.UpdateResourceRequest
) {
  return request.put<null>({
    url: `/api/system/resource/${id}`,
    params
  })
}

/** 启用/停用资源 */
export function fetchUpdateResourceEnabled(
  id: number,
  params: Api.ResourcePermission.UpdateResourceEnabledRequest
) {
  return request.put<null>({
    url: `/api/system/resource/${id}/enabled`,
    params
  })
}

/** 删除资源 */
export function fetchDeleteResource(id: number) {
  return request.del<null>({
    url: `/api/system/resource/${id}`
  })
}

/** 查询按钮绑定的资源 */
export function fetchGetActionResources(actionMenuId: number) {
  return request.get<Api.ResourcePermission.ActionResource>({
    url: `/api/system/action-resource/action/${actionMenuId}`
  })
}

/** 保存按钮绑定的资源 */
export function fetchSaveActionResources(
  actionMenuId: number,
  params: Api.ResourcePermission.SaveActionResourcesRequest
) {
  return request.put<null>({
    url: `/api/system/action-resource/action/${actionMenuId}`,
    params
  })
}

/** 查询资源关联的按钮 */
export function fetchGetResourceActions(resourceId: number) {
  return request.get<Api.ResourcePermission.ResourceAction>({
    url: `/api/system/action-resource/resource/${resourceId}`
  })
}

/** 手动刷新资源权限策略 */
export function fetchReloadResourcePermission() {
  return request.post<null>({
    url: '/api/system/resource-permission/reload'
  })
}
