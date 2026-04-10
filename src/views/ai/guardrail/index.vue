<template>
  <div class="art-full-height guardrail-page">
    <ElCard class="guardrail-overview-card">
      <div class="guardrail-overview-grid">
        <div class="overview-item">
          <div class="overview-label">Configs</div>
          <div class="overview-value">{{ configList.length }}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">Rules</div>
          <div class="overview-value">{{ rulePage.totalElements }}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">Violations</div>
          <div class="overview-value">{{ violationPage.totalElements }}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">Prompt Rules</div>
          <div class="overview-value">{{ promptRulePage.totalElements }}</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">Metric Daily</div>
          <div class="overview-value">{{ metricDailyPage.totalElements }}</div>
        </div>
      </div>
    </ElCard>

    <ElCard class="art-table-card guardrail-tabs-card">
      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <ElTabPane label="Configs" name="config">
          <div class="tab-toolbar">
            <ElButton type="primary" @click="openConfigPanel('add')">新增 Config</ElButton>
          </div>
          <ElTable :data="configList" v-loading="loading.config" border>
            <ElTableColumn prop="scopeType" label="Scope" min-width="120" />
            <ElTableColumn prop="mode" label="Mode" width="110" />
            <ElTableColumn label="Enabled" width="90">
              <template #default="{ row }">
                <ElTag :type="row.enabled ? 'success' : 'info'" size="small">
                  {{ row.enabled ? '启用' : '禁用' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="organizationId" label="Org ID" width="90" />
            <ElTableColumn prop="projectId" label="Project ID" width="90" />
            <ElTableColumn label="System Rules" min-width="220" show-overflow-tooltip>
              <template #default="{ row }">{{ buildJsonSummary(row.systemRules) }}</template>
            </ElTableColumn>
            <ElTableColumn label="Allowed Files" min-width="160" show-overflow-tooltip>
              <template #default="{ row }">{{ buildJsonSummary(row.allowedFileTypes) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="piiAction" label="PII" width="100" />
            <ElTableColumn prop="secretAction" label="Secret" width="100" />
            <ElTableColumn prop="maxFileSizeMb" label="Max MB" width="90" />
            <ElTableColumn prop="updateTime" label="Updated" width="170">
              <template #default="{ row }">{{ formatGuardrailTime(row.updateTime) }}</template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <ArtButtonMore
                  :list="[
                    { key: 'edit', label: '编辑 Config', icon: 'ri:edit-2-line' },
                    {
                      key: 'delete',
                      label: '删除 Config',
                      icon: 'ri:delete-bin-4-line',
                      color: '#f56c6c'
                    }
                  ]"
                  @click="(item) => handleConfigMoreClick(item, row)"
                />
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <ElTabPane label="Rules" name="rule">
          <GuardrailRuleSearch
            v-show="showRuleSearch"
            v-model="ruleSearchForm"
            @search="handleRuleSearch"
            @reset="handleRuleReset"
          />
          <div class="tab-toolbar">
            <ElButton text @click="showRuleSearch = !showRuleSearch">
              {{ showRuleSearch ? '收起搜索' : '展开搜索' }}
            </ElButton>
          </div>
          <ElTable :data="rulePage.content" v-loading="loading.rule" border>
            <ElTableColumn prop="ruleName" label="规则" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="cell-stack">
                  <div class="cell-main">{{ row.ruleName }}</div>
                  <div class="cell-sub">{{ row.ruleCode }}</div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="ruleType" label="Type" width="140" />
            <ElTableColumn prop="phase" label="Phase" width="140" />
            <ElTableColumn prop="action" label="Action" width="110" />
            <ElTableColumn prop="enabled" label="Enabled" width="90">
              <template #default="{ row }">
                <ElTag :type="row.enabled ? 'success' : 'info'" size="small">
                  {{ row.enabled ? '启用' : '禁用' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="severity" label="Severity" width="100">
              <template #default="{ row }">
                <ElTag :type="getGuardrailSeverityMeta(row.severity).type" size="small">
                  {{ getGuardrailSeverityMeta(row.severity).text }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="priority" label="Priority" width="90" />
            <ElTableColumn label="Condition" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">{{ buildJsonSummary(row.conditionJson) }}</template>
            </ElTableColumn>
            <ElTableColumn label="Config" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">{{ buildJsonSummary(row.ruleConfig) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="updateTime" label="Updated" width="170">
              <template #default="{ row }">{{ formatGuardrailTime(row.updateTime) }}</template>
            </ElTableColumn>
          </ElTable>
          <div class="table-pagination">
            <ElPagination
              background
              layout="total, prev, pager, next"
              :current-page="rulePage.pageNumber"
              :page-size="rulePage.pageSize"
              :total="rulePage.totalElements"
              @current-change="handleRulePageChange"
            />
          </div>
        </ElTabPane>

        <ElTabPane label="Violations" name="violation">
          <GuardrailViolationSearch
            v-show="showViolationSearch"
            v-model="violationSearchForm"
            @search="handleViolationSearch"
            @reset="handleViolationReset"
          />
          <div class="tab-toolbar">
            <ElButton text @click="showViolationSearch = !showViolationSearch">
              {{ showViolationSearch ? '收起搜索' : '展开搜索' }}
            </ElButton>
          </div>
          <ElTable :data="violationPage.content" v-loading="loading.violation" border>
            <ElTableColumn prop="requestId" label="请求信息" min-width="220" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="cell-stack">
                  <div class="cell-main">{{ row.requestId }}</div>
                  <div class="cell-sub">{{ row.category }} / {{ row.actionTaken }}</div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="phase" label="Phase" width="130" />
            <ElTableColumn prop="endpoint" label="Endpoint" min-width="150" />
            <ElTableColumn prop="modelName" label="Model" min-width="140" />
            <ElTableColumn prop="severity" label="Severity" width="100">
              <template #default="{ row }">
                <ElTag :type="getGuardrailSeverityMeta(row.severity).type" size="small">
                  {{ getGuardrailSeverityMeta(row.severity).text }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="sampleExcerpt"
              label="Excerpt"
              min-width="220"
              show-overflow-tooltip
            />
            <ElTableColumn prop="latencyMs" label="Latency" width="100">
              <template #default="{ row }">{{ formatLatencyMs(row.latencyMs) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="createTime" label="Created" width="170">
              <template #default="{ row }">{{ formatGuardrailTime(row.createTime) }}</template>
            </ElTableColumn>
          </ElTable>
          <div class="table-pagination">
            <ElPagination
              background
              layout="total, prev, pager, next"
              :current-page="violationPage.pageNumber"
              :page-size="violationPage.pageSize"
              :total="violationPage.totalElements"
              @current-change="handleViolationPageChange"
            />
          </div>
        </ElTabPane>

        <ElTabPane label="Prompt Protection" name="prompt">
          <ElTable :data="promptRulePage.content" v-loading="loading.prompt" border>
            <ElTableColumn prop="ruleName" label="规则" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="cell-stack">
                  <div class="cell-main">{{ row.ruleName }}</div>
                  <div class="cell-sub">{{ row.ruleCode }}</div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="patternType" label="Pattern" width="120" />
            <ElTableColumn prop="phase" label="Phase" width="130" />
            <ElTableColumn prop="action" label="Action" width="110" />
            <ElTableColumn prop="priority" label="Priority" width="90" />
            <ElTableColumn prop="status" label="Status" width="100">
              <template #default="{ row }">
                <ElTag :type="getPromptProtectionStatusMeta(row.status).type" size="small">
                  {{ getPromptProtectionStatusMeta(row.status).text }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Pattern Config" min-width="220" show-overflow-tooltip>
              <template #default="{ row }">{{ buildJsonSummary(row.patternConfig) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="updateTime" label="Updated" width="170">
              <template #default="{ row }">{{ formatGuardrailTime(row.updateTime) }}</template>
            </ElTableColumn>
          </ElTable>
          <div class="table-pagination">
            <ElPagination
              background
              layout="total, prev, pager, next"
              :current-page="promptRulePage.pageNumber"
              :page-size="promptRulePage.pageSize"
              :total="promptRulePage.totalElements"
              @current-change="handlePromptPageChange"
            />
          </div>
        </ElTabPane>

        <ElTabPane label="Metric Daily" name="metric">
          <ElTable :data="metricDailyPage.content" v-loading="loading.metric" border>
            <ElTableColumn prop="statsDate" label="日期" width="120" />
            <ElTableColumn prop="ruleCode" label="规则编码" min-width="160" />
            <ElTableColumn prop="organizationId" label="Org ID" width="90" />
            <ElTableColumn prop="projectId" label="Project ID" width="90" />
            <ElTableColumn prop="requestsEvaluated" label="评估数" width="100" />
            <ElTableColumn prop="passedCount" label="通过" width="90" />
            <ElTableColumn prop="blockedCount" label="拦截" width="90" />
            <ElTableColumn prop="redactedCount" label="脱敏" width="90" />
            <ElTableColumn prop="warnedCount" label="警告" width="90" />
            <ElTableColumn prop="flaggedCount" label="标记" width="90" />
            <ElTableColumn prop="avgLatencyMs" label="平均耗时" width="110">
              <template #default="{ row }">{{ formatLatencyMs(row.avgLatencyMs) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="createTime" label="记录时间" width="170">
              <template #default="{ row }">{{ formatGuardrailTime(row.createTime) }}</template>
            </ElTableColumn>
          </ElTable>
          <div class="table-pagination">
            <ElPagination
              background
              layout="total, prev, pager, next"
              :current-page="metricDailyPage.pageNumber"
              :page-size="metricDailyPage.pageSize"
              :total="metricDailyPage.totalElements"
              @current-change="handleMetricPageChange"
            />
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <GuardrailConfigFormPanel
      v-model="configPanelVisible"
      :panel-mode="configPanelMode"
      :config-data="currentConfigData"
      @success="handleConfigSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import {
    fetchDeleteAiGuardrailConfig,
    fetchGetAiGuardrailConfigList,
    fetchGetAiGuardrailMetricDailyList,
    fetchGetAiGuardrailRuleList,
    fetchGetAiGuardrailViolationList,
    fetchGetAiPromptProtectionRuleList
  } from '@/api/ai-admin'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { formatLatencyMs } from '@/views/ai/request/helpers'
  import {
    buildJsonSummary,
    formatGuardrailTime,
    getGuardrailSeverityMeta,
    getPromptProtectionStatusMeta
  } from './helpers'
  import GuardrailConfigFormPanel from './modules/guardrail-config-form-panel.vue'
  import GuardrailRuleSearch from './modules/guardrail-rule-search.vue'
  import GuardrailViolationSearch from './modules/guardrail-violation-search.vue'
  import type {
    GuardrailConfigItem,
    GuardrailMetricDailyItem,
    GuardrailRuleItem,
    GuardrailRuleSearchFormModel,
    GuardrailViolationItem,
    GuardrailViolationSearchFormModel,
    PromptProtectionRuleItem
  } from './types'

  defineOptions({ name: 'AiGuardrail' })

  type GuardrailTab = 'config' | 'rule' | 'violation' | 'prompt' | 'metric'
  interface PageState<T> {
    content: T[]
    totalElements: number
    pageNumber: number
    pageSize: number
  }

  const createPageState = <T,>(): PageState<T> => ({
    content: [],
    totalElements: 0,
    pageNumber: 1,
    pageSize: 20
  })

  const activeTab = ref<GuardrailTab>('config')
  const configPanelVisible = ref(false)
  const configPanelMode = ref<'add' | 'edit'>('add')
  const currentConfigData = ref<GuardrailConfigItem | undefined>(undefined)
  const loading = reactive({
    config: false,
    rule: false,
    violation: false,
    prompt: false,
    metric: false
  })

  const showRuleSearch = ref(false)
  const showViolationSearch = ref(false)
  const configList = ref<GuardrailConfigItem[]>([])
  const rulePage = reactive<PageState<GuardrailRuleItem>>(createPageState())
  const violationPage = reactive<PageState<GuardrailViolationItem>>(createPageState())
  const promptRulePage = reactive<PageState<PromptProtectionRuleItem>>(createPageState())
  const metricDailyPage = reactive<PageState<GuardrailMetricDailyItem>>(createPageState())

  const ruleSearchForm = ref<GuardrailRuleSearchFormModel>({
    guardrailConfigId: undefined,
    organizationId: undefined,
    projectId: undefined,
    ruleCode: undefined,
    ruleName: undefined,
    phase: undefined,
    action: undefined,
    enabled: undefined,
    severity: undefined
  })

  const violationSearchForm = ref<GuardrailViolationSearchFormModel>({
    organizationId: undefined,
    projectId: undefined,
    userId: undefined,
    tokenId: undefined,
    serviceAccountId: undefined,
    ruleId: undefined,
    requestId: undefined,
    phase: undefined,
    category: undefined,
    actionTaken: undefined,
    createTimeRange: undefined
  })

  const loadConfigList = async () => {
    loading.config = true
    try {
      configList.value = await fetchGetAiGuardrailConfigList()
    } finally {
      loading.config = false
    }
  }

  const openConfigPanel = (mode: 'add' | 'edit', row?: GuardrailConfigItem) => {
    configPanelMode.value = mode
    currentConfigData.value = row
    configPanelVisible.value = true
  }

  const handleConfigMoreClick = (item: ButtonMoreItem, row: GuardrailConfigItem) => {
    switch (item.key) {
      case 'edit':
        openConfigPanel('edit', row)
        break
      case 'delete':
        ElMessageBox.confirm(`确定删除 Guardrail Config #${row.id} 吗？`, '删除 Config', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          await fetchDeleteAiGuardrailConfig(row.id)
          ElMessage.success('删除成功')
          await loadConfigList()
        })
        break
    }
  }

  const handleConfigSuccess = async () => {
    currentConfigData.value = undefined
    await loadConfigList()
  }

  const loadRuleList = async () => {
    loading.rule = true
    try {
      const page = await fetchGetAiGuardrailRuleList({
        page: rulePage.pageNumber,
        size: rulePage.pageSize,
        ...ruleSearchForm.value
      })
      Object.assign(rulePage, page)
    } finally {
      loading.rule = false
    }
  }

  const loadViolationList = async () => {
    loading.violation = true
    try {
      const { createTimeRange, ...filters } = violationSearchForm.value
      const [createTimeStart, createTimeEnd] = Array.isArray(createTimeRange)
        ? createTimeRange
        : [undefined, undefined]
      const page = await fetchGetAiGuardrailViolationList({
        page: violationPage.pageNumber,
        size: violationPage.pageSize,
        ...filters,
        createTimeStart,
        createTimeEnd
      })
      Object.assign(violationPage, page)
    } finally {
      loading.violation = false
    }
  }

  const loadPromptRuleList = async () => {
    loading.prompt = true
    try {
      const page = await fetchGetAiPromptProtectionRuleList({
        page: promptRulePage.pageNumber,
        size: promptRulePage.pageSize
      })
      Object.assign(promptRulePage, page)
    } finally {
      loading.prompt = false
    }
  }

  const loadMetricDailyList = async () => {
    loading.metric = true
    try {
      const page = await fetchGetAiGuardrailMetricDailyList({
        page: metricDailyPage.pageNumber,
        size: metricDailyPage.pageSize
      })
      Object.assign(metricDailyPage, page)
    } finally {
      loading.metric = false
    }
  }

  const handleTabChange = async (tab: string | number) => {
    switch (tab as GuardrailTab) {
      case 'config':
        await loadConfigList()
        break
      case 'rule':
        await loadRuleList()
        break
      case 'violation':
        await loadViolationList()
        break
      case 'prompt':
        await loadPromptRuleList()
        break
      case 'metric':
        await loadMetricDailyList()
        break
    }
  }

  const handleRuleSearch = async (params: GuardrailRuleSearchFormModel) => {
    ruleSearchForm.value = { ...params }
    rulePage.pageNumber = 1
    await loadRuleList()
  }

  const handleRuleReset = async () => {
    ruleSearchForm.value = {
      guardrailConfigId: undefined,
      organizationId: undefined,
      projectId: undefined,
      ruleCode: undefined,
      ruleName: undefined,
      phase: undefined,
      action: undefined,
      enabled: undefined,
      severity: undefined
    }
    rulePage.pageNumber = 1
    await loadRuleList()
  }

  const handleViolationSearch = async (params: GuardrailViolationSearchFormModel) => {
    violationSearchForm.value = { ...params }
    violationPage.pageNumber = 1
    await loadViolationList()
  }

  const handleViolationReset = async () => {
    violationSearchForm.value = {
      organizationId: undefined,
      projectId: undefined,
      userId: undefined,
      tokenId: undefined,
      serviceAccountId: undefined,
      ruleId: undefined,
      requestId: undefined,
      phase: undefined,
      category: undefined,
      actionTaken: undefined,
      createTimeRange: undefined
    }
    violationPage.pageNumber = 1
    await loadViolationList()
  }

  const handleRulePageChange = async (page: number) => {
    rulePage.pageNumber = page
    await loadRuleList()
  }
  const handleViolationPageChange = async (page: number) => {
    violationPage.pageNumber = page
    await loadViolationList()
  }
  const handlePromptPageChange = async (page: number) => {
    promptRulePage.pageNumber = page
    await loadPromptRuleList()
  }
  const handleMetricPageChange = async (page: number) => {
    metricDailyPage.pageNumber = page
    await loadMetricDailyList()
  }

  onMounted(async () => {
    await loadConfigList()
    await Promise.all([
      loadRuleList(),
      loadViolationList(),
      loadPromptRuleList(),
      loadMetricDailyList()
    ])
  })
</script>

<style scoped lang="scss">
  .guardrail-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .guardrail-overview-card {
    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .guardrail-overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .overview-item {
    padding: 14px 16px;
    background: linear-gradient(135deg, rgb(248 250 252), rgb(241 245 249));
    border: 1px solid var(--el-border-color-light);
    border-radius: 14px;
  }

  .overview-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .overview-value {
    margin-top: 6px;
    font-size: 24px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .guardrail-tabs-card {
    flex: 1;
  }

  .tab-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .table-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .cell-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cell-main {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .cell-sub {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    word-break: break-all;
  }
</style>
