export function formatCostTotal(value?: number | null): string {
  if (value == null || Number.isNaN(value)) {
    return '-'
  }

  return value.toFixed(4)
}

export function formatTokenCount(value?: number | null): string {
  if (value == null || Number.isNaN(value)) {
    return '-'
  }

  return value.toLocaleString('en-US')
}

export function formatStatsDate(value?: string | null): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return value
}
