declare namespace Api {
  /** AI 供应商管理 */
  namespace AiVendor {
    /** 供应商分页列表 */
    type VendorList = Api.Common.PaginatedResponse<VendorVo>

    /** 供应商信息 */
    interface VendorVo {
      id: number
      vendorCode: string
      vendorName: string
      apiStyle: string
      icon: string
      description: string
      baseUrl: string
      docUrl: string
      metadata: unknown
      vendorSort: number
      enabled: boolean
      remark: string
      createTime: string
      updateTime: string
    }

    /** 供应商筛选字段 */
    interface VendorSearchFilters {
      vendorCode?: string
      vendorName?: string
      apiStyle?: string
      enabled?: boolean
    }

    /** 供应商查询参数 */
    interface VendorSearchParams extends Api.Common.CommonSearchParams, VendorSearchFilters {}

    /** 创建供应商参数 */
    interface CreateVendorParams {
      vendorCode: string
      vendorName: string
      apiStyle?: string
      baseUrl?: string
      description?: string
      docUrl?: string
      enabled?: boolean
      icon?: string
      metadata?: unknown
      remark?: string
      vendorSort?: number
    }

    /** 更新供应商参数 */
    interface UpdateVendorParams {
      vendorName?: string
      apiStyle?: string
      baseUrl?: string
      description?: string
      docUrl?: string
      enabled?: boolean
      icon?: string
      metadata?: unknown
      remark?: string
      vendorSort?: number
    }
  }

  /** AI 渠道管理 */
  namespace AiChannel {
    type ChannelType = 1 | 3 | 14 | 15 | 17 | 24 | 28
    type ChannelStatus = 1 | 2 | 3 | 4
    type ChannelLastHealthStatus = 0 | 1 | 2 | 3

    type ChannelList = Api.Common.PaginatedResponse<ChannelListItem>

    interface ChannelListItem {
      id: number
      name: string
      channelType: ChannelType
      vendorCode: string
      baseUrl: string
      status: ChannelStatus
      models: unknown
      channelGroup: string
      weight: number
      priority: number
      autoBan: boolean
      testModel: string
      usedQuota: number
      responseTime: number
      failureStreak: number
      lastUsedAt?: string | null
      remark: string
      createTime: string
      updateTime: string
    }

    interface ChannelDetailVo {
      id: number
      name: string
      channelType: ChannelType
      vendorCode: string
      baseUrl: string
      status: ChannelStatus
      models: unknown
      modelMapping: unknown
      channelGroup: string
      endpointScopes: unknown
      capabilities: unknown
      weight: number
      priority: number
      autoBan: boolean
      testModel: string
      usedQuota: number
      balance: string
      balanceUpdatedAt?: string | null
      responseTime: number
      successRate: string
      failureStreak: number
      lastUsedAt?: string | null
      lastErrorAt?: string | null
      lastErrorCode: string
      lastErrorMessage: string
      lastHealthStatus: ChannelLastHealthStatus
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface ChannelSearchFilters {
      name?: string
      vendorCode?: string
      status?: ChannelStatus
      channelType?: ChannelType
      channelGroup?: string
    }

    interface ChannelSearchParams extends Api.Common.CommonSearchParams, ChannelSearchFilters {}

    interface CreateChannelParams {
      name: string
      channelType: ChannelType
      vendorCode: string
      baseUrl: string
      models: unknown
      modelMapping?: unknown
      channelGroup: string
      endpointScopes?: unknown
      capabilities?: unknown
      weight?: number
      priority?: number
      config?: unknown
      autoBan?: boolean
      testModel?: string
      remark?: string
    }

    interface UpdateChannelParams {
      name?: string
      vendorCode?: string
      baseUrl?: string
      status?: ChannelStatus
      models?: unknown
      modelMapping?: unknown
      channelGroup?: string
      endpointScopes?: unknown
      capabilities?: unknown
      weight?: number
      priority?: number
      config?: unknown
      autoBan?: boolean
      testModel?: string
      remark?: string
    }
  }

  /** AI 渠道账号管理 */
  namespace AiChannelAccount {
    type ChannelAccountStatus = 1 | 2 | 3 | 4 | 5

