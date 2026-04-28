declare namespace Api {
  namespace AiManage {
    type ApiStyle = 'openai-compatible' | 'anthropic-native' | 'gemini-native' | 'ollama-native'

    type ChannelType = 1 | 2 | 3 | 4 | 5 | 6 | 7
    type ChannelStatus = 1 | 2 | 3 | 4
    type ChannelLastHealthStatus = 0 | 1 | 2 | 3

    type VendorList = Api.Common.PaginatedResponse<VendorVo>

    interface VendorVo {
      id: number
      vendorCode: string
      vendorName: string
      apiStyle: ApiStyle
      icon: string
      description: string
      baseUrl: string
      docUrl: string
      metadata: Record<string, unknown>
      vendorSort: number
      enabled: boolean
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface VendorQueryFilters {
      vendorCode?: string
      apiStyle?: ApiStyle
      enabled?: boolean
      keyword?: string
    }

    interface VendorQueryParams extends Api.Common.CommonSearchParams, VendorQueryFilters {}

    interface CreateVendorParams {
      vendorCode: string
      vendorName: string
      apiStyle: ApiStyle
      icon?: string
      description?: string
      baseUrl?: string
      docUrl?: string
      metadata?: Record<string, unknown>
      vendorSort?: number
      enabled?: boolean
      remark?: string
    }

    interface UpdateVendorParams {
      vendorName?: string
      apiStyle?: ApiStyle
      icon?: string
      description?: string
      baseUrl?: string
      docUrl?: string
      metadata?: Record<string, unknown>
      vendorSort?: number
      enabled?: boolean
      remark?: string
    }

    type ChannelList = Api.Common.PaginatedResponse<ChannelVo>

    interface ChannelVo {
      id: number
      name: string
      channelType: ChannelType
      vendorCode: string
      baseUrl: string
      status: ChannelStatus
      models: string[]
      channelGroup: string
      endpointScopes: string[]
      weight: number
      priority: number
      autoBan: boolean
      testModel: string
      usedQuota: number
      responseTime: number
      successRate: number
      failureStreak: number
      lastHealthStatus: ChannelLastHealthStatus
      lastUsedAt?: string | null
      lastErrorAt?: string | null
      lastErrorCode: string
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface ChannelDetailVo extends ChannelVo {
      modelMapping: Record<string, unknown>
      capabilities: string[]
      config: Record<string, unknown>
      lastErrorMessage: string
      balance: number
      balanceUpdatedAt?: string | null
    }

    interface ChannelStatusCountsVo {
      enabled: number
      manualDisabled: number
      autoDisabled: number
      archived: number
      total: number
    }

    interface ChannelQueryFilters {
      keyword?: string
      status?: ChannelStatus
      channelType?: ChannelType
      vendorCode?: string
      channelGroup?: string
      idSort?: boolean
    }

    interface ChannelQueryParams extends Api.Common.CommonSearchParams, ChannelQueryFilters {}

    interface CreateChannelParams {
      name: string
      channelType: ChannelType
      vendorCode: string
      baseUrl: string
      models?: string[]
      modelMapping?: Record<string, unknown>
      channelGroup?: string
      endpointScopes?: string[]
      capabilities?: string[]
      weight?: number
      priority?: number
      config?: Record<string, unknown>
      autoBan?: boolean
      testModel?: string
      remark?: string
      status?: ChannelStatus
    }

    interface UpdateChannelParams {
      name?: string
      channelType?: ChannelType
      vendorCode?: string
      baseUrl?: string
      models?: string[]
      modelMapping?: Record<string, unknown>
      channelGroup?: string
      endpointScopes?: string[]
      capabilities?: string[]
      weight?: number
      priority?: number
      config?: Record<string, unknown>
      autoBan?: boolean
      testModel?: string
      status?: ChannelStatus
      remark?: string
    }

    interface BatchDeleteChannelParams {
      ids: number[]
    }

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
      quotaLimit: number
      quotaUsed: number
      balance: number
      balanceUpdatedAt?: string | null
      responseTime: number
      failureStreak: number
      lastUsedAt?: string | null
      lastErrorAt?: string | null
      lastErrorCode: string
      rateLimitedUntil?: string | null
      overloadUntil?: string | null
      expiresAt?: string | null
      testModel: string
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface ChannelAccountDetailVo extends ChannelAccountVo {
      credentials: unknown
      extra: unknown
      disabledApiKeys: unknown
      lastErrorMessage: string
    }

    interface ChannelAccountQueryFilters {
      channelId?: number
      status?: ChannelAccountStatus
      credentialType?: string
      keyword?: string
    }

    interface ChannelAccountQueryParams
      extends Api.Common.CommonSearchParams,
        ChannelAccountQueryFilters {}

    interface CreateChannelAccountParams {
      channelId: number
      name: string
      credentialType: string
      credentials: unknown
      secretRef?: string
      status?: ChannelAccountStatus
      schedulable?: boolean
      priority?: number
      weight?: number
      rateMultiplier?: number
      concurrencyLimit?: number
      quotaLimit?: number
      testModel?: string
      extra?: unknown
      remark?: string
    }

    interface UpdateChannelAccountParams {
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
      testModel?: string
      extra?: unknown
      remark?: string
    }

    type ModelConfigType = 1 | 2 | 3 | 4 | 5

    type ModelConfigList = Api.Common.PaginatedResponse<ModelConfigVo>

    interface ModelConfigVo {
      id: number
      modelName: string
      displayName: string
      modelType: ModelConfigType
      vendorCode: string
      supportedEndpoints: string[]
      inputRatio: number
      outputRatio: number
      cachedInputRatio: number
      reasoningRatio: number
      capabilities: string[]
      maxContext: number
      currency: string
      effectiveFrom?: string | null
      metadata: unknown
      enabled: boolean
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface ModelConfigQueryFilters {
      modelName?: string
      modelType?: ModelConfigType
      vendorCode?: string
      enabled?: boolean
      keyword?: string
    }

    interface ModelConfigQueryParams
      extends Api.Common.CommonSearchParams,
        ModelConfigQueryFilters {}

    interface CreateModelConfigParams {
      modelName: string
      displayName: string
      modelType: ModelConfigType
      vendorCode: string
      supportedEndpoints?: string[]
      inputRatio?: number
      outputRatio?: number
      cachedInputRatio?: number
      reasoningRatio?: number
      capabilities?: string[]
      maxContext?: number
      currency?: string
      effectiveFrom?: string
      metadata?: unknown
      enabled?: boolean
      remark?: string
    }

    interface UpdateModelConfigParams {
      displayName?: string
      modelType?: ModelConfigType
      vendorCode?: string
      supportedEndpoints?: string[]
      inputRatio?: number
      outputRatio?: number
      cachedInputRatio?: number
      reasoningRatio?: number
      capabilities?: string[]
      maxContext?: number
      currency?: string
      effectiveFrom?: string
      metadata?: unknown
      enabled?: boolean
      remark?: string
    }

    type ChannelModelPriceBillingMode = 1 | 2 | 3
    type ChannelModelPriceStatus = 1 | 2
    type ChannelModelPriceVersionStatus = 1 | 2

    interface ChannelModelPriceConfig {
      inputPerMillion: string
      outputPerMillion: string
      cacheReadPerMillion?: string
      cacheWritePerMillion?: string
      reasoningPerMillion?: string
    }

    type ChannelModelPriceList = Api.Common.PaginatedResponse<ChannelModelPriceVo>

    interface ChannelModelPriceVo {
      id: number
      channelId: number
      modelName: string
      billingMode: ChannelModelPriceBillingMode
      currency: string
      priceConfig: ChannelModelPriceConfig
      referenceId: string
      status: ChannelModelPriceStatus
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface ChannelModelPriceDetailVo extends ChannelModelPriceVo {
      currentVersionNo?: number | null
    }

    interface ChannelModelPriceVersionVo {
      id: number
      channelModelPriceId: number
      channelId: number
      modelName: string
      versionNo: number
      referenceId: string
      priceConfig: ChannelModelPriceConfig
      effectiveStartAt: string
      effectiveEndAt?: string | null
      status: ChannelModelPriceVersionStatus
      createTime: string
    }

    interface ChannelModelPriceQueryFilters {
      channelId?: number
      modelName?: string
      status?: ChannelModelPriceStatus
      billingMode?: ChannelModelPriceBillingMode
      currency?: string
      keyword?: string
    }

    interface ChannelModelPriceQueryParams
      extends Api.Common.CommonSearchParams,
        ChannelModelPriceQueryFilters {}

    interface CreateChannelModelPriceParams {
      channelId: number
      modelName: string
      billingMode: ChannelModelPriceBillingMode
      currency: string
      priceConfig: ChannelModelPriceConfig
      status?: ChannelModelPriceStatus
      remark?: string
    }

    interface UpdateChannelModelPriceParams {
      billingMode?: ChannelModelPriceBillingMode
      currency?: string
      priceConfig?: ChannelModelPriceConfig
      status?: ChannelModelPriceStatus
      remark?: string
    }

    type GroupRatioList = Api.Common.PaginatedResponse<GroupRatioVo>

    interface GroupRatioVo {
      id: number
      groupCode: string
      groupName: string
      ratio: number
      enabled: boolean
      modelWhitelist: string[]
      modelBlacklist: string[]
      endpointScopes: string[]
      fallbackGroupCode: string
      policy: unknown
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface GroupRatioQueryFilters {
      groupCode?: string
      enabled?: boolean
      keyword?: string
    }

    interface GroupRatioQueryParams extends Api.Common.CommonSearchParams, GroupRatioQueryFilters {}

    interface CreateGroupRatioParams {
      groupCode: string
      groupName: string
      ratio: number
      enabled?: boolean
      modelWhitelist?: string[]
      modelBlacklist?: string[]
      endpointScopes?: string[]
      fallbackGroupCode?: string
      policy?: unknown
      remark?: string
    }

    interface UpdateGroupRatioParams {
      groupName?: string
      ratio?: number
      enabled?: boolean
      modelWhitelist?: string[]
      modelBlacklist?: string[]
      endpointScopes?: string[]
      fallbackGroupCode?: string
      policy?: unknown
      remark?: string
    }

    type ConfigEntryStatus = 1 | 2
    type ConfigEntryScopeType =
      | 'system'
      | 'organization'
      | 'project'
      | 'provider'
      | 'model'
      | 'plugin'

    type ConfigEntryList = Api.Common.PaginatedResponse<ConfigEntryVo>

    interface ConfigEntryVo {
      id: number
      scopeType: ConfigEntryScopeType
      scopeId: number
      category: string
      configKey: string
      configValue: unknown
      secretRef: string
      status: ConfigEntryStatus
      versionNo: number
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface ConfigEntryQueryFilters {
      scopeType?: ConfigEntryScopeType
      scopeId?: number
      category?: string
      configKey?: string
      status?: ConfigEntryStatus
      keyword?: string
    }

    interface ConfigEntryQueryParams
      extends Api.Common.CommonSearchParams,
        ConfigEntryQueryFilters {}

    interface CreateConfigEntryParams {
      scopeType: ConfigEntryScopeType
      scopeId: number
      category: string
      configKey: string
      configValue: unknown
      secretRef?: string
      status?: ConfigEntryStatus
      remark?: string
    }

    interface UpdateConfigEntryParams {
      scopeType?: ConfigEntryScopeType
      scopeId?: number
      category?: string
      configKey?: string
      configValue?: unknown
      secretRef?: string
      status?: ConfigEntryStatus
      remark?: string
    }

    type UserQuotaStatus = 1 | 2 | 3

    type UserQuotaList = Api.Common.PaginatedResponse<UserQuotaVo>

    interface UserQuotaVo {
      id: number
      userId: number
      channelGroup: string
      status: UserQuotaStatus
      quota: number
      usedQuota: number
      remainingQuota: number
      requestCount: number
      dailyQuotaLimit: number
      monthlyQuotaLimit: number
      dailyUsedQuota: number
      monthlyUsedQuota: number
      dailyWindowStart?: string | null
      monthlyWindowStart?: string | null
      lastRequestTime?: string | null
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface UserQuotaQueryFilters {
      userId?: number
      status?: UserQuotaStatus
      channelGroup?: string
      keyword?: string
    }

    interface UserQuotaQueryParams extends Api.Common.CommonSearchParams, UserQuotaQueryFilters {}

    interface CreateUserQuotaParams {
      userId: number
      channelGroup?: string
      status?: UserQuotaStatus
      quota: number
      dailyQuotaLimit?: number
      monthlyQuotaLimit?: number
      remark?: string
    }

    interface UpdateUserQuotaParams {
      channelGroup?: string
      status?: UserQuotaStatus
      quota?: number
      dailyQuotaLimit?: number
      monthlyQuotaLimit?: number
      remark?: string
    }

    interface AdjustUserQuotaParams {
      quotaDelta: number
      referenceNo?: string
      reason?: string
    }

    type AbilityList = Api.Common.PaginatedResponse<AbilityVo>

    interface AbilityVo {
      id: number
      channelGroup: string
      endpointScope: string
      model: string
      channelId: number
      enabled: boolean
      priority: number
      weight: number
      routeConfig: unknown
      createTime: string
      updateTime: string
    }

    interface AbilityQueryFilters {
      channelGroup?: string
      endpointScope?: string
      model?: string
      channelId?: number
      enabled?: boolean
      keyword?: string
    }

    interface AbilityQueryParams extends Api.Common.CommonSearchParams, AbilityQueryFilters {}

    interface CreateAbilityParams {
      channelGroup: string
      endpointScope: string
      model: string
      channelId: number
      enabled?: boolean
      priority?: number
      weight?: number
      routeConfig?: unknown
    }

    interface UpdateAbilityParams {
      channelGroup?: string
      endpointScope?: string
      model?: string
      channelId?: number
      enabled?: boolean
      priority?: number
      weight?: number
      routeConfig?: unknown
    }

    type RoutingRuleStatus = 1 | 2

    type RoutingRuleList = Api.Common.PaginatedResponse<RoutingRuleVo>

    interface RoutingRuleVo {
      id: number
      organizationId: number
      projectId: number
      ruleCode: string
      ruleName: string
      priority: number
      matchType: string
      matchConditions: unknown
      routeStrategy: string
      fallbackStrategy: string
      status: RoutingRuleStatus
      startTime?: string | null
      endTime?: string | null
      metadata: unknown
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface RoutingRuleQueryFilters {
      organizationId?: number
      projectId?: number
      status?: RoutingRuleStatus
      ruleCode?: string
      keyword?: string
    }

    interface RoutingRuleQueryParams
      extends Api.Common.CommonSearchParams,
        RoutingRuleQueryFilters {}

    interface CreateRoutingRuleParams {
      organizationId: number
      projectId: number
      ruleCode: string
      ruleName: string
      priority?: number
      matchType: string
      matchConditions?: unknown
      routeStrategy: string
      fallbackStrategy?: string
      status?: RoutingRuleStatus
      startTime?: string
      endTime?: string
      metadata?: unknown
      remark?: string
    }

    interface UpdateRoutingRuleParams {
      organizationId?: number
      projectId?: number
      ruleCode?: string
      ruleName?: string
      priority?: number
      matchType?: string
      matchConditions?: unknown
      routeStrategy?: string
      fallbackStrategy?: string
      status?: RoutingRuleStatus
      startTime?: string
      endTime?: string
      metadata?: unknown
      remark?: string
    }

    type RoutingTargetStatus = 1 | 2
    type RoutingTargetType = 'channel' | 'account' | 'channel_group' | 'plugin' | 'pipeline'

    type RoutingTargetList = Api.Common.PaginatedResponse<RoutingTargetVo>

    interface RoutingTargetVo {
      id: number
      routingRuleId: number
      targetType: RoutingTargetType
      channelId: number
      accountId: number
      pluginId: number
      targetKey: string
      weight: number
      priority: number
      cooldownSeconds: number
      config: unknown
      status: RoutingTargetStatus
      createTime: string
      updateTime: string
    }

    interface RoutingTargetQueryFilters {
      routingRuleId?: number
      targetType?: RoutingTargetType
      status?: RoutingTargetStatus
      channelId?: number
      accountId?: number
      pluginId?: number
      keyword?: string
    }

    interface RoutingTargetQueryParams
      extends Api.Common.CommonSearchParams,
        RoutingTargetQueryFilters {}

    interface CreateRoutingTargetParams {
      routingRuleId: number
      targetType: RoutingTargetType
      channelId?: number
      accountId?: number
      pluginId?: number
      targetKey?: string
      weight?: number
      priority?: number
      cooldownSeconds?: number
      config?: unknown
      status?: RoutingTargetStatus
    }

    interface UpdateRoutingTargetParams {
      routingRuleId?: number
      targetType?: RoutingTargetType
      channelId?: number
      accountId?: number
      pluginId?: number
      targetKey?: string
      weight?: number
      priority?: number
      cooldownSeconds?: number
      config?: unknown
      status?: RoutingTargetStatus
    }

    type TokenStatus = 1 | 2 | 3 | 4

    type TokenList = Api.Common.PaginatedResponse<TokenVo>

    interface TokenVo {
      id: number
      userId: number
      serviceAccountId: number
      projectId: number
      name: string
      keyPrefix: string
      status: TokenStatus
      remainQuota: number
      usedQuota: number
      unlimitedQuota: boolean
      models: string[]
      endpointScopes: string[]
      groupCodeOverride: string
      rpmLimit: number
      tpmLimit: number
      concurrencyLimit: number
      dailyQuotaLimit: number
      monthlyQuotaLimit: number
      dailyUsedQuota: number
      monthlyUsedQuota: number
      expireTime?: string | null
      accessTime?: string | null
      lastUsedIp: string
      remark: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    interface TokenDetailVo extends TokenVo {
      ipWhitelist: string[]
      ipBlacklist: string[]
      dailyWindowStart?: string | null
      monthlyWindowStart?: string | null
      lastUserAgent: string
    }

    interface CreatedTokenVo {
      token: TokenVo
      rawKey: string
    }

    interface RotatedTokenKeyVo {
      id: number
      keyPrefix: string
      rawKey: string
    }

    interface BatchDeleteTokenResult {
      deleted: number
    }

    interface TokenQueryFilters {
      userId?: number
      serviceAccountId?: number
      projectId?: number
      status?: TokenStatus
      keyword?: string
      keyPrefix?: string
      groupCodeOverride?: string
    }

    interface TokenQueryParams extends Api.Common.CommonSearchParams, TokenQueryFilters {}

    interface CreateTokenParams {
      userId: number
      serviceAccountId?: number
      projectId?: number
      name: string
      remainQuota?: number
      unlimitedQuota?: boolean
      models?: string[]
      endpointScopes?: string[]
      ipWhitelist?: string[]
      ipBlacklist?: string[]
      groupCodeOverride?: string
      rpmLimit?: number
      tpmLimit?: number
      concurrencyLimit?: number
      dailyQuotaLimit?: number
      monthlyQuotaLimit?: number
      expireTime?: string
      remark?: string
      status?: TokenStatus
    }

    interface UpdateTokenParams {
      name?: string
      status?: TokenStatus
      remainQuota?: number
      unlimitedQuota?: boolean
      models?: string[]
      endpointScopes?: string[]
      ipWhitelist?: string[]
      ipBlacklist?: string[]
      groupCodeOverride?: string
      rpmLimit?: number
      tpmLimit?: number
      concurrencyLimit?: number
      dailyQuotaLimit?: number
      monthlyQuotaLimit?: number
      expireTime?: string
      remark?: string
    }

    interface UpdateTokenStatusParams {
      status: TokenStatus
    }

    interface BatchDeleteTokenParams {
      ids: number[]
    }

    type RequestLogType = 1 | 2 | 3 | 4
    type RequestLogStatus = 1 | 2 | 3
    type RequestStatus = 1 | 2 | 3 | 4 | 5

    type RequestLogList = Api.Common.PaginatedResponse<RequestLogVo>

    interface RequestLogVo {
      id: number
      userId: number
      tokenId: number
      tokenName: string
      projectId: number
      channelId: number
      channelName: string
      accountId: number
      accountName: string
      executionId: number
      endpoint: string
      requestFormat: string
      requestedModel: string
      upstreamModel: string
      modelName: string
      promptTokens: number
      completionTokens: number
      totalTokens: number
      cachedTokens: number
      reasoningTokens: number
      quota: number
      costTotal: number
      priceReference: string
      elapsedTime: number
      firstTokenTime: number
      isStream: boolean
      requestId: string
      upstreamRequestId: string
      statusCode: number
      clientIp: string
      content: string
      logType: RequestLogType
      status: RequestLogStatus
      requestStatus?: RequestStatus | null
      createTime: string
    }

    interface RequestDetailVo {
      id: number
      requestId: string
      userId: number
      tokenId: number
      projectId: number
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

    interface RequestLogQueryFilters {
      userId?: number
      tokenId?: number
      projectId?: number
      channelId?: number
      accountId?: number
      status?: RequestLogStatus
      logType?: RequestLogType
      endpoint?: string
      modelName?: string
      requestId?: string
      keyword?: string
      startTime?: string
      endTime?: string
    }

    interface RequestLogQueryParams extends Api.Common.CommonSearchParams, RequestLogQueryFilters {}

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

    interface DailyStatsSummaryVo {
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
    }

    interface DailyStatsDimensionVo {
      key: string
      requestCount: number
      successCount: number
      failCount: number
      totalTokens: number
      quota: number
      costTotal: number
    }

    interface DashboardOverviewVo {
      summary: DailyStatsSummaryVo
      byChannel: DailyStatsDimensionVo[]
      byModel: DailyStatsDimensionVo[]
    }

    interface DailyStatsQueryFilters {
      startDate?: string
      endDate?: string
      userId?: number
      projectId?: number
      channelId?: number
      accountId?: number
      modelName?: string
    }

    interface DailyStatsQueryParams extends Api.Common.CommonSearchParams, DailyStatsQueryFilters {}

    interface DashboardQueryParams {
      startDate?: string
      endDate?: string
    }
  }
}
