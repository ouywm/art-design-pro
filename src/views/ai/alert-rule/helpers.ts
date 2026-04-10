type TagType = 'success' | 'warning' | 'danger' | 'info'

const ALERT_RULE_STATUS_META: Record<number, { text: string; type: TagType }> = {
  1: { text: '启用', type: 'success' },
  2: { text: '禁用', type: 'info' }
}

const ALERT_RULE_SEVERITY_META: Record<number, { text: string; type: TagType }> = {
  1: { text: 'P1', type: 'danger' },
  2: { text: 'P2', type: 'danger' },
  3: { text: 'P3', type: 'danger' },
  4: { text: 'P4', type: 'warning' }
}

export function getAlertRuleStatusMeta(status: number) {
  return ALERT_RULE_STATUS_META[status] || { text: `未知(${status})`, type: 'info' as const }
}

export function getAlertRuleSeverityMeta(severity: number) {
  return ALERT_RULE_SEVERITY_META[severity] || { text: `P${severity}`, type: 'info' as const }
}

export function buildAlertRuleJsonSummary(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '-'
  }

  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0) {
    return '-'
  }

  return entries
    .slice(0, 3)
    .map(([key, entryValue]) => `${key}: ${formatJsonSummaryValue(entryValue)}`)
    .join(', ')
}

function formatJsonSummaryValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return `[${value.length}]`
  }

  if (value && typeof value === 'object') {
    return '{...}'
  }

  return '-'
}