    type ChannelAccountList = Api.Common.PaginatedResponse<ChannelAccountVo>

    interface ChannelAccountVo {
      id: number
      channelId: number
      name: string
      credentialType: string
      secretRef: string
      status: ChannelAccountStatus
      schedulable: boolean
      priority: number
      weight: number
      rateMultiplier: number
      concurrencyLimit: number
      quotaLimit: string
      quotaUsed: string
      balance: string
      responseTime: number
      failureStreak: number
      lastUsedAt?: string | null
      expiresAt?: string | null
      testModel: string
      remark: string
      createTime: string
      updateTime: string
    }

    interface ChannelAccountSearchFilters {
      channelId?: number
      name?: string
      status?: ChannelAccountStatus
      schedulable?: boolean
    }

    interface ChannelAccountSearchParams
      extends Api.Common.CommonSearchParams,
        ChannelAccountSearchFilters {}

    interface CreateChannelAccountParams {
      channelId: number
      name: string
      credentialType: string
      credentials?: unknown
      secretRef?: string
      schedulable?: boolean
      priority?: number
      weight?: number
      rateMultiplier?: number
      concurrencyLimit?: number
      quotaLimit?: number
      balance?: number
      expiresAt?: string | null
      testModel?: string
      extra?: unknown
      remark?: string
    }

    interface UpdateChannelAccountParams {
      channelId?: number
      name?: string
      credentialType?: string
      credentials?: unknown
      secretRef?: string
      status?: ChannelAccountStatus
      schedulable?: boolean
      priority?: number
      weight?: number
      rateMultiplier?: number
      concurrencyLimit?: number
      quotaLimit?: number
      balance?: number
      expiresAt?: string | null
      testModel?: string
      extra?: unknown
      remark?: string
    }
  }

  /** AI 渠道模型价格管理 */
  namespace AiChannelModelPrice {
    type ChannelModelPriceBillingMode = 1 | 2 | 3
    type ChannelModelPriceStatus = 1 | 2
    type ChannelModelPriceVersionStatus = 1 | 2

    type ChannelModelPriceList = Api.Common.PaginatedResponse<ChannelModelPriceVo>

    interface ChannelModelPriceVo {
      id: number
      channelId: number
      modelName: string
      billingMode: ChannelModelPriceBillingMode
      currency: string
      priceConfig: unknown
      referenceId: string
      status: ChannelModelPriceStatus
      remark: string
      createTime: string
      updateTime: string
    }

    interface ChannelModelPriceVersionVo {
      id: number
      channelModelPriceId: number
      channelId: number
      modelName: string
      versionNo: number
      referenceId: string
      priceConfig: unknown
      effectiveStartAt: string
      effectiveEndAt?: string | null
      status: ChannelModelPriceVersionStatus
      createTime: string
    }

    interface ChannelModelPriceDetailVo extends ChannelModelPriceVo {
      versions: ChannelModelPriceVersionVo[]
    }

    interface ChannelModelPriceSearchFilters {
      channelId?: number
      modelName?: string
      billingMode?: ChannelModelPriceBillingMode
      status?: ChannelModelPriceStatus
    }

    interface ChannelModelPriceSearchParams
      extends Api.Common.CommonSearchParams,
        ChannelModelPriceSearchFilters {}

    interface CreateChannelModelPriceParams {
      channelId: number
      modelName: string
      billingMode?: ChannelModelPriceBillingMode
      currency?: string
      priceConfig: unknown
      remark?: string
    }

    interface UpdateChannelModelPriceParams {
      billingMode?: ChannelModelPriceBillingMode
      currency?: string
      priceConfig?: unknown
      status?: ChannelModelPriceStatus
      remark?: string
    }
  }

  /** AI 请求管理 */
  namespace AiRequest {
    type RequestStatus = 1 | 2 | 3 | 4 | 5

    type RequestList = Api.Common.PaginatedResponse<RequestListItem>

    interface RequestListItem {
      id: number
      requestId: string
      userId: number
      tokenId: number
      channelGroup: string
      sourceType: string
      endpoint: string
      requestFormat: string
      requestedModel: string
      upstreamModel: string
      isStream: boolean
      responseStatusCode: number
      status: RequestStatus
      durationMs: number
      firstTokenMs: number
      createTime: string
      updateTime: string
    }

