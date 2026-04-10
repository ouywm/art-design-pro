export interface NumericEnumOption {
  label: string
  value: number
  listClass?: string
}

export interface DictLikeItem {
  label: string
  value: string | number
  listClass?: string
}

export const AI_CHANNEL_TYPE_OPTIONS: NumericEnumOption[] = [
  { label: 'OpenAI', value: 1, listClass: 'primary' },
  { label: 'Anthropic', value: 3, listClass: 'success' },
  { label: 'Azure', value: 14, listClass: 'info' },
  { label: 'Baidu', value: 15, listClass: 'warning' },
  { label: 'Ali', value: 17, listClass: 'warning' },
  { label: 'Gemini', value: 24, listClass: 'success' },
  { label: 'Ollama', value: 28, listClass: 'info' }
]

export const AI_CHANNEL_STATUS_OPTIONS: NumericEnumOption[] = [
  { label: '启用', value: 1, listClass: 'success' },
  { label: '手动禁用', value: 2, listClass: 'warning' },
  { label: '自动禁用', value: 3, listClass: 'danger' },
  { label: '归档', value: 4, listClass: 'info' }
]

export const AI_CHANNEL_ACCOUNT_STATUS_OPTIONS: NumericEnumOption[] = [
  { label: '启用', value: 1, listClass: 'success' },
  { label: '禁用', value: 2, listClass: 'warning' },
  { label: '额度耗尽', value: 3, listClass: 'danger' },
  { label: '过期', value: 4, listClass: 'info' },
  { label: '冷却中', value: 5, listClass: 'warning' }
]

export function buildNumericDictOptions(
  dictItems: DictLikeItem[] | undefined,
  fallbackOptions: NumericEnumOption[]
): NumericEnumOption[] {
  if (!Array.isArray(dictItems) || dictItems.length === 0) {
    return fallbackOptions
  }

  return dictItems.map((item) => ({
    label: item.label,
    value: Number(item.value),
    listClass: item.listClass || ''
  }))
}

export function getNumericEnumMeta(
  dictItems: DictLikeItem[] | undefined,
  fallbackOptions: NumericEnumOption[],
  value: number | undefined | null
): NumericEnumOption {
  if (value == null) {
    return { label: '-', value: -1, listClass: 'info' }
  }

  const normalizedValue = Number(value)
  const normalizedItems = buildNumericDictOptions(dictItems, fallbackOptions)
  const matched = normalizedItems.find((item) => item.value === normalizedValue)

  return (
    matched || {
      label: String(value),
      value: normalizedValue,
      listClass: 'info'
    }
  )
}
