type TagType = 'success' | 'warning' | 'danger' | 'info'

const ALERT_SILENCE_STATUS_META: Record<number, { text: string; type: TagType }> = {
  1: { text: '生效中', type: 'success' },
  2: { text: '已结束', type: 'info' }
}

export function getAlertSilenceStatusMeta(status: number) {
  return ALERT_SILENCE_STATUS_META[status] || { text: `未知(${status})`, type: 'info' as const }
}

export function formatAlertSilenceTime(value?: string | null): string {
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
