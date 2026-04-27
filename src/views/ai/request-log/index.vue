<template>
  <div class="request-log-page art-full-height">
    <RequestLogSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card request-log-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <RequestLogDetailDialog v-model:visible="detailVisible" :request-id="currentRequestId" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import { fetchGetRequestLogList } from '@/api/ai-request-log'
  import { useTable } from '@/hooks/core/useTable'
  import { ElTag } from 'element-plus'
  import {
    getRequestLogStatusLabel,
    getRequestLogStatusTagType,
    getRequestLogTypeLabel,
    getRequestLogTypeTagType,
    getRequestStatusLabel,
    getRequestStatusTagType
  } from './constants'
  import RequestLogDetailDialog from './modules/request-log-detail-dialog.vue'
  import RequestLogSearch from './modules/request-log-search.vue'
  import type { RequestLogListItem, SearchFormModel } from './types'

  defineOptions({ name: 'AiRequestLog' })

  const detailVisible = ref(false)
  const currentRequestId = ref<string>()

  const searchForm = ref<SearchFormModel>({
    keyword: undefined,
    requestId: undefined,
    status: undefined,
    logType: undefined,
    endpoint: undefined,
    modelName: undefined,
    userId: undefined,
    tokenId: undefined,
    channelId: undefined,
    requestTimeRange: undefined
  })

  const formatCount = (value: number) => `${Number(value || 0)}`

  const formatMoney = (value: number) => {
    const amount = Number(value || 0)
    return amount === 0 ? '0' : amount.toFixed(6)
  }

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
      apiFn: fetchGetRequestLogList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'requestId',
          label: '请求',
          minWidth: 280,
          formatter: (row) =>
            h('div', { class: 'request-log-cell' }, [
              h('div', { class: 'request-log-cell__name' }, row.requestId),
              h(
                'div',
                { class: 'request-log-cell__meta' },
                `${row.endpoint} / ${row.modelName || row.requestedModel}`
              )
            ])
        },
        {
          prop: 'status',
          label: '状态',
          minWidth: 170,
          formatter: (row) =>
            h('div', { class: 'request-log-status' }, [
              h(ElTag, { type: getRequestLogStatusTagType(row.status) }, () =>
                getRequestLogStatusLabel(row.status)
              ),
              h(
                ElTag,
                {
                  type: getRequestStatusTagType(row.requestStatus),
                  class: 'request-log-status__tag'
                },
                () => getRequestStatusLabel(row.requestStatus)
              )
            ])
        },
        {
          prop: 'logType',
          label: '类型',
          width: 110,
          formatter: (row) =>
            h(ElTag, { type: getRequestLogTypeTagType(row.logType) }, () =>
              getRequestLogTypeLabel(row.logType)
            )
        },
        {
          prop: 'tokenName',
          label: '命中资源',
          minWidth: 220,
          formatter: (row) =>
            h('div', { class: 'request-log-cell' }, [
              h(
                'div',
                { class: 'request-log-cell__name' },
                row.tokenName || `Token #${row.tokenId}`
              ),
              h(
                'div',
                { class: 'request-log-cell__meta' },
                `${row.channelName || `渠道 #${row.channelId}`} / ${row.accountName || `账号 #${row.accountId}`}`
              )
            ])
        },
        {
          prop: 'tokens',
          label: 'Token 用量',
          minWidth: 200,
          formatter: (row) =>
            h('div', { class: 'request-log-stack' }, [
              h(
                'div',
                `输入 ${formatCount(row.promptTokens)} / 输出 ${formatCount(row.completionTokens)}`
              ),
              h(
                'div',
                { class: 'request-log-stack__sub' },
                `总 ${formatCount(row.totalTokens)} / 缓存 ${formatCount(row.cachedTokens)} / 推理 ${formatCount(row.reasoningTokens)}`
              )
            ])
        },
        {
          prop: 'costTotal',
          label: '配额/成本',
          minWidth: 180,
          formatter: (row) =>
            h('div', { class: 'request-log-stack' }, [
              h('div', `配额 ${row.quota}`),
              h('div', { class: 'request-log-stack__sub' }, `成本 ${formatMoney(row.costTotal)}`)
            ])
        },
        {
          prop: 'elapsedTime',
          label: '耗时',
          minWidth: 160,
          formatter: (row) =>
            h('div', { class: 'request-log-stack' }, [
              h('div', `${row.elapsedTime} ms`),
              h('div', { class: 'request-log-stack__sub' }, `首 Token ${row.firstTokenTime} ms`)
            ])
        },
        {
          prop: 'statusCode',
          label: '响应',
          minWidth: 160,
          formatter: (row) =>
            h('div', { class: 'request-log-stack' }, [
              h('div', `${row.statusCode}`),
              h('div', { class: 'request-log-stack__sub' }, row.clientIp || '-')
            ])
        },
        {
          prop: 'content',
          label: '摘要',
          minWidth: 220,
          formatter: (row) => h('span', { class: 'request-log-summary' }, row.content || '-')
        },
        {
          prop: 'createTime',
          label: '记录时间',
          minWidth: 170
        },
        {
          prop: 'operation',
          label: '操作',
          width: 90,
          fixed: 'right',
          formatter: (row) =>
            h(ArtButtonMore, {
              list: [{ key: 'detail', label: '查看请求详情', icon: 'ri:eye-line' }],
              onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
            })
        }
      ]
    }
  })

  const handleSearch = (params: SearchFormModel) => {
    const { requestTimeRange, ...filters } = params
    const [startTime, endTime] = Array.isArray(requestTimeRange)
      ? requestTimeRange
      : [undefined, undefined]

    Object.assign(searchParams, filters, { startTime, endTime })
    getData()
  }

  const handleMoreClick = (item: ButtonMoreItem, row: RequestLogListItem) => {
    if (item.key !== 'detail') return
    currentRequestId.value = row.requestId
    detailVisible.value = true
  }

  onMounted(async () => {
    await getData()
  })
</script>

<style scoped lang="scss">
  .request-log-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .request-log-page-card {
    flex: 1;
  }

  .request-log-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &__name {
      font-weight: 600;
      line-height: 1.2;
      color: var(--art-text-gray-900);
    }

    &__meta {
      font-size: 12px;
      line-height: 1.4;
      color: var(--art-text-gray-500);
    }
  }

  .request-log-status {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    &__tag {
      margin-left: 0;
    }
  }

  .request-log-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &__sub {
      font-size: 12px;
      line-height: 1.4;
      color: var(--art-text-gray-500);
    }
  }

  .request-log-summary {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
</style>
