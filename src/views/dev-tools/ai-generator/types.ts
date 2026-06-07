export type StepKey = 'requirement' | 'fields' | 'preview' | 'generate'
export type DiagnosticLevel = 'error' | 'warning' | 'ready'
export type GeneratorTagType = 'danger' | 'warning' | 'success' | 'primary' | 'info'

export interface WorkflowStep {
  key: StepKey
  index: number
  title: string
  desc: string
  tip: string
}

export interface MetricItem {
  label: string
  value: string | number
}

export interface GeneratorField {
  id: number
  label: string
  prop: string
  type: string
  validation?: string
  length?: number
  defaultValue?: string
  required: boolean
  inForm: boolean
  searchable: boolean
  inTable: boolean
  sortable: boolean
  component: string
  dict?: string
  advanced?: {
    formSpan: number
    placeholder: string
    help: string
  }
}

export interface GeneratorModuleConfig {
  title: string
  name: string
  group: string
  modelName: string
  pagePath: string
  apiPath: string
  statusField: string
  capabilities: {
    page: string[]
    operation: string[]
  }
  strategy: {
    formMode: string
    deleteMode: string
    conflictMode: string
  }
}

export interface CapabilityOption {
  label: string
  value: string
}

export interface CapabilityGroup {
  key: keyof GeneratorModuleConfig['capabilities']
  label: string
  options: CapabilityOption[]
}

export interface PreviewFile {
  path: string
  language: string
  action: string
  code: string
}

export interface PreviewRecord {
  id: number
  name: string
  phone: string
  industry: string
  status: string
  level: string
  owner: string
  createdAt: string
}

export interface DiagnosticItem {
  title: string
  desc: string
  tag: string
  tagType: GeneratorTagType
  level: DiagnosticLevel
}

export interface QualityGate {
  title: string
  desc: string
  tag: string
  tagType: GeneratorTagType
  status: 'passed' | 'warning' | 'failed'
}

export interface WriteSummaryItem {
  label: string
  value: number
  type: GeneratorTagType
}

export interface GenerationTask {
  id: number
  name: string
  status: 'success' | 'failed' | 'running'
  count: number
  duration: string
  message: string
  retryable: boolean
}

export interface GenerationVersion {
  version: string
  module: string
  source: string
  fields: number
  time: string
}

export interface GenerationHistory {
  id: number
  module: string
  action: string
  status: 'success' | 'failed' | 'running'
  operator: string
  time: string
}
