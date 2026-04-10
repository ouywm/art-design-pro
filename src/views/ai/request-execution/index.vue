<template>
  <div class="art-full-height">
    <RequestExecutionSearch
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

    <RequestExecutionDetailDialog v-model="detailVisible" :execution-id="currentExecutionId" />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { fetchGetAiRequestExecutionList } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { ElTag } from 'element-plus'
  import { formatLatencyMs, getExecutionStatusMeta } from '@/views/ai/request/helpers'
  import RequestExecutionDetailDialog from './modules/request-execution-detail-dialog.vue'
  import RequestExecutionSearch from './modules/request-execution-search.vue'
  import type { RequestExecutionListItem, RequestExecutionSearchFormModel } from './types'

  defineOptions({ name: 'AiRequestExecution' })

  const createDefaultSearchForm = (): RequestExecutionSearchFormModel => ({
    aiRequestId: undefined,
    requestId: undefined,
    channelId: undefined,
    accountId: undefined,
    endpoint: undefined,
    requestFormat: undefined,
    requestedModel: undefined,
    upstreamModel: undefined,
    status: undefined,
    responseStatusCode: undefined,
    startedAtRange: undefined
  })

  const searchForm = ref<RequestExecutionSearchFormModel>(createDefaultSearchForm())
  const showSearchBar = ref(false)
  const detailVisible = ref(false)
  const currentExecutionId = ref<number>()

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
      apiFn: fetchGetAiRequestExecutionList,
      apiParams: {
        page: 1,
        size: 20
      },
      excludeParams: ['startedAtRange'],
      columnsFactory: () => [
        {
          prop: 'requestId',
          label: '执行信息',
          minWidth: 220,
          showOverflowTooltip: false,
          formatter: (row: RequestExecutionListItem) =>
            h('div', { class: 'execution-info-cell' }, [
              h(
                'div',
                {
                  class: 'execution-id-link',
                  onClick: () => showDetail(row)
                },
                row.requestId
              ),
              h('div', { class: 'execution-info-subtext' }, `Attempt #${row.attemptNo}`)
            ])
        },
        {
          prop: 'channelId',
          label: '命中资源',
          minWidth: 150,
          showOverflowTooltip: false,
          formatter: (row: RequestExecutionListItem) =>
            h('div', { class: 'execution-info-cell' }, [
              h('div', null, `Channel #${row.channelId}`),
              h('div', { class: 'execution-info-subtext' }, `Account #${row.accountId}`)
            ])
        },
        {
          prop: 'requestedModel',
          label: '模型映射',
          minWidth: 220,
          showOverflowTooltip: false,
          formatter: (row: RequestExecutionListItem) =>
            h('div', { class: 'execution-info-cell' }, [
              h('div', { class: 'execution-model-main' }, row.requestedModel || '-'),
              h('div', { class: 'execution-info-subtext' }, row.upstreamModel || '-')
            ])
        },
        {
          prop: 'endpoint',
          label: 'Endpoint',
          minWidth: 150
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: RequestExecutionListItem) =>
            h(
              ElTag,
              { type: getExecutionStatusMeta(row.status).type, size: 'small' },
              () => getExecutionStatusMeta(row.status).text
            )
        },
        {
          prop: 'responseStatusCode',
          label: '响应码',
          width: 90
        },
        {
          prop: 'upstreamRequestId',
          label: '上游请求 ID',
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'durationMs',
          label: '总耗时',
          width: 110,
          formatter: (row: RequestExecutionListItem) => formatLatencyMs(row.durationMs)
        },
        {
          prop: 'firstTokenMs',
          label: '首 Token',
          width: 110,
          formatter: (row: RequestExecutionListItem) => formatLatencyMs(row.firstTokenMs)
        },
        {
          prop: 'startedAt',
          label: '开始时间',
          width: 180
        },
        {
          prop: 'finishedAt',
          label: '结束时间',
          width: 180,
          formatter: (row: RequestExecutionListItem) => row.finishedAt || '-'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: RequestExecutionListItem) =>
            h(ArtButtonTable, {
              type: 'view',
              onClick: () => showDetail(row)
            })
        }
      ]
    }
  })

  const handleSearch = (params: RequestExecutionSearchFormModel) => {
    const { startedAtRange, ...filters } = params
    const [startedAtStart, startedAtEnd] = Array.isArray(startedAtRange)
      ? startedAtRange
      : [undefined, undefined]

    Object.assign(searchParams, filters, {
      startedAtStart,
      startedAtEnd
    })
    getData()
  }

  const showDetail = (row: RequestExecutionListItem) => {
    currentExecutionId.value = row.id
    detailVisible.value = true
  }
</script>

<style scoped lang="scss">
  .execution-info-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    justify-content: center;
    min-height: 42px;
  }

  .execution-id-link {
    font-weight: 600;
    color: var(--el-color-primary);
    word-break: break-all;
    cursor: pointer;
  }

  .execution-info-subtext {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    word-break: break-all;
  }

  .execution-model-main {
    font-weight: 500;
    word-break: break-all;
  }
</style>
