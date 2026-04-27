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
  }
}
