declare namespace Api {
  /** 系统公告类型 */
  namespace Notice {
    /** 公告级别（对应后端 sys_notice::NoticeLevel） */
    type NoticeLevel = 1 | 2 | 3 | 4

    /** 公告范围（对应后端 sys_notice::NoticeScope） */
    type NoticeScope = 1 | 2 | 3

    /** 发布状态（对应后端 sys_notice::PublishStatus） */
    type PublishStatus = 1 | 2 | 3

    /** 系统公告列表 */
    type NoticeList = Api.Common.PaginatedResponse<NoticeVo>

    /** 系统公告项（对应后端 NoticeVo） */
    interface NoticeVo {
      /** 公告 ID */
      id: number
      /** 公告标题 */
      noticeTitle: string
      /** 公告级别 */
      noticeLevel: NoticeLevel
      /** 公告范围 */
      noticeScope: NoticeScope
      /** 发布状态 */
      publishStatus: PublishStatus
      /** 是否置顶 */
      pinned: boolean
      /** 是否启用 */
      enabled: boolean
      /** 排序 */
      sort: number
      /** 发布人 */
      publishBy: string
      /** 发布时间 */
      publishTime: string | null
      /** 过期时间 */
      expireTime: string | null
      /** 备注 */
      remark: string
      /** 创建人 */
      createBy: string
      /** 创建时间 */
      createTime: string
      /** 更新人 */
      updateBy: string
      /** 更新时间 */
      updateTime: string
    }

    /** 公告目标角色（对应后端 NoticeTargetRoleVo） */
    interface NoticeTargetRoleVo {
      /** 角色 ID */
      roleId: number
      /** 角色名称 */
      roleName: string
      /** 角色编码 */
      roleCode: string
    }

    /** 公告目标用户（对应后端 NoticeTargetUserVo） */
    interface NoticeTargetUserVo {
      /** 用户 ID */
      userId: number
      /** 用户名 */
      userName: string
      /** 昵称 */
      nickName: string
    }

    /** 系统公告详情（对应后端 NoticeDetailVo） */
    interface NoticeDetailVo extends NoticeVo {
      /** 公告正文 */
      noticeContent: string
      /** 目标角色 ID 集合 */
      targetRoleIds: number[]
      /** 目标角色详情 */
      targetRoles: NoticeTargetRoleVo[]
      /** 目标用户 ID 集合 */
      targetUserIds: number[]
      /** 目标用户详情 */
      targetUsers: NoticeTargetUserVo[]
    }

    /** 系统公告筛选字段（对应后端 NoticeQueryDto） */
    interface NoticeSearchFilters {
      /** 公告 ID */
      id?: number
      /** 公告标题 */
      noticeTitle?: string
      /** 公告级别 */
      noticeLevel?: NoticeLevel
      /** 公告范围 */
      noticeScope?: NoticeScope
      /** 发布状态 */
      publishStatus?: PublishStatus
      /** 是否置顶 */
      pinned?: boolean
      /** 是否启用 */
      enabled?: boolean
      /** 发布时间开始 */
      publishTimeStart?: string
      /** 发布时间结束 */
      publishTimeEnd?: string
      /** 创建时间开始 */
      createTimeStart?: string
      /** 创建时间结束 */
      createTimeEnd?: string
    }

    /** 系统公告查询参数 */
    interface NoticeSearchParams extends Api.Common.CommonSearchParams, NoticeSearchFilters {}

    /** 创建系统公告参数（对应后端 CreateNoticeDto） */
    interface CreateNoticeParams {
      /** 公告标题 */
      noticeTitle: string
      /** 公告正文 */
      noticeContent: string
      /** 公告级别 */
      noticeLevel?: NoticeLevel
      /** 公告范围 */
      noticeScope?: NoticeScope
      /** 目标角色 ID 集合 */
      targetRoleIds?: number[]
      /** 目标用户 ID 集合 */
      targetUserIds?: number[]
      /** 是否置顶 */
      pinned?: boolean
      /** 是否启用 */
      enabled?: boolean
      /** 排序 */
      sort?: number
      /** 过期时间 */
      expireTime?: string
      /** 备注 */
      remark?: string
    }

    /** 更新系统公告参数（对应后端 UpdateNoticeDto） */
    interface UpdateNoticeParams {
      /** 公告标题 */
      noticeTitle?: string
      /** 公告正文 */
      noticeContent?: string
      /** 公告级别 */
      noticeLevel?: NoticeLevel
      /** 公告范围 */
      noticeScope?: NoticeScope
      /** 目标角色 ID 集合 */
      targetRoleIds?: number[]
      /** 目标用户 ID 集合 */
      targetUserIds?: number[]
      /** 是否置顶 */
      pinned?: boolean
      /** 是否启用 */
      enabled?: boolean
      /** 排序 */
      sort?: number
      /** 过期时间；传 null 表示清空 */
      expireTime?: string | null
      /** 备注 */
      remark?: string
    }
  }
}
