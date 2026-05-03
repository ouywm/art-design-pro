declare namespace Api {
  namespace Scheduler {
    // ============ 枚举(后端 Rust serde 默认 PascalCase 序列化) ============

    type ScheduleType = 'Cron' | 'FixedRate' | 'FixedDelay' | 'Oneshot'

    type BlockingStrategy = 'Serial' | 'Discard' | 'Override'

    type MisfireStrategy = 'FireNow' | 'Ignore' | 'Reschedule'

    type RouteStrategy =
      | 'First'
      | 'Last'
      | 'RoundRobin'
      | 'Random'
      | 'ConsistentHash'
      | 'LeastFrequently'
      | 'LeastRecently'
      | 'Failover'
      | 'Busyover'
      | 'ShardingBroadcast'

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
      routeStrategy: RouteStrategy
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
      routeStrategy: RouteStrategy
      timeoutMs: number
      retryMax: number
      retryBackoff: RetryBackoff
      shardTotal: number | null
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
      routeStrategy?: RouteStrategy
      timeoutMs?: number
      retryMax?: number
      retryBackoff?: RetryBackoff
      shardTotal?: number
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
      routeStrategy?: RouteStrategy
      timeoutMs?: number
      retryMax?: number
      retryBackoff?: RetryBackoff
      shardTotal?: number | null
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

    // ============ Run ============

    interface JobRunVo {
      id: number
      jobId: number
      traceId: string
      shardIndex: number | null
      shardTotal: number | null
      triggerType: TriggerType
      triggerBy: number | null
      state: RunState
      instance: string | null
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

    // ============ 监控 ============

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

    interface JobInstance {
      id: string
      ip: string | null
      lastSeen: string
      runningJobs: number
      isDispatcher: boolean
      createTime: string
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
      result?: unknown
      error?: string
      durationMs: number
      logs: string[]
    }

    // ============ 统计(GET /scheduler/stats/...) ============

    type StatsPeriod = '1h' | '24h' | '7d' | '30d'

    interface StatsPoint {
      ts: string
      triggered: number
      succeeded: number
      failed: number
      avgDurationMs: number | null
    }

    interface StatsOverviewVo {
      triggeredCount: number
      succeededCount: number
      failedCount: number
      successRate: number | null
      avgDurationMs: number | null
      p50: number | null
      p99: number | null
      points: StatsPoint[]
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
      points: StatsPoint[]
    }
  }
}
