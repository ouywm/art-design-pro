import type { BarDataItem, LineDataItem } from '@/types/component/chart'
import type { DailyStatsDimensionItem, DailyStatsSummaryData } from './types'

export interface SummaryCardItem {
  label: string
  value: string
  helper: string
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

export const DEFAULT_SUMMARY: DailyStatsSummaryData = {
  requestCount: 0,
  successCount: 0,
  failCount: 0,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  cachedTokens: 0,
  reasoningTokens: 0,
  quota: 0,
  costTotal: 0,
  avgElapsedTime: 0,
  avgFirstTokenTime: 0
}

const formatInt = (value: number) => new Intl.NumberFormat('zh-CN').format(Number(value || 0))

export const formatCompactNumber = (value: number) => {
  const amount = Number(value || 0)
  if (Math.abs(amount) >= 100000000) return `${(amount / 100000000).toFixed(2)}亿`
  if (Math.abs(amount) >= 10000) return `${(amount / 10000).toFixed(2)}万`
  return formatInt(amount)
}

export const formatCost = (value: number) => {
  const amount = Number(value || 0)
  return amount === 0 ? '0' : amount.toFixed(6)
}

export const formatRatio = (numerator: number, denominator: number) => {
  if (!denominator) return '0.00%'
  return `${((Number(numerator || 0) / Number(denominator || 0)) * 100).toFixed(2)}%`
}

export const buildSummaryCards = (summary: DailyStatsSummaryData): SummaryCardItem[] => [
  {
    label: '请求量',
    value: formatCompactNumber(summary.requestCount),
    helper: `成功率 ${formatRatio(summary.successCount, summary.requestCount)}`,
    type: 'primary'
  },
  {
    label: '总 Token',
    value: formatCompactNumber(summary.totalTokens),
    helper: `输入 ${formatCompactNumber(summary.promptTokens)} / 输出 ${formatCompactNumber(summary.completionTokens)}`,
    type: 'success'
  },
  {
    label: '配额消耗',
    value: formatCompactNumber(summary.quota),
    helper: `缓存 ${formatCompactNumber(summary.cachedTokens)} / 推理 ${formatCompactNumber(summary.reasoningTokens)}`,
    type: 'warning'
  },
  {
    label: '成本',
    value: formatCost(summary.costTotal),
    helper: `失败 ${formatCompactNumber(summary.failCount)}`,
    type: 'danger'
  },
  {
    label: '平均耗时',
    value: `${formatInt(summary.avgElapsedTime)} ms`,
    helper: `首 Token ${formatInt(summary.avgFirstTokenTime)} ms`,
    type: 'info'
  }
]

export const buildChannelChartData = (
  items: DailyStatsDimensionItem[]
): { xAxisData: string[]; barData: BarDataItem[] } => {
  const topItems = items.slice(0, 8)
  return {
    xAxisData: topItems.map((item) => `渠道 #${item.key}`),
    barData: [
      {
        name: '请求量',
        data: topItems.map((item) => Number(item.requestCount || 0))
      },
      {
        name: '失败量',
        data: topItems.map((item) => Number(item.failCount || 0))
      }
    ]
  }
}

export const buildModelChartData = (
  items: DailyStatsDimensionItem[]
): { xAxisData: string[]; lineData: LineDataItem[] } => {
  const topItems = items.slice(0, 8)
  return {
    xAxisData: topItems.map((item) => item.key || 'unknown'),
    lineData: [
      {
        name: '总 Token',
        data: topItems.map((item) => Number(item.totalTokens || 0)),
        showAreaColor: true
      },
      {
        name: '配额',
        data: topItems.map((item) => Number(item.quota || 0))
      }
    ]
  }
}
