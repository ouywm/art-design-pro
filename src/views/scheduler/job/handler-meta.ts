// handler 元数据(前端可选元数据补全表)
//
// 后端 GET /api/scheduler/handlers 返回的是真实可用 handler 列表(name 字段),
// 这里仅作为前端补全的可选元数据来源 —— 给 UI 提供中文 label / 描述 / 类别 /
// 推荐参数 schema。如果后端 handler 在此处未登记,UI 会 fallback 到 handler 原值。

export interface HandlerParamSchema {
  key: string
  label: string
  description?: string
  type: 'number' | 'switch' | 'string'
  default: unknown
  min?: number
  max?: number
  step?: number
}

export interface HandlerMeta {
  name: string // = handler 字段值(后端 registry 里的 name)
  label: string // 中文友好名
  description: string
  category: string
  recommendedCron: string
  paramsSchema: HandlerParamSchema[]
}

export const HANDLER_META: HandlerMeta[] = []

export const getHandlerMeta = (name: string | null | undefined): HandlerMeta | undefined => {
  if (!name) return undefined
  return HANDLER_META.find((h) => h.name === name)
}

export const getHandlerLabel = (name: string | null | undefined): string => {
  return getHandlerMeta(name)?.label ?? (name || '-')
}
