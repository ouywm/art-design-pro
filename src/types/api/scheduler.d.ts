declare namespace Api {
  namespace Scheduler {
    // ============ 枚举(RatchJob Open API) ============

    type JobScheduleType = 'CRON' | 'INTERVAL' | 'DELAY' | 'NONE'

    type JobRunMode =
      | 'BEAN'
      | 'GLUE_GROOVY'
      | 'GLUE_SHELL'
      | 'GLUE_PYTHON'
      | 'GLUE_PHP'
      | 'GLUE_NODEJS'
      | 'GLUE_POWERSHELL'

    type JobRouterStrategy =
      | 'FIRST'
      | 'LAST'
      | 'ROUND_ROBIN'
      | 'RANDOM'
      | 'CONSISTENT_HASH'
      | 'SHARDING_BROADCAST'

    type JobPastDueStrategy = 'DEFAULT' | 'IGNORE' | 'EXECUTE'

    type JobBlockingStrategy = 'SERIAL_EXECUTION' | 'DISCARD_LATER' | 'COVER_EARLY' | 'OTHER'

    // ============ Job ============

    interface Job {
      id: number
      enable: boolean
      appName: string
      namespace: string
      key?: string | null
      description: string
      scheduleType: JobScheduleType
      cronValue: string
      delaySecond: number
      intervalSecond: number
      runMode: JobRunMode
      handleName: string
      triggerParam: string
      routerStrategy: JobRouterStrategy
      pastDueStrategy: JobPastDueStrategy
      blockingStrategy: JobBlockingStrategy
      timeoutSecond: number
      tryTimes: number
      versionId: number
      lastModifiedMillis: number
      createTime: number
      retryInterval: number
    }

    type JobList = Api.Common.PaginatedResponse<Job>

    interface JobNamespace {
      namespace: string
      namespaceDesc: string
    }

    interface JobListQuery {
      namespace?: string
      appName?: string
      likeDescription?: string
      likeHandleName?: string
      page?: number
      size?: number
    }

    interface JobKeyQuery {
      namespace: string
      appName: string
      key: string
    }

    interface CreateJobPayload {
      appName: string
      namespace: string
      key?: string
      handleName?: string
      scheduleType?: JobScheduleType
      cronValue?: string
      delaySecond?: number
      intervalSecond?: number
      runMode?: JobRunMode
      description?: string
      triggerParam?: string
      routerStrategy?: JobRouterStrategy
      pastDueStrategy?: JobPastDueStrategy
      blockingStrategy?: JobBlockingStrategy
      timeoutSecond?: number
      tryTimes?: number
      retryInterval?: number
      enable?: boolean
    }

    type UpdateJobPayload = Partial<CreateJobPayload>

    interface JobTasksQuery {
      page?: number
      size?: number
    }

    // ============ Task / Run History ============

    interface JobTryLog {
      executionTime: number
      addr: string
    }

    interface JobTask {
      taskId: number
      jobId: number
      triggerTime: number
      instanceAddr: string
      triggerMessage: string
      status: string
      finishTime: number
      callbackMessage: string
      executionTime: number
      triggerFrom: string
      tryTimes: number
      tryLogs: JobTryLog[]
      retryInterval: number
      retryCount: number
      timeoutSecond: number
    }

    type JobTaskList = Api.Common.PaginatedResponse<JobTask>
  }
}
