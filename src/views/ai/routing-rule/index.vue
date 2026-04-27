<template>
  <div class="routing-rule-page art-full-height">
    <RoutingRuleSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card routing-rule-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增路由规则</ElButton>
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

      <RoutingRuleDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :routing-rule-data="currentRoutingRuleData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import { fetchDeleteRoutingRule, fetchGetRoutingRuleList } from '@/api/ai-routing-rule'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    getRoutingRuleMatchTypeLabel,
    getRoutingRuleRouteStrategyLabel,
    getRoutingRuleStatusLabel,
    getRoutingRuleStatusTagType
  } from './constants'
  import RoutingRuleDialog from './modules/routing-rule-dialog.vue'
  import RoutingRuleSearch from './modules/routing-rule-search.vue'
  import type { RoutingRuleListItem, SearchFormModel } from './types'

  defineOptions({ name: 'AiRoutingRule' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentRoutingRuleData = ref<Partial<RoutingRuleListItem>>({})

  const searchForm = ref<SearchFormModel>({
    organizationId: undefined,
    projectId: undefined,
    status: undefined,
    ruleCode: undefined,
    keyword: undefined
  })

  const previewJsonValue = (value: unknown) => {
    if (value === undefined || value === null) return '-'
    if (!Array.isArray(value) && typeof value === 'object' && Object.keys(value).length === 0) {
      return '-'
    }
    const text = JSON.stringify(value)
    return text.length > 48 ? `${text.slice(0, 48)}...` : text
  }

  const previewScope = (row: RoutingRuleListItem) =>
    `Org ${row.organizationId} / Proj ${row.projectId}`

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
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetRoutingRuleList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'ruleName',
          label: '规则',
          minWidth: 240,
          formatter: (row) =>
            h('div', { class: 'routing-rule-cell' }, [
              h('div', { class: 'routing-rule-cell__name' }, row.ruleName),
              h(
                'div',
                { class: 'routing-rule-cell__meta' },
                `${row.ruleCode} / ${previewScope(row)}`
              )
            ])
        },
        {
          prop: 'matchType',
          label: '匹配',
          minWidth: 160,
          formatter: (row) =>
            h('div', { class: 'routing-rule-stack' }, [
              h('div', getRoutingRuleMatchTypeLabel(row.matchType)),
              h('div', { class: 'routing-rule-stack__sub' }, previewJsonValue(row.matchConditions))
            ])
        },
        {
          prop: 'routeStrategy',
          label: '策略',
          minWidth: 170,
          formatter: (row) =>
            h('div', { class: 'routing-rule-stack' }, [
              h('div', getRoutingRuleRouteStrategyLabel(row.routeStrategy)),
              h(
                'div',
                { class: 'routing-rule-stack__sub' },
                `Fallback ${row.fallbackStrategy || 'none'}`
              )
            ])
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getRoutingRuleStatusTagType(row.status) }, () =>
              getRoutingRuleStatusLabel(row.status)
            )
        },
        {
          prop: 'priority',
          label: '优先级',
          width: 100
        },
        {
          prop: 'schedule',
          label: '生效窗口',
          minWidth: 220,
          formatter: (row) =>
            h('div', { class: 'routing-rule-stack' }, [
              h('div', row.startTime || '立即生效'),
              h('div', { class: 'routing-rule-stack__sub' }, row.endTime || '长期有效')
            ])
        },
        {
          prop: 'metadata',
          label: '元数据',
          minWidth: 180,
          formatter: (row) =>
            h('span', { class: 'routing-rule-json' }, previewJsonValue(row.metadata))
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          minWidth: 170
        },
        {
          prop: 'operation',
          label: '操作',
          width: 90,
          fixed: 'right',
          formatter: (row) =>
            h(ArtButtonMore, {
              list: [
                { key: 'edit', label: '编辑路由规则', icon: 'ri:edit-2-line' },
                {
                  key: 'delete',
                  label: '删除路由规则',
                  icon: 'ri:delete-bin-4-line',
                  color: '#f56c6c'
                }
              ],
              onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
            })
        }
      ]
    }
  })

  const handleSearch = (params: SearchFormModel) => {
    replaceSearchParams(params)
    getData()
  }

  const showDialog = (type: DialogType, row?: RoutingRuleListItem) => {
    dialogType.value = type
    currentRoutingRuleData.value = row || {}
    dialogVisible.value = true
  }

  const deleteRoutingRule = (row: RoutingRuleListItem) => {
    ElMessageBox.confirm(`确定删除路由规则“${row.ruleName}”吗？`, '删除路由规则', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteRoutingRule(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: RoutingRuleListItem) => {
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }

    if (item.key === 'delete') {
      deleteRoutingRule(row)
    }
  }

  const handleDialogSubmit = async (type: DialogType) => {
    if (type === 'add') {
      await refreshCreate()
    } else {
      await refreshUpdate()
    }
  }

  onMounted(async () => {
    await getData()
  })
</script>

<style scoped lang="scss">
  .routing-rule-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .routing-rule-page-card {
    flex: 1;
  }

  .routing-rule-cell {
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
      line-height: 1.2;
      color: var(--art-text-gray-500);
    }
  }

  .routing-rule-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &__sub {
      font-size: 12px;
      line-height: 1.2;
      color: var(--art-text-gray-500);
    }
  }

  .routing-rule-json {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    color: var(--art-text-gray-600);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
