<template>
  <div class="art-full-height">
    <RetryAttemptSearch
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

    <RetryAttemptDetailDialog v-model="detailVisible" :retry-attempt-id="currentRetryAttemptId" />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { fetchGetAiRetryAttemptList } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { ElTag } from 'element-plus'
  import {
    formatBackoffSeconds,
    formatRetryAttemptTime,
    getRetryAttemptStatusMeta
  } from './helpers'
  import RetryAttemptDetailDialog from './modules/retry-attempt-detail-dialog.vue'
  import RetryAttemptSearch from './modules/retry-attempt-search.vue'
  import type { RetryAttemptListItem, RetryAttemptSearchFormModel } from './types'

  defineOptions({ name: 'AiRetryAttempt' })

  const createDefaultSearchForm = (): RetryAttemptSearchFormModel => ({
    domainCode: undefined,
    taskType: undefined,
    referenceId: undefined,
    requestId: undefined,
    attemptNo: undefined,
    status: undefined,
    nextRetryAtRange: undefined,
    createTimeRange: undefined
  })

  const searchForm = ref<RetryAttemptSearchFormModel>(createDefaultSearchForm())
  const showSearchBar = ref(false)
  const detailVisible = ref(false)
  const currentRetryAttemptId = ref<number>()

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
      apiFn: fetchGetAiRetryAttemptList,
      apiParams: {
        page: 1,
        size: 20
      },
      excludeParams: ['nextRetryAtRange', 'createTimeRange'],
      columnsFactory: () => [
        {
          prop: 'requestId',
          label: '请求 ID',
          minWidth: 240,
          showOverflowTooltip: true,
          formatter: (row: RetryAttemptListItem) =>
            h(
              'div',
              {
                class: 'retry-id-link',
                onClick: () => showDetail(row)
              },
              row.requestId
            )
        },
        {
          prop: 'referenceId',
          label: 'Reference ID',
          minWidth: 220,
          showOverflowTooltip: true
        },
        {
          prop: 'domainCode',
          label: '域编码',
          minWidth: 140
        },
        {
          prop: 'taskType',
          label: '任务类型',
          minWidth: 140
        },
        {
          prop: 'attemptNo',
          label: '重试次数',
          width: 100
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: RetryAttemptListItem) =>
            h(
              ElTag,
              { type: getRetryAttemptStatusMeta(row.status).type, size: 'small' },
              () => getRetryAttemptStatusMeta(row.status).text
            )
        },
        {
          prop: 'backoffSeconds',
          label: '退避时间',
          width: 100,
          formatter: (row: RetryAttemptListItem) => formatBackoffSeconds(row.backoffSeconds)
        },
        {
          prop: 'nextRetryAt',
          label: '下次重试',
          width: 170,
          formatter: (row: RetryAttemptListItem) => formatRetryAttemptTime(row.nextRetryAt)
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 170,
          formatter: (row: RetryAttemptListItem) => formatRetryAttemptTime(row.createTime)
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: 170,
          formatter: (row: RetryAttemptListItem) => formatRetryAttemptTime(row.updateTime)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: RetryAttemptListItem) =>
            h(ArtButtonTable, {
              type: 'view',
              onClick: () => showDetail(row)
            })
        }
      ]
    }
  })

  const handleSearch = (params: RetryAttemptSearchFormModel) => {
    const { nextRetryAtRange, createTimeRange, ...filters } = params
    const [nextRetryAtStart, nextRetryAtEnd] = Array.isArray(nextRetryAtRange)
      ? nextRetryAtRange
      : [undefined, undefined]
    const [createTimeStart, createTimeEnd] = Array.isArray(createTimeRange)
      ? createTimeRange
      : [undefined, undefined]

    Object.assign(searchParams, filters, {
      nextRetryAtStart,
      nextRetryAtEnd,
      createTimeStart,
      createTimeEnd
    })
    getData()
  }

  const showDetail = (row: RetryAttemptListItem) => {
    currentRetryAttemptId.value = row.id
    detailVisible.value = true
  }
</script>

<style scoped lang="scss">
  .retry-id-link {
    font-weight: 600;
    line-height: 1.4;
    color: var(--el-color-primary);
    cursor: pointer;
  }
</style>
