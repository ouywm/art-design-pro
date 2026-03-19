export type NoticeListItem = Api.Notice.NoticeVo
export type NoticeDetailVo = Api.Notice.NoticeDetailVo
export type NoticeLevel = Api.Notice.NoticeLevel
export type NoticeScope = Api.Notice.NoticeScope
export type PublishStatus = Api.Notice.PublishStatus

export interface NoticeSearchFormModel
  extends Omit<
    Api.Notice.NoticeSearchFilters,
    'publishTimeStart' | 'publishTimeEnd' | 'createTimeStart' | 'createTimeEnd'
  > {
  publishTimeRange?: [string, string]
  createTimeRange?: [string, string]
}

export interface NoticeFormModel {
  noticeTitle: string
  noticeContent: string
  noticeLevel: NoticeLevel
  noticeScope: NoticeScope
  targetRoleIds: number[]
  targetUserIds: number[]
  pinned: boolean
  enabled: boolean
  sort: number | undefined
  expireTime: string | null
  remark: string
}
