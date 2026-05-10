declare namespace Api {
  namespace Scheduler {
    // ============ 枚举(v3 后端 SCREAMING_SNAKE_CASE) ============

    type ScheduleType = 'Cron' | 'FixedRate' | 'Oneshot'

    type TriggerType = 'Cron' | 'Manual' | 'Retry'

    type RunState = 'Running' | 'Succeeded' | 'Failed' | 'Timeout' | 'Discarded'

    // ============ 通用分页 ============
    // 后端 Rust 返回 { content, page, size, total },
    // defaultResponseAdapter 会把 total 映射为 totalElements,
    // 所以前端统一用 Api.Common.PaginatedResponse 做类型,
    // 保证 useTable 的 InferRecordType<T> 能正确推导出 TRecord。

    // ============ Job ============

    interface JobVo {
      id: number
      tenantId: number | null
      name: string
      groupName: string
      handler: string
      scheduleType: ScheduleType
      cronExpr: string | null
      enabled: boolean
      createTime: string
      updateTime: string
    }

    interface JobDetailVo {
      id: number
      tenantId: number | null
      name: string
      groupName: string
      description: string
      handler: string
      scheduleType: ScheduleType
      cronExpr: string | null
      intervalMs: number | null
      fireTime: string | null
      paramsJson: unknown
      enabled: boolean
      timeoutMs: number
      retryMax: number
      version: number
      createdBy: number | null
      createTime: string
      updateTime: string
    }

    type JobList = Api.Common.PaginatedResponse<JobVo>

    interface JobQueryFilters {
      name?: string
      groupName?: string
      handler?: string
      scheduleType?: ScheduleType
      enabled?: boolean
      tenantId?: number
    }

    interface JobQueryParams extends JobQueryFilters {
      page?: number
      size?: number
    }

    interface CreateJobParams {
      name: string
      groupName?: string
      description?: string
      handler: string
      scheduleType: ScheduleType
      cronExpr?: string
      intervalMs?: number
      fireTime?: string
      paramsJson?: unknown
      enabled?: boolean
      timeoutMs?: number
      retryMax?: number
      tenantId?: number
    }

    // PATCH 语义:所有字段可选;可空字段(cronExpr 等)传 null 表示显式置空
    interface UpdateJobParams {
      name?: string
      groupName?: string
      description?: string
      handler?: string
      scheduleType?: ScheduleType
      cronExpr?: string | null
      intervalMs?: number | null
      fireTime?: string | null
      paramsJson?: unknown
      enabled?: boolean
      timeoutMs?: number
      retryMax?: number
    }

    interface TriggerJobParams {
      paramsOverride?: unknown
    }

    interface ToggleJobEnabledParams {
      enabled: boolean
    }

    interface HandlerVo {
      name: string
      description?: string
    }

    // ============ 批量操作 ============

    interface BatchToggleParams {
      ids: number[] // 1-100
      enabled: boolean
    }

    interface BatchIdsParams {
      ids: number[] // 1-100
    }

    interface BatchFailure {
      id: number
      reason: string
    }

    interface BatchResultVo {
      successCount: number
      failedCount: number
      failures: BatchFailure[]
    }

    // ============ Run ============

    interface JobRunVo {
      id: number
      jobId: number
      traceId: string
      triggerType: TriggerType
      triggerBy: number | null
      // 详情接口独有:手动触发时填 sys.user.nick_name,用户删除或非手动触发时不返回
      triggerByName?: string
      state: RunState
      scheduledAt: string
      startedAt: string | null
      finishedAt: string | null
      retryCount: number
      resultJson: unknown
      errorMessage: string | null
      createTime: string
    }

    type JobRunList = Api.Common.PaginatedResponse<JobRunVo>

    interface JobRunQueryFilters {
      jobId?: number
      traceId?: string
      triggerType?: TriggerType
      state?: RunState
      startTime?: string
      endTime?: string
    }

    interface JobRunQueryParams extends JobRunQueryFilters {
      page?: number
      size?: number
    }
  }
}
