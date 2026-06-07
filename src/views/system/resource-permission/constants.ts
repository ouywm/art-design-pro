import type { ResourceMethod } from './types'

export const RESOURCE_METHOD_OPTIONS: Array<{ label: ResourceMethod; value: ResourceMethod }> = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' }
]

export const RESOURCE_METHOD_TAG_TYPE: Record<
  ResourceMethod,
  'primary' | 'success' | 'warning' | 'info' | 'danger'
> = {
  GET: 'primary',
  POST: 'success',
  PUT: 'warning',
  PATCH: 'info',
  DELETE: 'danger'
}
