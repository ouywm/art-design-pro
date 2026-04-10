const SUMMARY_KEYS = [
  'input',
  'output',
  'cacheRead',
  'cacheWrite',
  'reasoning',
  'request',
  'image',
  'audio',
  'video'
]

export function parseJsonText(value: string): unknown | undefined {
  const text = value.trim()
  if (!text) {
    return undefined
  }

  return JSON.parse(text)
}

export function stringifyJsonValue(value: unknown): string {
  if (value == null) {
    return ''
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function buildPriceConfigSummary(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '-'
  }

  const record = value as Record<string, unknown>
  const preferredParts = SUMMARY_KEYS.filter((key) => key in record).map(
    (key) => `${key}: ${record[key]}`
  )

  if (preferredParts.length > 0) {
    return preferredParts.slice(0, 3).join(' / ')
  }

  const entries = Object.entries(record)
  if (entries.length === 0) {
    return '-'
  }

  if (entries.length <= 3) {
    return entries.map(([key, itemValue]) => `${key}: ${itemValue}`).join(' / ')
  }

  return `${entries.length} pricing items`
}
