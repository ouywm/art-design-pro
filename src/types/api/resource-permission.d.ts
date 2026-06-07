declare namespace Api {
  /** 资源权限管理 */
  namespace ResourcePermission {
    type ResourceMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

    interface Resource {
      id: number
      resourceName: string
      resourceCode: string
      method: ResourceMethod
      path: string
      description: string
      enabled: boolean
      createTime: string
      updateTime: string
    }

    interface ResourceOption {
      id: number
      resourceName: string
      resourceCode: string
      method: ResourceMethod
      path: string
      enabled: boolean
    }

    type ResourceList = Api.Common.PaginatedResponse<Resource>

    interface ResourceSearchFilters {
      id?: number
      resourceName?: string
      resourceCode?: string
      method?: ResourceMethod
      path?: string
      enabled?: boolean
    }

    interface ResourceQuery extends Api.Common.CommonSearchParams, ResourceSearchFilters {}

    interface CreateResourceRequest {
      resourceName: string
      resourceCode: string
      method: ResourceMethod
      path: string
      description?: string
      enabled?: boolean
    }

    interface UpdateResourceRequest {
      resourceName?: string
      resourceCode?: string
      method?: ResourceMethod
      path?: string
      description?: string
      enabled?: boolean
    }

    interface UpdateResourceEnabledRequest {
      enabled: boolean
    }

    interface ActionResource {
      actionMenuId: number
      actionTitle: string
      authMark: string
      resources: ResourceOption[]
    }

    interface SaveActionResourcesRequest {
      resourceIds: number[]
    }

    interface ResourceAction {
      resourceId: number
      resourceName: string
      resourceCode: string
      method: ResourceMethod
      path: string
      actions: ActionOption[]
    }

    interface ActionOption {
      id: number
      title: string
      authMark: string
      enabled: boolean
    }
  }
}
