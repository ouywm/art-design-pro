type TagType = 'success' | 'warning' | 'danger' | 'info'

const REQUEST_STATUS_META: Record<number, { text: string; type: TagType }> = {
  1: { text: '待处理', type: 'info' },
  2: { text: '处理中', type: 'warning' },
  3: { text: '成功', type: 'success' },
  4: { text: '失败', type: 'danger' },
  5: { text: '已取消', type: 'info' }
}

const EXECUTION_STATUS_META: Record<number, { text: string; type: TagType }> = {
  1: { text: '待执行', type: 'info' },
  2: { text: '执行中', type: 'warning' },
  3: { text: '成功', type: 'success' },
  4: { text: '失败', type: 'danger' },
  5: { text: '已取消', type: 'info' }
}

export function getRequestStatusMeta(status: number) {
  return REQUEST_STATUS_META[status] || { text: `未知(${status})`, type: 'info' as const }
}

export function getExecutionStatusMeta(status: number) {
  return EXECUTION_STATUS_META[status] || { text: `未知(${status})`, type: 'info' as const }
}

export function formatJsonValue(value: unknown): string {
  if (value == null) {
    return ''
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  try {
    return JSON.stringify(JSON.parse(String(value)), null, 2)
  } catch {
    return String(value)
  }
}

export function formatLatencyMs(value?: number | null): string {
  if (value == null || value < 0) {
    return '-'
  }

  return `${value} ms`
}

export function buildRequestModelMeta(
  requestedModel?: string | null,
  upstreamModel?: string | null
) {
  const primary = (requestedModel || '-').trim() || '-'
  const secondary = (upstreamModel || '').trim()

  if (!secondary || secondary === primary) {
    return {
      primary,
      secondary: ''
    }
  }

  return {
    primary,
    secondary
  }
}

export function formatRequestTime(value?: string | null): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  const seconds = `${date.getSeconds()}`.padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
