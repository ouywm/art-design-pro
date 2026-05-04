declare namespace Api {
  namespace Scheduler {
    // ============ 枚举(后端 Rust serde PascalCase 序列化) ============

    type ScheduleType = 'Cron' | 'FixedRate' | 'FixedDelay' | 'Oneshot'

    type BlockingStrategy = 'Serial' | 'Discard' | 'Override'

    type MisfireStrategy = 'FireNow' | 'Ignore' | 'Reschedule'

    type RetryBackoff = 'Exponential' | 'Linear' | 'Fixed'

    type TriggerType = 'Cron' | 'Manual' | 'Retry' | 'Workflow' | 'Misfire' | 'Api'

    type RunState =
      | 'Enqueued'
      | 'Running'
      | 'Succeeded'
      | 'Failed'
      | 'Timeout'
      | 'Canceled'
      | 'Discarded'

    // ScriptEngine 仍用小写(后端 sea_orm string_value="rhai"/"lua")
    type ScriptEngine = 'rhai' | 'lua'

    type DependencyOnState = 'Succeeded' | 'Failed' | 'Always'

    // ============ 通用分页(后端 0-indexed) ============

    interface Page<T> {
      content: T[]
      size: number
      page: number
      totalElements: number
      totalPages: number
    }

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
      blocking: BlockingStrategy
      // 运行时(后端 join 得出,只读)
      nextFireAt: string | null
      lastRunState: RunState | null
      lastRunFinishedAt: string | null
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
      script: string | null
      scriptEngine: ScriptEngine | null
      enabled: boolean
      blocking: BlockingStrategy
      misfire: MisfireStrategy
      timeoutMs: number
      retryMax: number
      retryBackoff: RetryBackoff
      uniqueKey: string | null
      version: number
      createdBy: number | null
      // 运行时(后端 join 得出,只读)
      nextFireAt: string | null
      lastRunState: RunState | null
      lastRunFinishedAt: string | null
      createTime: string
      updateTime: string
    }

    type JobList = Page<JobVo>

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
      script?: string
      scriptEngine?: ScriptEngine
      enabled?: boolean
      blocking?: BlockingStrategy
      misfire?: MisfireStrategy
      timeoutMs?: number
      retryMax?: number
      retryBackoff?: RetryBackoff
      uniqueKey?: string
      tenantId?: number
    }

    // PATCH 语义:所有字段可选;可空字段(cronExpr/script 等)传 null 表示显式置空
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
      script?: string | null
      scriptEngine?: ScriptEngine | null
      enabled?: boolean
      blocking?: BlockingStrategy
      misfire?: MisfireStrategy
      timeoutMs?: number
      retryMax?: number
      retryBackoff?: RetryBackoff
      uniqueKey?: string | null
    }

    interface TriggerJobParams {
      paramsOverride?: unknown
    }

    interface ToggleJobEnabledParams {
      enabled: boolean
    }

    interface HandlerVo {
      name: string
    }

    // ============ 批量操作(POST /scheduler/jobs/batch/*) ============

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
      state: RunState
      instance: string | null // hostname:pid(审计用,单实例下无路由含义)
      scheduledAt: string
      startedAt: string | null
      finishedAt: string | null
      retryCount: number
      resultJson: unknown
      errorMessage: string | null
      logExcerpt: string | null
      uniqueKey: string | null
      createTime: string
    }

    type JobRunList = Page<JobRunVo>

    interface JobRunQueryFilters {
      jobId?: number
      traceId?: string
      triggerType?: TriggerType
      state?: RunState
      instance?: string
      startTime?: string
      endTime?: string
    }

    interface JobRunQueryParams extends JobRunQueryFilters {
      page?: number
      size?: number
    }

    // ============ 监控(GET /scheduler/metrics) ============

    interface MetricsSnapshot {
      triggersCron: number
      triggersManual: number
      triggersRetry: number
      triggersMisfire: number
      triggersWorkflow: number
      triggersApi: number
      runsSucceeded: number
      runsFailed: number
      runsTimeout: number
      runsCanceled: number
      runsDiscarded: number
      runsEnqueuedOrRunning: number
      runsInFlight: number
    }

    // ============ 依赖 ============

    interface DependencyVo {
      id: number
      upstreamId: number
      upstreamName: string
      downstreamId: number
      downstreamName: string
      onState: DependencyOnState
      enabled: boolean
      createTime: string
    }

    interface JobDependencyListVo {
      outgoing: DependencyVo[]
      incoming: DependencyVo[]
    }

    interface AddJobDependencyParams {
      downstreamId: number
      onState?: DependencyOnState
    }

    // ============ 脚本试运行(POST /scheduler/script/dryrun) ============

    interface ScriptDryrunParams {
      engine: 'rhai'
      script: string
      params?: unknown
      timeoutMs?: number // 默认 5000,最大 30000
    }

    interface ScriptDryrunResult {
      ok: boolean
      result: unknown | null
      error: string | null
      durationMs: number
      logs: string[] // ["[INFO] xxx", "[WARN] yyy"]
    }

    // ============ 统计(GET /scheduler/stats/*) ============

    type StatsPeriod = '1h' | '24h' | '7d' | '30d'

    interface TopFailedJob {
      jobId: number
      name: string
      failCount: number
    }

    interface StatsOverviewVo {
      totalJobs: number
      enabledJobs: number
      triggeredCount: number
      succeededCount: number
      failedCount: number
      successRate: number | null // 0.0-1.0;触发数为 0 时 null
      inFlightCount: number
      topFailedJobs: TopFailedJob[] // 最多 5 条
    }

    interface JobStatsPoint {
      ts: string // 桶起始时间
      total: number
      succeeded: number
      failed: number
    }

    interface JobStatsVo {
      jobId: number
      triggeredCount: number
      succeededCount: number
      failedCount: number
      successRate: number | null
      avgDurationMs: number | null
      p50: number | null
      p99: number | null
      points: JobStatsPoint[]
    }

    interface StatsQueryParams {
      period?: StatsPeriod
    }
  }
}
