import type { DialogType } from '@/types'

export type ResourceMethod = Api.ResourcePermission.ResourceMethod
export type ResourceListItem = Api.ResourcePermission.Resource
export type ResourceSearchForm = Api.ResourcePermission.ResourceSearchFilters
export type ResourceFormMode = DialogType

export interface ResourceFormModel {
  resourceName: string
  resourceCode: string
  method: ResourceMethod
  path: string
  description: string
  enabled: boolean
}

export const createDefaultResourceForm = (): ResourceFormModel => ({
  resourceName: '',
  resourceCode: '',
  method: 'GET',
  path: '',
  description: '',
  enabled: true
})
