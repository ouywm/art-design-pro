<template>
  <div class="art-full-height">
    <RequestSearch
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

    <RequestDetailDialog v-model="detailVisible" :request-id="currentRequestId" />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { fetchGetAiRequestList } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { ElTag } from 'element-plus'
  import {
    buildRequestModelMeta,
    formatLatencyMs,
    formatRequestTime,
    getRequestStatusMeta
  } from './helpers'
  import RequestDetailDialog from './modules/request-detail-dialog.vue'
  import RequestSearch from './modules/request-search.vue'
  import type { RequestListItem, RequestSearchFormModel } from './types'

  defineOptions({ name: 'AiRequest' })

  const createDefaultSearchForm = (): RequestSearchFormModel => ({
    requestId: undefined,
    userId: undefined,
    channelGroup: undefined,
    sourceType: undefined,
    endpoint: undefined,
    requestFormat: undefined,
    requestedModel: undefined,
    upstreamModel: undefined,
    status: undefined,
    isStream: undefined,
    responseStatusCode: undefined,
    createTimeRange: undefined
  })

  const searchForm = ref<RequestSearchFormModel>(createDefaultSearchForm())
  const showSearchBar = ref(false)
  const detailVisible = ref(false)
  const currentRequestId = ref<number>()

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
      apiFn: fetchGetAiRequestList,
      apiParams: {
        page: 1,
        size: 20
      },
      excludeParams: ['createTimeRange'],
      columnsFactory: () => [
        {
          prop: 'requestId',
          label: '请求信息',
          minWidth: 280,
          showOverflowTooltip: true,
          formatter: (row: RequestListItem) =>
            h(
              'div',
              {
                class: 'request-id-link',
                onClick: () => showDetail(row)
              },
              row.requestId
            )
        },
        {
          prop: 'requestedModel',
          label: '模型映射',
          minWidth: 200,
          showOverflowTooltip: false,
          formatter: (row: RequestListItem) => {
            const modelMeta = buildRequestModelMeta(row.requestedModel, row.upstreamModel)

            if (!modelMeta.secondary) {
              return h('div', { class: 'request-model-main' }, modelMeta.primary)
            }

            return h('div', { class: 'request-info-cell' }, [
              h('div', { class: 'request-model-main' }, modelMeta.primary),
              h('div', { class: 'request-info-subtext' }, modelMeta.secondary)
            ])
          }
        },
        {
          prop: 'userId',
          label: '用户 ID',
          width: 100
        },
        {
          prop: 'channelGroup',
          label: '渠道分组',
          minWidth: 130
        },
        {
          prop: 'endpoint',
          label: 'Endpoint',
          minWidth: 170,
          showOverflowTooltip: true
        },
        {
          prop: 'sourceType',
          label: '来源',
          width: 100
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: RequestListItem) =>
            h(
              ElTag,
              { type: getRequestStatusMeta(row.status).type, size: 'small' },
              () => getRequestStatusMeta(row.status).text
            )
        },
        {
          prop: 'isStream',
          label: '流式',
          width: 90,
          formatter: (row: RequestListItem) =>
            h(ElTag, { type: row.isStream ? 'success' : 'info', size: 'small' }, () =>
              row.isStream ? '流式' : '非流式'
            )
        },
        {
          prop: 'responseStatusCode',
          label: '响应码',
          width: 90
        },
        {
          prop: 'durationMs',
          label: '总耗时',
          width: 110,
          formatter: (row: RequestListItem) => formatLatencyMs(row.durationMs)
        },
        {
          prop: 'firstTokenMs',
          label: '首 Token',
          width: 110,
          formatter: (row: RequestListItem) => formatLatencyMs(row.firstTokenMs)
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 170,
          formatter: (row: RequestListItem) => formatRequestTime(row.createTime)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: RequestListItem) =>
            h(ArtButtonTable, {
              type: 'view',
              onClick: () => showDetail(row)
            })
        }
      ]
    }
  })

  const handleSearch = (params: RequestSearchFormModel) => {
    const { createTimeRange, ...filters } = params
    const [createTimeStart, createTimeEnd] = Array.isArray(createTimeRange)
      ? createTimeRange
      : [undefined, undefined]

    Object.assign(searchParams, filters, {
      createTimeStart,
      createTimeEnd
    })
    getData()
  }

  const showDetail = (row: RequestListItem) => {
    currentRequestId.value = row.id
    detailVisible.value = true
  }
</script>

<style scoped lang="scss">
  .request-id-link {
    font-weight: 600;
    line-height: 1.4;
    color: var(--el-color-primary);
    cursor: pointer;
  }

  .request-info-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    justify-content: center;
    min-height: 42px;
  }

  .request-info-subtext {
    font-size: 12px;
    line-height: 1.35;
    color: var(--el-text-color-secondary);
    word-break: break-word;
  }

  .request-model-main {
    font-weight: 500;
    line-height: 1.4;
  }
</style>