    interface RequestDetailVo {
      id: number
      requestId: string
      userId: number
      tokenId: number
      projectId: number
      conversationId: number
      messageId: number
      sessionId: number
      threadId: number
      traceId: number
      channelGroup: string
      sourceType: string
      endpoint: string
      requestFormat: string
      requestedModel: string
      upstreamModel: string
      isStream: boolean
      clientIp: string
      userAgent: string
      requestHeaders: unknown
      requestBody: unknown
      responseBody?: unknown | null
      responseStatusCode: number
      status: RequestStatus
      errorMessage: string
      durationMs: number
      firstTokenMs: number
      createTime: string
      updateTime: string
    }

    interface RequestSearchFilters {
      requestId?: string
      userId?: number
      tokenId?: number
      channelGroup?: string
      sourceType?: string
      endpoint?: string
      requestFormat?: string
      requestedModel?: string
      upstreamModel?: string
      status?: RequestStatus
      isStream?: boolean
      responseStatusCode?: number
      createTimeStart?: string
      createTimeEnd?: string
    }

    interface RequestSearchParams extends Api.Common.CommonSearchParams, RequestSearchFilters {}
  }

  /** AI 请求执行管理 */
  namespace AiRequestExecution {
    type RequestExecutionStatus = 1 | 2 | 3 | 4 | 5

    type RequestExecutionList = Api.Common.PaginatedResponse<RequestExecutionListItem>

    interface RequestExecutionListItem {
      id: number
      aiRequestId: number
      requestId: string
      attemptNo: number
      channelId: number
      accountId: number
      endpoint: string
      requestFormat: string
      requestedModel: string
      upstreamModel: string
      upstreamRequestId: string
      responseStatusCode: number
      status: RequestExecutionStatus
      durationMs: number
      firstTokenMs: number
      startedAt: string
      finishedAt?: string | null
      createTime: string
    }

    interface RequestExecutionDetailVo extends RequestExecutionListItem {
      requestHeaders: unknown
      requestBody: unknown
      responseBody?: unknown | null
      errorMessage: string
    }

    interface RequestExecutionSearchFilters {
      aiRequestId?: number
      requestId?: string
      channelId?: number
      accountId?: number
      endpoint?: string
      requestFormat?: string
      requestedModel?: string
      upstreamModel?: string
      status?: RequestExecutionStatus
      responseStatusCode?: number
      startedAtStart?: string
      startedAtEnd?: string
    }

    interface RequestExecutionSearchParams
      extends Api.Common.CommonSearchParams,
        RequestExecutionSearchFilters {}
  }

  /** AI 重试记录管理 */
  namespace AiRetryAttempt {
    type RetryAttemptStatus = 1 | 2 | 3 | 4

    type RetryAttemptList = Api.Common.PaginatedResponse<RetryAttemptListItem>

    interface RetryAttemptListItem {
      id: number
      domainCode: string
      taskType: string
      referenceId: string
      requestId: string
      attemptNo: number
      status: RetryAttemptStatus
      backoffSeconds: number
      nextRetryAt?: string | null
      createTime: string
      updateTime: string
    }

    interface RetryAttemptDetailVo extends RetryAttemptListItem {
      errorMessage: string
      payload: unknown
    }

    interface RetryAttemptSearchFilters {
      domainCode?: string
      taskType?: string
      referenceId?: string
      requestId?: string
      attemptNo?: number
      status?: RetryAttemptStatus
      nextRetryAtStart?: string
      nextRetryAtEnd?: string
      createTimeStart?: string
      createTimeEnd?: string
    }

    interface RetryAttemptSearchParams
      extends Api.Common.CommonSearchParams,
        RetryAttemptSearchFilters {}
  }

  /** AI 告警规则管理 */
  namespace AiAlertRule {
    type AlertRuleStatus = 1 | 2

    type AlertRuleList = Api.Common.PaginatedResponse<AlertRuleVo>

