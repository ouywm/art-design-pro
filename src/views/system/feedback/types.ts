export type FeedbackType = 'feature' | 'experience' | 'bug'
export type FeedbackStatus = 'pending' | 'resolved' | 'closed'
export type FeedbackPriority = 'urgent' | 'medium' | 'low'

export interface FeedbackItem {
  id: string
  title: string
  type: FeedbackType
  status: FeedbackStatus
  priority: FeedbackPriority
  contactName: string
  contactWay: string
  pagePath: string
  submitTime: string
  submitUser: string
  description: string
}

export interface FeedbackSearchForm {
  keyword?: string
  type?: FeedbackType
  status?: FeedbackStatus
}

export interface FeedbackQueryParams extends FeedbackSearchForm {
  page: number
  size: number
}

export type FeedbackPageResponse = Api.Common.PaginatedResponse<FeedbackItem>
