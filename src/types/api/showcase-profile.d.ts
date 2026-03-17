declare namespace Api {
  /** 展示档案类型 */
  namespace ShowcaseProfile {
    /** 展示档案列表 */
    type ShowcaseProfileList = Api.Common.PaginatedResponse<ShowcaseProfileVo>

    /** 展示档案列表项（对应后端 ShowcaseProfileVo） */
    interface ShowcaseProfileVo {
      /** 主键 */
      id: number
      /** 展示编码 */
      showcaseCode: string
      /** 标题 */
      title: string
      /** 头像 */
      avatar: string | null
      /** 封面图片 */
      coverImage: string | null
      /** 联系人 */
      contactName: string | null
      /** 联系人性别：0-未知 1-男 2-女 */
      contactGender: 0 | 1 | 2
      /** 联系电话 */
      contactPhone: string | null
      /** 联系邮箱 */
      contactEmail: string | null
      /** 官网链接 */
      officialUrl: string | null
      /** 状态：1-启用 2-禁用 3-注销 */
      status: 1 | 2 | 3
      /** 推荐 */
      featured: boolean
      /** 优先级 */
      priority: number
      /** 评分 */
      score: string | null
      /** 发布日期 */
      publishDate: string | null
      /** 上线时间 */
      launchAt: string | null
      /** 服务时间 */
      serviceTime: string | null
      /** 附件 */
      attachmentUrl: string | null
      /** 描述 */
      description: string | null
      /** 备注 */
      extraNotes: string | null
      /** 元数据 */
      metadata: unknown
      /** 创建时间 */
      createdAt: string
      /** 更新时间 */
      updatedAt: string
    }

    /** 展示档案详情 */
    type ShowcaseProfileDetailVo = ShowcaseProfileVo

    /** 展示档案查询参数（对应后端 ShowcaseProfileQueryDto） */
    interface ShowcaseProfileSearchParams extends Api.Common.CommonSearchParams {
      /** 主键 */
      id?: number
      /** 展示编码 */
      showcaseCode?: string
      /** 标题 */
      title?: string
      /** 头像 */
      avatar?: string | null
      /** 封面图片 */
      coverImage?: string | null
      /** 联系人 */
      contactName?: string | null
      /** 联系人性别：0-未知 1-男 2-女 */
      contactGender?: 0 | 1 | 2
      /** 联系电话 */
      contactPhone?: string | null
      /** 联系邮箱 */
      contactEmail?: string | null
      /** 官网链接 */
      officialUrl?: string | null
      /** 状态：1-启用 2-禁用 3-注销 */
      status?: 1 | 2 | 3
      /** 推荐 */
      featured?: boolean
      /** 优先级 */
      priority?: number
      /** 评分 */
      score?: string | null
      /** 发布日期 */
      publishDate?: string | null
      /** 发布日期开始 */
      publishDateStart?: string | null
      /** 发布日期结束 */
      publishDateEnd?: string | null
      /** 上线时间 */
      launchAt?: string | null
      /** 上线时间开始 */
      launchAtStart?: string | null
      /** 上线时间结束 */
      launchAtEnd?: string | null
      /** 服务时间 */
      serviceTime?: string | null
      /** 附件 */
      attachmentUrl?: string | null
      /** 描述 */
      description?: string | null
      /** 备注 */
      extraNotes?: string | null
      /** 元数据 */
      metadata?: unknown
      /** 创建时间 */
      createdAt?: string
      /** 创建时间开始 */
      createdAtStart?: string
      /** 创建时间结束 */
      createdAtEnd?: string
      /** 更新时间 */
      updatedAt?: string
      /** 更新时间开始 */
      updatedAtStart?: string
      /** 更新时间结束 */
      updatedAtEnd?: string
    }

    /** 创建展示档案参数（对应后端 CreateShowcaseProfileDto） */
    interface CreateShowcaseProfileParams {
      /** 展示编码 */
      showcaseCode: string
      /** 标题 */
      title: string
      /** 头像 */
      avatar?: string | null
      /** 封面图片 */
      coverImage?: string | null
      /** 联系人 */
      contactName?: string | null
      /** 联系人性别：0-未知 1-男 2-女 */
      contactGender?: 0 | 1 | 2
      /** 联系电话 */
      contactPhone?: string | null
      /** 联系邮箱 */
      contactEmail?: string | null
      /** 官网链接 */
      officialUrl?: string | null
      /** 状态：1-启用 2-禁用 3-注销 */
      status?: 1 | 2 | 3
      /** 推荐 */
      featured?: boolean
      /** 优先级 */
      priority?: number
      /** 评分 */
      score?: string | null
      /** 发布日期 */
      publishDate?: string | null
      /** 上线时间 */
      launchAt?: string | null
      /** 服务时间 */
      serviceTime?: string | null
      /** 附件 */
      attachmentUrl?: string | null
      /** 描述 */
      description?: string | null
      /** 备注 */
      extraNotes?: string | null
      /** 元数据 */
      metadata?: unknown
    }

    /** 更新展示档案参数（对应后端 UpdateShowcaseProfileDto） */
    interface UpdateShowcaseProfileParams {
      /** 展示编码 */
      showcaseCode?: string
      /** 标题 */
      title?: string
      /** 头像 */
      avatar?: string | null
      /** 封面图片 */
      coverImage?: string | null
      /** 联系人 */
      contactName?: string | null
      /** 联系人性别：0-未知 1-男 2-女 */
      contactGender?: 0 | 1 | 2
      /** 联系电话 */
      contactPhone?: string | null
      /** 联系邮箱 */
      contactEmail?: string | null
      /** 官网链接 */
      officialUrl?: string | null
      /** 状态：1-启用 2-禁用 3-注销 */
      status?: 1 | 2 | 3
      /** 推荐 */
      featured?: boolean
      /** 优先级 */
      priority?: number
      /** 评分 */
      score?: string | null
      /** 发布日期 */
      publishDate?: string | null
      /** 上线时间 */
      launchAt?: string | null
      /** 服务时间 */
      serviceTime?: string | null
      /** 附件 */
      attachmentUrl?: string | null
      /** 描述 */
      description?: string | null
      /** 备注 */
      extraNotes?: string | null
      /** 元数据 */
      metadata?: unknown
    }
  }
}
