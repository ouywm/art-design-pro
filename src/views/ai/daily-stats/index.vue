<template>
  <div class="art-full-height">
    <DailyStatsSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" :style="{ 'margin-top': showSearchBar ? '12px' : '0' }">
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      />

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
  import { fetchGetAiDailyStatsList } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { formatLatencyMs } from '@/views/ai/request/helpers'
  import { formatCostTotal, formatStatsDate, formatTokenCount } from './helpers'
  import DailyStatsSearch from './modules/daily-stats-search.vue'
  import type { DailyStatsListItem, DailyStatsSearchFormModel } from './types'

  defineOptions({ name: 'AiDailyStats' })

  const createDefaultSearchForm = (): DailyStatsSearchFormModel => ({
    statsDateRange: undefined,
    userId: undefined,
    projectId: undefined,
    channelId: undefined,
    accountId: undefined,
    modelName: undefined
  })

  const searchForm = ref<DailyStatsSearchFormModel>(createDefaultSearchForm())
  const showSearchBar = ref(false)

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetAiDailyStatsList,
      apiParams: {
        page: 1,
        size: 20
      },
      excludeParams: ['statsDateRange'],
      columnsFactory: () => [
        {
          prop: 'statsDate',
          label: '统计日期',
          width: 120,
          formatter: (row: DailyStatsListItem) => formatStatsDate(row.statsDate)
        },
        {
          prop: 'modelName',
          label: '模型名称',
          minWidth: 180
        },
        {
          prop: 'userId',
          label: '用户 ID',
          width: 90
        },
        {
          prop: 'projectId',
          label: '项目 ID',
          width: 90
        },
        {
          prop: 'channelId',
          label: '渠道 ID',
          width: 90
        },
        {
          prop: 'accountId',
          label: '账号 ID',
          width: 90
        },
        {
          prop: 'requestCount',
          label: '请求数',
          width: 100,
          formatter: (row: DailyStatsListItem) => formatTokenCount(row.requestCount)
        },
        {
          prop: 'successCount',
          label: '成功数',
          width: 100,
          formatter: (row: DailyStatsListItem) => formatTokenCount(row.successCount)
        },
        {
          prop: 'failCount',
          label: '失败数',
          width: 100,
          formatter: (row: DailyStatsListItem) => formatTokenCount(row.failCount)
        },
        {
          prop: 'totalTokens',
          label: '总 Tokens',
          width: 120,
          formatter: (row: DailyStatsListItem) => formatTokenCount(row.totalTokens)
        },
        {
          prop: 'promptTokens',
          label: '输入 Tokens',
          width: 120,
          formatter: (row: DailyStatsListItem) => formatTokenCount(row.promptTokens)
        },
        {
          prop: 'completionTokens',
          label: '输出 Tokens',
          width: 120,
          formatter: (row: DailyStatsListItem) => formatTokenCount(row.completionTokens)
        },
        {
          prop: 'cachedTokens',
          label: '缓存 Tokens',
          width: 120,
          formatter: (row: DailyStatsListItem) => formatTokenCount(row.cachedTokens)
        },
        {
          prop: 'reasoningTokens',
          label: '推理 Tokens',
          width: 120,
          formatter: (row: DailyStatsListItem) => formatTokenCount(row.reasoningTokens)
        },
        {
          prop: 'quota',
          label: 'Quota',
          width: 110,
          formatter: (row: DailyStatsListItem) => formatTokenCount(row.quota)
        },
        {
          prop: 'costTotal',
          label: '成本',
          width: 110,
          formatter: (row: DailyStatsListItem) => formatCostTotal(row.costTotal)
        },
        {
          prop: 'avgElapsedTime',
          label: '平均耗时',
          width: 110,
          formatter: (row: DailyStatsListItem) => formatLatencyMs(row.avgElapsedTime)
        },
        {
          prop: 'avgFirstTokenTime',
          label: '平均首 Token',
          width: 120,
          formatter: (row: DailyStatsListItem) => formatLatencyMs(row.avgFirstTokenTime)
        },
        {
          prop: 'createTime',
          label: '记录时间',
          width: 170
        }
      ]
    }
  })

  const handleSearch = (params: DailyStatsSearchFormModel) => {
    const { statsDateRange, ...filters } = params
    const [statsDateStart, statsDateEnd] = Array.isArray(statsDateRange)
      ? statsDateRange
      : [undefined, undefined]

    Object.assign(searchParams, filters, {
      statsDateStart,
      statsDateEnd
    })
    getData()
  }
</script>
