<template>
  <div class="daily-stats-page art-full-height">
    <DailyStatsSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <div class="daily-stats-page__summary">
      <div
        v-for="item in summaryCards"
        :key="item.label"
        class="daily-stats-page__summary-card"
        :class="`is-${item.type}`"
      >
        <span class="label">{{ item.label }}</span>
        <strong class="value">{{ item.value }}</strong>
        <span class="helper">{{ item.helper }}</span>
      </div>
    </div>

    <ElRow :gutter="16">
      <ElCol :xs="24" :xl="12">
        <ElCard class="daily-stats-page__chart-card" shadow="never">
          <div class="daily-stats-page__chart-header">
            <div>
              <h3>渠道分布</h3>
              <p>按请求量与失败量查看前 8 个渠道</p>
            </div>
          </div>
          <ArtBarChart
            height="20rem"
            :loading="dashboardLoading"
            :data="channelChartData.barData"
            :xAxisData="channelChartData.xAxisData"
            :showLegend="true"
            barWidth="30%"
          />
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :xl="12">
        <ElCard class="daily-stats-page__chart-card" shadow="never">
          <div class="daily-stats-page__chart-header">
            <div>
              <h3>模型分布</h3>
              <p>按总 Token 与配额查看前 8 个模型</p>
            </div>
          </div>
          <ArtLineChart
            height="20rem"
            :loading="dashboardLoading"
            :data="modelChartData.lineData"
            :xAxisData="modelChartData.xAxisData"
            :showLegend="true"
            :showAreaColor="true"
            :showAxisLine="false"
          />
        </ElCard>
      </ElCol>
    </ElRow>

    <ElCard class="art-table-card daily-stats-page__table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshAllData" />

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import {
    fetchGetDailyStatsDashboard,
    fetchGetDailyStatsList,
    fetchGetDailyStatsSummary
  } from '@/api/ai-daily-stats'
  import { useTable } from '@/hooks/core/useTable'
  import DailyStatsSearch from './modules/daily-stats-search.vue'
  import {
    DEFAULT_SUMMARY,
    buildChannelChartData,
    buildModelChartData,
    buildSummaryCards,
    formatCompactNumber,
    formatCost,
    formatRatio
  } from './constants'
  import type { DashboardOverviewData, DailyStatsSummaryData, SearchFormModel } from './types'

  defineOptions({ name: 'AiDailyStats' })

  const createDefaultSearchForm = (): SearchFormModel => ({
    statsDateRange: undefined,
    userId: undefined,
    projectId: undefined,
    channelId: undefined,
    accountId: undefined,
    modelName: undefined
  })

  const searchForm = ref<SearchFormModel>(createDefaultSearchForm())

  const summary = ref<DailyStatsSummaryData>({ ...DEFAULT_SUMMARY })
  const dashboardLoading = ref(false)
  const dashboardData = ref<DashboardOverviewData>({
    summary: { ...DEFAULT_SUMMARY },
    byChannel: [],
    byModel: []
  })

  const summaryCards = computed(() => buildSummaryCards(summary.value))
  const channelChartData = computed(() => buildChannelChartData(dashboardData.value.byChannel))
  const modelChartData = computed(() => buildModelChartData(dashboardData.value.byModel))

  const toQueryFilters = (params: SearchFormModel): Api.AiManage.DailyStatsQueryFilters => {
    const { statsDateRange, ...filters } = params
    const [startDate, endDate] = Array.isArray(statsDateRange)
      ? statsDateRange
      : [undefined, undefined]

    return {
      ...filters,
      startDate,
      endDate
    }
  }

  const loadSummary = async (params: SearchFormModel) => {
    summary.value = await fetchGetDailyStatsSummary(toQueryFilters(params))
  }

  const loadDashboard = async (params: SearchFormModel) => {
    const { statsDateRange } = params
    const [startDate, endDate] = Array.isArray(statsDateRange)
      ? statsDateRange
      : [undefined, undefined]

    dashboardLoading.value = true
    try {
      dashboardData.value = await fetchGetDailyStatsDashboard({
        startDate,
        endDate
      })
    } finally {
      dashboardLoading.value = false
    }
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetDailyStatsList,
      apiParams: {
        page: 1,
        size: 20,
        ...toQueryFilters(searchForm.value)
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'statsDate',
          label: '统计日期',
          width: 120
        },
        {
          prop: 'scope',
          label: '统计维度',
          minWidth: 240,
          formatter: (row) =>
            h('div', { class: 'daily-stats-page__scope-cell' }, [
              h('div', { class: 'daily-stats-page__scope-primary' }, row.modelName || '-'),
              h(
                'div',
                { class: 'daily-stats-page__scope-meta' },
                `用户 #${row.userId || 0} / 项目 #${row.projectId || 0} / 渠道 #${row.channelId || 0} / 账号 #${row.accountId || 0}`
              )
            ])
        },
        {
          prop: 'requestCount',
          label: '请求概览',
          minWidth: 180,
          formatter: (row) =>
            h('div', { class: 'daily-stats-page__metric-stack' }, [
              h('div', `总 ${formatCompactNumber(row.requestCount)}`),
              h(
                'div',
                { class: 'daily-stats-page__metric-sub' },
                `成功 ${formatCompactNumber(row.successCount)} / 失败 ${formatCompactNumber(row.failCount)}`
              )
            ])
        },
        {
          prop: 'totalTokens',
          label: 'Token',
          minWidth: 190,
          formatter: (row) =>
            h('div', { class: 'daily-stats-page__metric-stack' }, [
              h('div', `总 ${formatCompactNumber(row.totalTokens)}`),
              h(
                'div',
                { class: 'daily-stats-page__metric-sub' },
                `输入 ${formatCompactNumber(row.promptTokens)} / 输出 ${formatCompactNumber(row.completionTokens)}`
              )
            ])
        },
        {
          prop: 'quota',
          label: '配额与成本',
          minWidth: 180,
          formatter: (row) =>
            h('div', { class: 'daily-stats-page__metric-stack' }, [
              h('div', `配额 ${formatCompactNumber(row.quota)}`),
              h(
                'div',
                { class: 'daily-stats-page__metric-sub' },
                `成本 ${formatCost(row.costTotal)}`
              )
            ])
        },
        {
          prop: 'performance',
          label: '性能',
          minWidth: 180,
          formatter: (row) =>
            h('div', { class: 'daily-stats-page__metric-stack' }, [
              h('div', `均耗时 ${formatCompactNumber(row.avgElapsedTime)} ms`),
              h(
                'div',
                { class: 'daily-stats-page__metric-sub' },
                `首 Token ${formatCompactNumber(row.avgFirstTokenTime)} ms`
              )
            ])
        },
        {
          prop: 'cache',
          label: '缓存/推理',
          minWidth: 170,
          formatter: (row) =>
            h('div', { class: 'daily-stats-page__metric-stack' }, [
              h('div', `缓存 ${formatCompactNumber(row.cachedTokens)}`),
              h(
                'div',
                { class: 'daily-stats-page__metric-sub' },
                `推理 ${formatCompactNumber(row.reasoningTokens)}`
              )
            ])
        },
        {
          prop: 'successRate',
          label: '成功率',
          width: 110,
          formatter: (row) => formatRatio(row.successCount, row.requestCount)
        },
        {
          prop: 'createTime',
          label: '生成时间',
          minWidth: 170
        }
      ]
    }
  })

  const syncOverview = async (params: SearchFormModel) => {
    await Promise.all([loadSummary(params), loadDashboard(params)])
  }

  const refreshAllData = async () => {
    await Promise.all([refreshData(), syncOverview(searchForm.value)])
  }

  const handleSearch = async (params: SearchFormModel) => {
    const filters = toQueryFilters(params)
    replaceSearchParams(filters)
    await Promise.all([getData(), syncOverview(params)])
  }

  const handleReset = async () => {
    searchForm.value = createDefaultSearchForm()
    await Promise.all([resetSearchParams(), syncOverview(searchForm.value)])
  }

  onMounted(async () => {
    await Promise.all([getData(), syncOverview(searchForm.value)])
  })
