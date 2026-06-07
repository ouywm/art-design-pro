import type { VNode } from 'vue'

export type DataSelectValue = string | number
export type DataSelectMode = 'table' | 'tree'
export type DataSelectFilterType = 'input' | 'select'
export type DataSelectFilterValue = string | number | boolean | undefined

export interface DataSelectRecord {
  [key: string]: unknown
  children?: DataSelectRecord[]
}

export interface DataSelectColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  formatter?: (row: DataSelectRecord) => string | number | VNode
}

export interface DataSelectRequestParams {
  page: number
  size: number
  keyword?: string
  [key: string]: unknown
}

export type DataSelectRequestResult =
  | DataSelectRecord[]
  | {
      content?: DataSelectRecord[]
      total_elements?: number
      totalElements?: number
      total?: number
    }

export type DataSelectRequest = (
  params: DataSelectRequestParams
) => Promise<DataSelectRequestResult>

export interface DataSelectFilterOption {
  label: string
  value: string | number | boolean
}

export interface DataSelectFilterItem {
  key: string
  label: string
  type?: DataSelectFilterType
  placeholder?: string
  options?: DataSelectFilterOption[]
  width?: string | number
}