    interface AlertRuleVo {
      id: number
      domainCode: string
      ruleCode: string
      ruleName: string
      severity: number
      metricKey: string
      conditionExpr: string
      thresholdConfig: unknown
      channelConfig: unknown
      silenceSeconds: number
      status: AlertRuleStatus
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface AlertRuleSearchFilters {
      domainCode?: string
      ruleCode?: string
      metricKey?: string
      status?: AlertRuleStatus
      severity?: number
    }

    interface AlertRuleSearchParams extends Api.Common.CommonSearchParams, AlertRuleSearchFilters {}

    interface CreateAlertRuleParams {
      domainCode?: string
      ruleCode: string
      ruleName: string
      severity: number
      metricKey: string
      conditionExpr?: string
      thresholdConfig?: unknown
      channelConfig?: unknown
      silenceSeconds?: number
      status?: AlertRuleStatus
    }

    interface UpdateAlertRuleParams {
      ruleName?: string
      severity?: number
      metricKey?: string
      conditionExpr?: string
      thresholdConfig?: unknown
      channelConfig?: unknown
      silenceSeconds?: number
      status?: AlertRuleStatus
    }
  }

  /** AI 告警事件管理 */
  namespace AiAlertEvent {
    type AlertEventStatus = 1 | 2 | 3 | 4

    type AlertEventList = Api.Common.PaginatedResponse<AlertEventVo>

    interface AlertEventVo {
      id: number
      alertRuleId: number
      eventCode: string
      severity: number
      status: AlertEventStatus
      sourceDomain: string
      sourceRef: string
      title: string
      detail: string
      payload: unknown
      firstTriggeredAt: string
      lastTriggeredAt: string
      ackBy: string
      ackTime?: string | null
      resolvedBy: string
      resolvedTime?: string | null
      createTime: string
    }

    interface AlertEventSearchFilters {
      alertRuleId?: number
      status?: AlertEventStatus
      severity?: number
      sourceDomain?: string
      sourceRef?: string
      lastTriggeredAtStart?: string
      lastTriggeredAtEnd?: string
    }

    interface AlertEventSearchParams
      extends Api.Common.CommonSearchParams,
        AlertEventSearchFilters {}
  }

  /** AI 告警静默管理 */
  namespace AiAlertSilence {
    type AlertSilenceStatus = 1 | 2

    type AlertSilenceList = Api.Common.PaginatedResponse<AlertSilenceVo>

    interface AlertSilenceVo {
      id: number
      alertRuleId: number
      scopeType: string
      scopeKey: string
      reason: string
      status: AlertSilenceStatus
      metadata: unknown
      createBy: string
      startTime: string
      endTime: string
      createTime: string
    }

    interface AlertSilenceSearchFilters {
      alertRuleId?: number
      status?: AlertSilenceStatus
      scopeType?: string
      scopeKey?: string
    }

    interface AlertSilenceSearchParams
      extends Api.Common.CommonSearchParams,
        AlertSilenceSearchFilters {}

    interface CreateAlertSilenceParams {
      alertRuleId: number
      scopeType?: string
      scopeKey?: string
      reason?: string
      metadata?: unknown
      startTime?: string | null
      endTime: string
    }
  }

  /** AI 日统计 */
  namespace AiDailyStats {
    type DailyStatsList = Api.Common.PaginatedResponse<DailyStatsVo>

    interface DailyStatsVo {
      id: number
      statsDate: string
      userId: number
      projectId: number
      channelId: number
      accountId: number
      modelName: string
      requestCount: number
      successCount: number
      failCount: number
      promptTokens: number
      completionTokens: number
      totalTokens: number
      cachedTokens: number
      reasoningTokens: number
      quota: number
      costTotal: number
      avgElapsedTime: number
      avgFirstTokenTime: number
      createTime: string
    }

    interface DailyStatsSearchFilters {
      statsDateStart?: string
      statsDateEnd?: string
      userId?: number
      projectId?: number
      channelId?: number
      accountId?: number
      modelName?: string
    }

    interface DailyStatsSearchParams
      extends Api.Common.CommonSearchParams,
        DailyStatsSearchFilters {}
  }

