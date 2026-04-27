<template>
  <div class="ability-page art-full-height">
    <AbilitySearch
      v-model="searchForm"
      :channel-options="channelOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card ability-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增能力映射</ElButton>
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

      <AbilityDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :ability-data="currentAbilityData"
        :channel-options="channelOptions"
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
  import { fetchDeleteAbility, fetchGetAbilityList } from '@/api/ai-ability'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { getAbilityEnabledLabel, getAbilityEnabledTagType } from './constants'
  import AbilityDialog from './modules/ability-dialog.vue'
  import AbilitySearch from './modules/ability-search.vue'
  import type { AbilityListItem, ChannelOption, SearchFormModel } from './types'

  defineOptions({ name: 'AiAbility' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentAbilityData = ref<Partial<AbilityListItem>>({})
  const channelOptions = ref<ChannelOption[]>([])

  const searchForm = ref<SearchFormModel>({
    channelGroup: undefined,
    endpointScope: undefined,
    model: undefined,
    channelId: undefined,
    enabled: undefined,
    keyword: undefined
  })

  const getChannelLabel = (channelId: number) => {
    return (
      channelOptions.value.find((item) => item.value === channelId)?.label ?? `渠道 #${channelId}`
    )
  }

  const previewJsonValue = (value: unknown) => {
    if (value === undefined || value === null) return '-'
    if (!Array.isArray(value) && typeof value === 'object' && Object.keys(value).length === 0) {
      return '-'
    }
    const text = JSON.stringify(value)
    return text.length > 48 ? `${text.slice(0, 48)}...` : text
  }

  const loadChannelOptions = async () => {
    const response = await fetchGetChannelList({ page: 1, size: 1000 })
    channelOptions.value = response.content.map((item) => ({
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
      apiFn: fetchGetAbilityList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'model',
          label: '能力',
          minWidth: 240,
          formatter: (row) =>
            h('div', { class: 'ability-cell' }, [
              h('div', { class: 'ability-cell__name' }, row.model),
              h(
                'div',
                { class: 'ability-cell__meta' },
                `${row.channelGroup} / ${row.endpointScope}`
              )
            ])
        },
        {
          prop: 'channelId',
          label: '渠道',
          minWidth: 180,
          formatter: (row) => getChannelLabel(row.channelId)
        },
        {
          prop: 'enabled',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getAbilityEnabledTagType(row.enabled) }, () =>
              getAbilityEnabledLabel(row.enabled)
            )
        },
        {
          prop: 'priority',
          label: '优先级',
          width: 100
        },
        {
          prop: 'weight',
          label: '权重',
          width: 100
        },
        {
          prop: 'routeConfig',
          label: '路由配置',
          minWidth: 220,
          formatter: (row) =>
            h('span', { class: 'ability-json' }, previewJsonValue(row.routeConfig))
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
                { key: 'edit', label: '编辑能力映射', icon: 'ri:edit-2-line' },
                {
                  key: 'delete',
                  label: '删除能力映射',
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

  const showDialog = (type: DialogType, row?: AbilityListItem) => {
    dialogType.value = type
    currentAbilityData.value = row || {}
    dialogVisible.value = true
  }

  const deleteAbility = (row: AbilityListItem) => {
    ElMessageBox.confirm(`确定删除能力映射“${row.model}”吗？`, '删除能力映射', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteAbility(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: AbilityListItem) => {
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }

    if (item.key === 'delete') {
      deleteAbility(row)
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
    await Promise.all([getData(), loadChannelOptions()])
  })
</script>

<style scoped lang="scss">
  .ability-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ability-page-card {
    flex: 1;
  }

  .ability-cell {
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

  .ability-json {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    color: var(--art-text-gray-600);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