</script>

<style scoped lang="scss">
  .daily-stats-page {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &__summary {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 12px;
    }

    &__summary-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 16px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;

      .label {
        font-size: 12px;
        color: var(--art-text-gray-500);
      }

      .value {
        font-size: 24px;
        line-height: 1.2;
        color: var(--art-text-gray-900);
      }

      .helper {
        font-size: 12px;
        line-height: 1.4;
        color: var(--art-text-gray-500);
      }

      &.is-primary {
        border-color: rgba(var(--el-color-primary-rgb), 0.25);
      }

      &.is-success {
        border-color: rgba(var(--el-color-success-rgb), 0.25);
      }

      &.is-warning {
        border-color: rgba(var(--el-color-warning-rgb), 0.25);
      }

      &.is-danger {
        border-color: rgba(var(--el-color-danger-rgb), 0.25);
      }

      &.is-info {
        border-color: rgba(var(--el-color-info-rgb), 0.25);
      }
    }

    &__chart-card,
    &__table-card {
      height: 100%;
    }

    &__chart-header {
      margin-bottom: 8px;

      h3 {
        margin: 0;
        font-size: 16px;
        line-height: 1.3;
        color: var(--art-text-gray-900);
      }

      p {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--art-text-gray-500);
      }
    }

    &__scope-cell,
    &__metric-stack {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &__scope-primary {
      font-weight: 600;
      line-height: 1.2;
      color: var(--art-text-gray-900);
    }

    &__scope-meta,
    &__metric-sub {
      font-size: 12px;
      line-height: 1.4;
      color: var(--art-text-gray-500);
    }
  }

  @media (width <= 1440px) {
    .daily-stats-page__summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (width <= 768px) {
    .daily-stats-page__summary {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }
</style>
