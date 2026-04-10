type TagType = 'success' | 'warning' | 'danger' | 'info'

const GUARDRAIL_SEVERITY_META: Record<number, { text: string; type: TagType }> = {
  1: { text: 'Low', type: 'info' },
  2: { text: 'Medium', type: 'warning' },
  3: { text: 'High', type: 'danger' }
}

const PROMPT_RULE_STATUS_META: Record<number, { text: string; type: TagType }> = {
  1: { text: '启用', type: 'success' },
  2: { text: '禁用', type: 'info' }
}

export function getGuardrailSeverityMeta(severity: number) {
  return GUARDRAIL_SEVERITY_META[severity] || { text: `S${severity}`, type: 'info' as const }
}

export function getPromptProtectionStatusMeta(status: number) {
  return PROMPT_RULE_STATUS_META[status] || { text: `未知(${status})`, type: 'info' as const }
}

export function formatGuardrailTime(value?: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  const seconds = `${date.getSeconds()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function buildJsonSummary(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '-'
  }

  const entries = Object.entries(value as Record<string, unknown>)
  if (!entries.length) return '-'

  return entries
    .slice(0, 3)
    .map(([key, item]) => `${key}: ${formatSummaryValue(item)}`)
    .join(', ')
}

function formatSummaryValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) return `[${value.length}]`
  if (value && typeof value === 'object') return '{...}'
  return '-'
}
