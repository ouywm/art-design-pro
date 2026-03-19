declare namespace Api {
  /** 公告中心类型 */
  namespace UserNotice {
    /** 用户公告列表 */
    type UserNoticeList = Api.Common.PaginatedResponse<UserNoticeVo>

    /** 用户公告项（对应后端 UserNoticeVo） */
    interface UserNoticeVo {
      /** 公告 ID */
      id: number
      /** 公告标题 */
      noticeTitle: string
      /** 公告级别 */
      noticeLevel: Api.Notice.NoticeLevel
      /** 是否置顶 */
      pinned: boolean
      /** 发布时间 */
      publishTime: string | null
      /** 过期时间 */
      expireTime: string | null
      /** 是否已读 */
      readFlag: boolean
      /** 已读时间 */
      readTime: string | null
    }

    /** 用户公告列表项别名 */
    type UserNoticeListItem = UserNoticeVo

    /** 用户公告详情（对应后端 UserNoticeDetailVo） */
    interface UserNoticeDetailVo extends UserNoticeVo {
      /** 公告正文 */
      noticeContent: string
    }

    /** 未读公告数量（对应后端 NoticeUnreadCountVo） */
    interface NoticeUnreadCountVo {
      /** 未读数量 */
      unreadCount: number
    }

    /** 用户公告筛选字段（对应后端 UserNoticeQueryDto） */
    interface UserNoticeSearchFilters {
      /** 公告标题 */
      noticeTitle?: string
      /** 公告级别 */
      noticeLevel?: Api.Notice.NoticeLevel
      /** 是否已读 */
      readFlag?: boolean
    }

    /** 用户公告查询参数 */
    interface UserNoticeSearchParams
      extends Api.Common.CommonSearchParams,
        UserNoticeSearchFilters {}

    /** 最新公告查询参数（对应后端 UserNoticeLatestQueryDto） */
    interface UserNoticeLatestParams {
      /** 返回条数，默认 5，范围 1-20 */
      size?: number
      /** 是否已读 */
      readFlag?: boolean
    }
  }
}
