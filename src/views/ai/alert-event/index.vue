<template>
  <div class="art-full-height">
    <AlertEventSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" :style="{ 'margin-top': showSearchBar ? '12px' : '0' }">
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading || actionLoading"
        @refresh="refreshData"
      />

      <ArtTable
        :loading="loading || actionLoading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <AlertEventDetailDialog v-model="detailVisible" :event-id="currentEventId" />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import {
    fetchAckAiAlertEvent,
    fetchGetAiAlertEventList,
    fetchIgnoreAiAlertEvent,
    fetchResolveAiAlertEvent
  } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { formatJsonValue } from '@/views/ai/request/helpers'
  import { formatAlertEventTime, getAlertEventStatusMeta, getAlertSeverityMeta } from './helpers'
  import AlertEventDetailDialog from './modules/alert-event-detail-dialog.vue'
  import AlertEventSearch from './modules/alert-event-search.vue'
  import type { AlertEventListItem, AlertEventSearchFormModel } from './types'

  defineOptions({ name: 'AiAlertEvent' })

  const createDefaultSearchForm = (): AlertEventSearchFormModel => ({
    alertRuleId: undefined,
    status: undefined,
    severity: undefined,
    sourceDomain: undefined,
    sourceRef: undefined,
    lastTriggeredAtRange: undefined
  })

  const searchForm = ref<AlertEventSearchFormModel>(createDefaultSearchForm())
  const showSearchBar = ref(false)
  const detailVisible = ref(false)
  const currentEventId = ref<number>()
  const actionLoading = ref(false)

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
    refreshData,
    refreshUpdate
  } = useTable({
    core: {
      apiFn: fetchGetAiAlertEventList,
      apiParams: {
        page: 1,
        size: 20
      },
      excludeParams: ['lastTriggeredAtRange'],
      columnsFactory: () => [
        {
          prop: 'title',
          label: '事件信息',
          minWidth: 240,
          showOverflowTooltip: false,
          formatter: (row: AlertEventListItem) =>
            h('div', { class: 'event-info-cell' }, [
              h(
                'div',
                {
                  class: 'event-title-link',
                  onClick: () => showDetail(row)
                },
                row.title || row.eventCode
              ),
              h('div', { class: 'event-info-subtext' }, row.eventCode)
            ])
        },
        {
          prop: 'severity',
          label: '级别',
          width: 92,
          formatter: (row: AlertEventListItem) =>
            h(
              ElTag,
              { type: getAlertSeverityMeta(row.severity).type, size: 'small' },
              () => getAlertSeverityMeta(row.severity).text
            )
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: AlertEventListItem) =>
            h(
              ElTag,
              { type: getAlertEventStatusMeta(row.status).type, size: 'small' },
              () => getAlertEventStatusMeta(row.status).text
            )
        },
        {
          prop: 'sourceDomain',
          label: '来源',
          minWidth: 180,
          showOverflowTooltip: false,
          formatter: (row: AlertEventListItem) =>
            h('div', { class: 'event-info-cell' }, [
              h('div', null, row.sourceDomain || '-'),
              h('div', { class: 'event-info-subtext' }, row.sourceRef || '-')
            ])
        },
        {
          prop: 'detail',
          label: '摘要',
          minWidth: 240,
          showOverflowTooltip: true,
          formatter: (row: AlertEventListItem) => row.detail || formatJsonValue(row.payload) || '-'
        },
        {
          prop: 'alertRuleId',
          label: '规则 ID',
          width: 92
        },
        {
          prop: 'lastTriggeredAt',
          label: '最近触发',
          width: 180,
          formatter: (row: AlertEventListItem) => formatAlertEventTime(row.lastTriggeredAt)
        },
        {
          prop: 'ackTime',
          label: '确认时间',
          width: 180,
          formatter: (row: AlertEventListItem) => formatAlertEventTime(row.ackTime)
        },
        {
          prop: 'resolvedTime',
          label: '解决时间',
          width: 180,
          formatter: (row: AlertEventListItem) => formatAlertEventTime(row.resolvedTime)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: AlertEventListItem) =>
            h(ArtButtonMore, {
              list: buildActionList(row),
              onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
            })
        }
      ]
    }
  })

  const handleSearch = (params: AlertEventSearchFormModel) => {
    const { lastTriggeredAtRange, ...filters } = params
    const [lastTriggeredAtStart, lastTriggeredAtEnd] = Array.isArray(lastTriggeredAtRange)
      ? lastTriggeredAtRange
      : [undefined, undefined]

    Object.assign(searchParams, filters, {
      lastTriggeredAtStart,
      lastTriggeredAtEnd
    })
    getData()
  }

  const showDetail = (row: AlertEventListItem) => {
    currentEventId.value = row.id
    detailVisible.value = true
  }

  const buildActionList = (row: AlertEventListItem): ButtonMoreItem[] => {
    const list: ButtonMoreItem[] = [{ key: 'detail', label: '查看详情', icon: 'ri:eye-line' }]

    if (row.status === 1) {
      list.push({ key: 'ack', label: '确认事件', icon: 'ri:check-line' })
      list.push({ key: 'resolve', label: '解决事件', icon: 'ri:checkbox-circle-line' })
      list.push({ key: 'ignore', label: '忽略事件', icon: 'ri:forbid-2-line', color: '#e6a23c' })
    } else if (row.status === 2) {
      list.push({ key: 'resolve', label: '解决事件', icon: 'ri:checkbox-circle-line' })
      list.push({ key: 'ignore', label: '忽略事件', icon: 'ri:forbid-2-line', color: '#e6a23c' })
    }

    return list
  }

  const runEventAction = async (
    row: AlertEventListItem,
    action: 'ack' | 'resolve' | 'ignore',
    title: string,
    requestFn: (id: number) => Promise<unknown>
  ) => {
    await ElMessageBox.confirm(`确定${title}“${row.title || row.eventCode}”吗？`, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    actionLoading.value = true
    try {
      await requestFn(row.id)
      ElMessage.success(`${title}成功`)
      refreshUpdate()
    } finally {
      actionLoading.value = false
    }
  }

  const handleMoreClick = async (item: ButtonMoreItem, row: AlertEventListItem) => {
    switch (item.key) {
      case 'detail':
        showDetail(row)
        break
      case 'ack':
        await runEventAction(row, 'ack', '确认事件', fetchAckAiAlertEvent)
        break
      case 'resolve':
        await runEventAction(row, 'resolve', '解决事件', fetchResolveAiAlertEvent)
        break
      case 'ignore':
        await runEventAction(row, 'ignore', '忽略事件', fetchIgnoreAiAlertEvent)
        break
    }
  }
</script>

<style scoped lang="scss">
  .event-info-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    justify-content: center;
    min-height: 42px;
  }

  .event-title-link {
    font-weight: 600;
    color: var(--el-color-primary);
    word-break: break-all;
    cursor: pointer;
  }

  .event-info-subtext {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    word-break: break-all;
  }
</style>
