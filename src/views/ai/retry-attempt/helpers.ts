type TagType = 'success' | 'warning' | 'danger' | 'info'

const RETRY_ATTEMPT_STATUS_META: Record<number, { text: string; type: TagType }> = {
  1: { text: '待重试', type: 'warning' },
  2: { text: '成功', type: 'success' },
  3: { text: '失败', type: 'danger' },
  4: { text: '已放弃', type: 'info' }
}

export function getRetryAttemptStatusMeta(status: number) {
  return RETRY_ATTEMPT_STATUS_META[status] || { text: `未知(${status})`, type: 'info' as const }
}

export function formatBackoffSeconds(value?: number | null): string {
  if (value == null || value < 0) {
    return '-'
  }

  return `${value} s`
}

export function formatRetryAttemptTime(value?: string | null): string {
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
