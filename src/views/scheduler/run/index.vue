<template>
  <div class="scheduler-run-page art-full-height">
    <RunSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card scheduler-run-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElCheckbox v-model="autoRefresh">每 10 秒自动刷新</ElCheckbox>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <RunDetailDialog v-model:visible="detailVisible" :run-id="currentRunId" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useIntervalFn } from '@vueuse/core'
  import { fetchGetRunList } from '@/api/scheduler-run'
  import { useTable } from '@/hooks/core/useTable'
  import { ElTag } from 'element-plus'
  import {
    getRunStateLabel,
    getRunStateTagType,
    getTriggerTypeLabel,
    getTriggerTypeTagType
  } from '../constants'
  import RunSearch from './modules/run-search.vue'
  import RunDetailDialog from './modules/run-detail-dialog.vue'
  import type { RunListItem, SearchFormModel } from './types'

  defineOptions({ name: 'SchedulerRun' })

  const detailVisible = ref(false)
  const currentRunId = ref<number>()
  const autoRefresh = ref(false)

  const searchForm = ref<SearchFormModel>({
    jobId: undefined,
    traceId: undefined,
    triggerType: undefined,
    state: undefined,
    dateRange: null
  })

  const flattenSearch = (params: SearchFormModel) => {
    const { dateRange, ...rest } = params
    return {
      ...rest,
      startTime: dateRange?.[0] || undefined,
      endTime: dateRange?.[1] || undefined
    }
  }

  const formatRunTime = (row: RunListItem) => {
    return row.finishedAt || row.startedAt || row.scheduledAt
  }

  const truncateTraceId = (traceId: string) => {
    if (!traceId) return '-'
    return traceId.length > 12 ? `${traceId.slice(0, 8)}…` : traceId
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    replaceSearchParams,
    resetSearchParams
  } = useTable({
    core: {
      apiFn: fetchGetRunList,
      apiParams: {
        page: 1,
        size: 20,
        ...flattenSearch(searchForm.value)
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'jobId',
          label: '任务',
          width: 120,
          formatter: (row) => `#${row.jobId}`
        },
        {
          prop: 'state',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getRunStateTagType(row.state), size: 'small' }, () =>
              getRunStateLabel(row.state)
            )
        },
        {
          prop: 'triggerType',
          label: '触发来源',
          width: 110,
          formatter: (row) =>
            h(ElTag, { type: getTriggerTypeTagType(row.triggerType), size: 'small' }, () =>
              getTriggerTypeLabel(row.triggerType)
            )
        },
        {
          prop: 'scheduledAt',
          label: '时间',
          minWidth: 180,
          formatter: (row) => formatRunTime(row)
        },
        {
          prop: 'traceId',
          label: 'Trace',
          width: 130,
          formatter: (row) =>
            h('span', { class: 'run-trace', title: row.traceId }, truncateTraceId(row.traceId))
        },
        {
          prop: 'retryCount',
          label: '重试',
          width: 70,
          formatter: (row) => (row.retryCount > 0 ? `#${row.retryCount}` : '-')
        },
        {
          prop: 'operation',
          label: '操作',
          width: 90,
          fixed: 'right',
          formatter: (row) =>
            h(
              'a',
              {
                class: 'run-link',
                onClick: (e: Event) => {
                  e.preventDefault()
                  showDetail(row)
                }
              },
              '查看详情'
            )
        }
      ]
    }
  })

  const handleSearch = (params: SearchFormModel) => {
    // 把 dateRange 拍平为 startTime/endTime,且不发 dateRange 字段
    replaceSearchParams(flattenSearch(params))
    getData()
  }

  const handleReset = () => {
    Object.assign(searchForm.value, {
      jobId: undefined,
      traceId: undefined,
      triggerType: undefined,
      state: undefined,
      dateRange: null
    })
    resetSearchParams()
  }

  const showDetail = (row: RunListItem) => {
    currentRunId.value = row.id
    detailVisible.value = true
  }

  const { pause, resume } = useIntervalFn(refreshData, 10_000, {
    immediate: false,
    immediateCallback: false
  })

  watch(autoRefresh, (v) => {
    if (v) resume()
    else pause()
  })

  onMounted(() => {
    getData()
  })

  onUnmounted(() => {
    pause()
  })
</script>

<style scoped lang="scss">
  .scheduler-run-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .scheduler-run-page-card {
    flex: 1;
  }

  :deep(.run-trace) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 12px;
    color: var(--art-text-gray-500);
  }

  :deep(.run-link) {
    color: var(--el-color-primary);
    cursor: pointer;
  }
</style>