  /** AI Guardrail */
  namespace AiGuardrail {
    type GuardrailRuleSeverity = 1 | 2 | 3
    type PromptProtectionRuleStatus = 1 | 2

    interface GuardrailConfigVo {
      id: number
      scopeType: string
      organizationId: number
      projectId: number
      enabled: boolean
      mode: string
      systemRules: unknown
      allowedFileTypes: unknown
      maxFileSizeMb: number
      piiAction: string
      secretAction: string
      metadata: unknown
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface GuardrailRuleVo {
      id: number
      guardrailConfigId: number
      organizationId: number
      projectId: number
      teamId: number
      tokenId: number
      serviceAccountId: number
      ruleCode: string
      ruleName: string
      ruleType: string
      phase: string
      action: string
      priority: number
      enabled: boolean
      severity: GuardrailRuleSeverity
      modelPattern: string
      endpointPattern: string
      conditionJson: unknown
      ruleConfig: unknown
      metadata: unknown
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface GuardrailViolationVo {
      id: number
      organizationId: number
      projectId: number
      userId: number
      tokenId: number
      serviceAccountId: number
      ruleId: number
      requestId: string
      executionId: number
      logId: number
      taskId: number
      phase: string
      category: string
      actionTaken: string
      modelName: string
      endpoint: string
      matchedPattern: string
      matchedContentHash: string
      sampleExcerpt: string
      severity: number
      latencyMs: number
      metadata: unknown
      createTime: string
    }

    interface PromptProtectionRuleVo {
      id: number
      organizationId: number
      projectId: number
      ruleCode: string
      ruleName: string
      patternType: string
      phase: string
      action: string
      priority: number
      patternConfig: unknown
      rewriteTemplate: string
      status: PromptProtectionRuleStatus
      metadata: unknown
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface GuardrailMetricDailyVo {
      id: number
      statsDate: string
      organizationId: number
      projectId: number
      ruleId: number
      ruleCode: string
      requestsEvaluated: number
      passedCount: number
      blockedCount: number
      redactedCount: number
      warnedCount: number
      flaggedCount: number
      avgLatencyMs: number
      createTime: string
    }

    type GuardrailConfigList = GuardrailConfigVo[]
    type GuardrailRuleList = Api.Common.PaginatedResponse<GuardrailRuleVo>
    type GuardrailViolationList = Api.Common.PaginatedResponse<GuardrailViolationVo>
    type PromptProtectionRuleList = Api.Common.PaginatedResponse<PromptProtectionRuleVo>
    type GuardrailMetricDailyList = Api.Common.PaginatedResponse<GuardrailMetricDailyVo>

    interface GuardrailRuleSearchFilters {
      guardrailConfigId?: number
      organizationId?: number
      projectId?: number
      ruleCode?: string
      ruleName?: string
      phase?: string
      action?: string
      enabled?: boolean
      severity?: GuardrailRuleSeverity
    }

    interface GuardrailRuleSearchParams
      extends Api.Common.CommonSearchParams,
        GuardrailRuleSearchFilters {}

    interface GuardrailViolationSearchFilters {
      organizationId?: number
      projectId?: number
      userId?: number
      tokenId?: number
      serviceAccountId?: number
      ruleId?: number
      requestId?: string
      phase?: string
      category?: string
      actionTaken?: string
      createTimeStart?: string
      createTimeEnd?: string
    }

    interface GuardrailViolationSearchParams
      extends Api.Common.CommonSearchParams,
        GuardrailViolationSearchFilters {}

    interface CreateGuardrailConfigParams {
      scopeType: string
      organizationId?: number
      projectId?: number
      enabled?: boolean
      mode: string
      systemRules?: unknown
      allowedFileTypes?: unknown
      maxFileSizeMb?: number
      piiAction?: string
      secretAction?: string
      metadata?: unknown
      remark?: string
    }

    interface UpdateGuardrailConfigParams {
      scopeType?: string
      organizationId?: number
      projectId?: number
      enabled?: boolean
      mode?: string
      systemRules?: unknown
      allowedFileTypes?: unknown
      maxFileSizeMb?: number
      piiAction?: string
      secretAction?: string
      metadata?: unknown
      remark?: string
    }
  }
}
