<template>
  <div class="scheduler-run-page art-full-height">
    <RunSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard
      class="art-table-card scheduler-run-page-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElTag v-if="searchForm.jobId" type="primary">任务 #{{ searchForm.jobId }}</ElTag>
            <ElText v-else type="info">请输入任务 ID 查询执行记录</ElText>
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

      <RunDetailDialog v-model:visible="detailVisible" :run-data="currentRunData" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import { fetchGetRunList } from '@/api/scheduler-run'
  import { useTable } from '@/hooks/core/useTable'
  import { ElTag } from 'element-plus'
  import { getTaskStatusLabel, getTaskStatusTagType } from '../constants'
  import RunSearch from './modules/run-search.vue'
  import RunDetailDialog from './modules/run-detail-dialog.vue'
  import type { RunListItem, SearchFormModel } from './types'

  defineOptions({ name: 'SchedulerRun' })

  const route = useRoute()
  const detailVisible = ref(false)
  const currentRunData = ref<RunListItem>()
  const showSearchBar = ref(false)

  const parseJobId = (value: unknown) => {
    const raw = Array.isArray(value) ? value[0] : value
    const parsed = Number(raw)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
  }

  const searchForm = ref<SearchFormModel>({
    jobId: parseJobId(route.query.jobId)
  })

  const formatEmpty = (value: unknown) => {
    if (value === undefined || value === null || value === '') return '-'
    return String(value)
  }

  const formatMillis = (value: number | null | undefined) => {
    if (!value) return '-'
    return new Date(value).toLocaleString()
  }

  const formatDuration = (value: number | null | undefined) => {
    if (value === undefined || value === null || value < 0) return '-'
    if (value < 1000) return `${value} ms`
    if (value < 60_000) return `${(value / 1000).toFixed(2)} s`
    if (value < 3_600_000) return `${(value / 60_000).toFixed(1)} min`
    return `${(value / 3_600_000).toFixed(2)} h`
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
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'taskId',
          label: '任务记录 ID',
          minWidth: 130,
          formatter: (row) => h('span', { class: 'run-log-no' }, `#${row.taskId}`)
        },
        { prop: 'jobId', label: '任务 ID', width: 100 },
        {
          prop: 'status',
          label: '状态',
          width: 110,
          formatter: (row) =>
            h(ElTag, { type: getTaskStatusTagType(row.status), size: 'small' }, () =>
              getTaskStatusLabel(row.status)
            )
        },
        {
          prop: 'instanceAddr',
          label: '执行器',
          minWidth: 170,
          formatter: (row) => h('span', { class: 'run-handler' }, formatEmpty(row.instanceAddr))
        },
        {
          prop: 'triggerTime',
          label: '触发时间',
          minWidth: 170,
          formatter: (row) => formatMillis(row.triggerTime)
        },
        {
          prop: 'finishTime',
          label: '完成时间',
          minWidth: 170,
          formatter: (row) => formatMillis(row.finishTime)
        },
        {
          prop: 'executionTime',
          label: '执行耗时',
          width: 120,
          formatter: (row) => formatDuration(row.executionTime)
        },
        { prop: 'tryTimes', label: '尝试次数', width: 100 },
        { prop: 'retryCount', label: '重试次数', width: 100 },
        {
          prop: 'triggerFrom',
          label: '触发来源',
          minWidth: 130,
          formatter: (row) => formatEmpty(row.triggerFrom)
        },
        {
          prop: 'triggerMessage',
          label: '触发消息',
          minWidth: 180,
          showOverflowTooltip: true,
          formatter: (row) => formatEmpty(row.triggerMessage)
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
                onClick: (event: Event) => {
                  event.preventDefault()
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
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    searchForm.value.jobId = undefined
    resetSearchParams()
  }

  const showDetail = (row: RunListItem) => {
    currentRunData.value = row
    detailVisible.value = true
  }

  watch(
    () => route.query.jobId,
    (jobId) => {
      const parsed = parseJobId(jobId)
      if (parsed === searchForm.value.jobId) return
      searchForm.value.jobId = parsed
      replaceSearchParams(searchForm.value)
      getData()
    }
  )

  onMounted(() => {
    getData()
  })
</script>

<style scoped lang="scss">
  .scheduler-run-page {
    display: flex;
    flex-direction: column;
  }

  .scheduler-run-page-card {
    flex: 1;
  }

  :deep(.run-log-no),
  :deep(.run-handler) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 12px;
    color: var(--art-text-gray-500);
  }

  :deep(.run-link) {
    color: var(--el-color-primary);
    cursor: pointer;
  }
</style>
