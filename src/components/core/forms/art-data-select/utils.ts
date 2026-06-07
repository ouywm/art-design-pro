import type { DataSelectRecord, DataSelectRequestParams, DataSelectValue } from './types'

export interface DataSelectRequestBuildOptions {
  page: number
  size: number
  keyword?: string
  filters?: Record<string, unknown>
  extraParams?: Record<string, unknown>
}

export interface DataSelectNormalizedResponse {
  records: DataSelectRecord[]
  total: number
}

export function buildDataSelectRequestParams(
  options: DataSelectRequestBuildOptions
): DataSelectRequestParams {
  const params: DataSelectRequestParams = {
    page: options.page,
    size: options.size,
    ...compactRecord(options.extraParams)
  }

  const keyword = options.keyword?.trim()
  if (keyword) {
    params.keyword = keyword
  }

  return {
    ...params,
    ...compactRecord(options.filters)
  }
}

export function normalizeDataSelectResponse(response: unknown): DataSelectNormalizedResponse {
  if (Array.isArray(response)) {
    return {
      records: response as DataSelectRecord[],
      total: response.length
    }
  }

  if (response && typeof response === 'object') {
    const data = response as Record<string, unknown>
    const content = Array.isArray(data.content) ? data.content : []
    const total = data.total_elements ?? data.totalElements ?? data.total ?? content.length

    return {
      records: content as DataSelectRecord[],
      total: Number(total) || 0
    }
  }

  return {
    records: [],
    total: 0
  }
}

export function normalizeDataSelectPageSizes(pageSizes: number[], activePageSize: number) {
  const sizes = [...pageSizes, activePageSize]
    .map((size) => Math.trunc(Number(size)))
    .filter((size) => Number.isFinite(size) && size > 0)

  const uniqueSizes = Array.from(new Set(sizes)).sort((a, b) => a - b)
  return uniqueSizes.length > 0 ? uniqueSizes : [10]
}

export function sliceDataSelectPage<T>(records: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, Math.trunc(Number(page)) || 1)
  const safePageSize = Math.max(1, Math.trunc(Number(pageSize)) || 10)
  const start = (safePage - 1) * safePageSize

  return records.slice(start, start + safePageSize)
}

export function createSelectedRecordCache(valueKey: string) {
  const map = new Map<DataSelectValue, DataSelectRecord>()

  const getValue = (record: DataSelectRecord) => record[valueKey] as DataSelectValue

  return {
    merge(records: DataSelectRecord[]) {
      records.forEach((record) => {
        const value = getValue(record)
        if (value !== undefined && value !== null) {
          map.set(value, record)
        }
      })
    },
    prune(values: DataSelectValue[]) {
      const valueSet = new Set(values)
      Array.from(map.keys()).forEach((value) => {
        if (!valueSet.has(value)) {
          map.delete(value)
        }
      })
    },
    pick(values: DataSelectValue[]) {
      return values.map((value) => map.get(value)).filter(Boolean) as DataSelectRecord[]
    },
    entries() {
      return Array.from(map.values())
    },
    clear() {
      map.clear()
    }
  }
}

function compactRecord(record?: Record<string, unknown>) {
  if (!record) return {}

  return Object.fromEntries(
    Object.entries(record).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  )
}
