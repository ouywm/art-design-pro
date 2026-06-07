export type FeedbackType = 'feature' | 'bug' | 'experience' | 'other'
export type FeedbackUrgency = 'low' | 'medium' | 'high'
export type FeedbackFrequency = '' | 'once' | 'sometimes' | 'always'
export type FeedbackImpact = '' | 'personal' | 'team' | 'business'

export interface FeedbackContext {
  pageTitle: string
  path: string
  browser: string
  os: string
  device: string
  viewport: string
}

export interface FeedbackContextSource {
  routeTitle?: unknown
  routePath?: string
  userAgent?: string
  platform?: string
  width?: number
  height?: number
}

export interface FeedbackFormModel {
  type: FeedbackType
  urgency: FeedbackUrgency
  title: string
  description: string
  expected: string
  contactName: string
  contact: string
  frequency: FeedbackFrequency
  impact: FeedbackImpact
}

export interface FeedbackPayload extends FeedbackFormModel {
  context: FeedbackContext
  createdAt: string
}
