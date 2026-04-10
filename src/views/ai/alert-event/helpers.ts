type TagType = 'success' | 'warning' | 'danger' | 'info'

const ALERT_EVENT_STATUS_META: Record<number, { text: string; type: TagType }> = {
  1: { text: '打开', type: 'warning' },
  2: { text: '已确认', type: 'info' },
  3: { text: '已解决', type: 'success' },
  4: { text: '忽略', type: 'info' }
}

const ALERT_SEVERITY_META: Record<number, { text: string; type: TagType }> = {
  1: { text: 'P1', type: 'danger' },
  2: { text: 'P2', type: 'danger' },
  3: { text: 'P3', type: 'danger' },
  4: { text: 'P4', type: 'warning' }
}

export function getAlertEventStatusMeta(status: number) {
  return ALERT_EVENT_STATUS_META[status] || { text: `未知(${status})`, type: 'info' as const }
}

export function getAlertSeverityMeta(severity: number) {
  return ALERT_SEVERITY_META[severity] || { text: `P${severity}`, type: 'info' as const }
}

export function formatAlertEventTime(value?: string | null): string {
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
