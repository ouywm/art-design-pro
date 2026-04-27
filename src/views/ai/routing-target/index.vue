<template>
  <div class="routing-target-page art-full-height">
    <RoutingTargetSearch
      v-model="searchForm"
      :routing-rule-options="routingRuleOptions"
      :channel-options="channelOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card routing-target-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增路由目标</ElButton>
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

      <RoutingTargetDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :routing-target-data="currentRoutingTargetData"
        :routing-rule-options="routingRuleOptions"
        :channel-options="channelOptions"
        :account-options="accountOptions"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import { fetchGetChannelList } from '@/api/ai-channel'
  import { fetchGetChannelAccountList } from '@/api/ai-channel-account'
  import { fetchGetRoutingRuleList } from '@/api/ai-routing-rule'
  import { fetchDeleteRoutingTarget, fetchGetRoutingTargetList } from '@/api/ai-routing-target'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    getRoutingTargetStatusLabel,
    getRoutingTargetStatusTagType,
    getRoutingTargetTypeLabel
  } from './constants'
  import RoutingTargetDialog from './modules/routing-target-dialog.vue'
  import RoutingTargetSearch from './modules/routing-target-search.vue'
  import type {
    AccountOption,
    ChannelOption,
    RoutingRuleOption,
    RoutingTargetListItem,
    SearchFormModel
  } from './types'

  defineOptions({ name: 'AiRoutingTarget' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentRoutingTargetData = ref<Partial<RoutingTargetListItem>>({})
  const routingRuleOptions = ref<RoutingRuleOption[]>([])
  const channelOptions = ref<ChannelOption[]>([])
  const accountOptions = ref<AccountOption[]>([])

  const searchForm = ref<SearchFormModel>({
    routingRuleId: undefined,
    targetType: undefined,
    channelId: undefined,
    status: undefined,
    keyword: undefined
  })

  const getRoutingRuleLabel = (routingRuleId: number) => {
    return (
      routingRuleOptions.value.find((item) => item.value === routingRuleId)?.label ??
      `规则 #${routingRuleId}`
    )
  }

  const getChannelLabel = (channelId: number) => {
    return (
      channelOptions.value.find((item) => item.value === channelId)?.label ?? `渠道 #${channelId}`
    )
  }

  const getAccountLabel = (accountId: number) => {
    return (
      accountOptions.value.find((item) => item.value === accountId)?.label ?? `账号 #${accountId}`
    )
  }

  const getBindingLabel = (row: RoutingTargetListItem) => {
    switch (row.targetType) {
      case 'channel':
        return getChannelLabel(row.channelId)
      case 'account':
        return getAccountLabel(row.accountId)
      case 'plugin':
        return `插件 #${row.pluginId}`
      case 'channel_group':
      case 'pipeline':
        return row.targetKey || '-'
      default:
        return '-'
    }
  }

  const previewJsonValue = (value: unknown) => {
    if (value === undefined || value === null) return '-'
    if (!Array.isArray(value) && typeof value === 'object' && Object.keys(value).length === 0) {
      return '-'
    }
    const text = JSON.stringify(value)
    return text.length > 48 ? `${text.slice(0, 48)}...` : text
  }

  const loadRoutingRuleOptions = async () => {
    const response = await fetchGetRoutingRuleList({ page: 1, size: 1000 })
    routingRuleOptions.value = response.content.map((item) => ({
      label: `${item.ruleName} (${item.ruleCode})`,
      value: item.id,
      status: item.status
    }))
  }

  const loadChannelOptions = async () => {
    const response = await fetchGetChannelList({ page: 1, size: 1000 })
    channelOptions.value = response.content.map((item) => ({
      label: `${item.name} (#${item.id})`,
      value: item.id,
      status: item.status
    }))
  }

  const loadAccountOptions = async () => {
    const response = await fetchGetChannelAccountList({ page: 1, size: 1000 })
    accountOptions.value = response.content.map((item) => ({
      label: `${item.name} (#${item.id})`,
      value: item.id,
      status: item.status
    }))
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
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetRoutingTargetList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'routingRuleId',
          label: '路由规则',
          minWidth: 220,
          formatter: (row) => getRoutingRuleLabel(row.routingRuleId)
        },
        {
          prop: 'targetType',
          label: '目标',
          minWidth: 240,
          formatter: (row) =>
            h('div', { class: 'routing-target-cell' }, [
              h(
                'div',
                { class: 'routing-target-cell__name' },
                getRoutingTargetTypeLabel(row.targetType)
              ),
              h('div', { class: 'routing-target-cell__meta' }, getBindingLabel(row))
            ])
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getRoutingTargetStatusTagType(row.status) }, () =>
              getRoutingTargetStatusLabel(row.status)
            )
        },
        {
          prop: 'weight',
          label: '调度参数',
          minWidth: 180,
          formatter: (row) =>
            h('div', { class: 'routing-target-stack' }, [
              h('div', `权重 ${row.weight} / 优先级 ${row.priority}`),
              h('div', { class: 'routing-target-stack__sub' }, `冷却 ${row.cooldownSeconds}s`)
            ])
        },
        {
          prop: 'config',
          label: '附加配置',
          minWidth: 220,
          formatter: (row) =>
            h('span', { class: 'routing-target-json' }, previewJsonValue(row.config))
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
                { key: 'edit', label: '编辑路由目标', icon: 'ri:edit-2-line' },
                {
                  key: 'delete',
                  label: '删除路由目标',
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

  const showDialog = (type: DialogType, row?: RoutingTargetListItem) => {
    dialogType.value = type
    currentRoutingTargetData.value = row || {}
    dialogVisible.value = true
  }

  const deleteRoutingTarget = (row: RoutingTargetListItem) => {
    ElMessageBox.confirm(`确定删除路由目标“${getBindingLabel(row)}”吗？`, '删除路由目标', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteRoutingTarget(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: RoutingTargetListItem) => {
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }

    if (item.key === 'delete') {
      deleteRoutingTarget(row)
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
    await Promise.all([
      getData(),
      loadRoutingRuleOptions(),
      loadChannelOptions(),
      loadAccountOptions()
    ])
  })
</script>

<style scoped lang="scss">
  .routing-target-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .routing-target-page-card {
    flex: 1;
  }

  .routing-target-cell {
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

  .routing-target-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &__sub {
      font-size: 12px;
      line-height: 1.2;
      color: var(--art-text-gray-500);
    }
  }

  .routing-target-json {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    color: var(--art-text-gray-600);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
