<template>
  <div class="group-ratio-page art-full-height">
    <GroupRatioSearch
      v-model="searchForm"
      :group-options="groupOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card group-ratio-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增分组比率</ElButton>
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

      <GroupRatioDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :group-ratio-data="currentGroupRatioData"
        :group-options="groupOptions"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import { fetchDeleteGroupRatio, fetchGetGroupRatioList } from '@/api/ai-group-ratio'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { getGroupRatioEnabledLabel, getGroupRatioEnabledTagType } from './constants'
  import GroupRatioDialog from './modules/group-ratio-dialog.vue'
  import GroupRatioSearch from './modules/group-ratio-search.vue'
  import type { GroupCodeOption, GroupRatioListItem, SearchFormModel } from './types'

  defineOptions({ name: 'AiGroupRatio' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentGroupRatioData = ref<Partial<GroupRatioListItem>>({})
  const groupOptions = ref<GroupCodeOption[]>([])

  const searchForm = ref<SearchFormModel>({
    groupCode: undefined,
    enabled: undefined,
    keyword: undefined
  })

  const previewArray = (items: string[]) => {
    if (!items.length) return '-'
    const preview = items.slice(0, 2).join(', ')
    return items.length > 2 ? `${preview} +${items.length - 2}` : preview
  }

  const previewPolicy = (value: unknown) => {
    if (value === undefined || value === null) return '-'
    if (!Array.isArray(value) && typeof value === 'object' && Object.keys(value).length === 0) {
      return '-'
    }
    const text = JSON.stringify(value)
    return text.length > 48 ? `${text.slice(0, 48)}...` : text
  }

  const getGroupOptionLabel = (groupCode: string) => {
    if (!groupCode) return '-'
    return groupOptions.value.find((item) => item.value === groupCode)?.label ?? groupCode
  }

  const loadGroupOptions = async () => {
    const response = await fetchGetGroupRatioList({ page: 1, size: 1000 })
    groupOptions.value = response.content.map((item) => ({
      label: `${item.groupName} (${item.groupCode})`,
      value: item.groupCode,
      enabled: item.enabled
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
      apiFn: fetchGetGroupRatioList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'groupName',
          label: '分组',
          minWidth: 220,
          formatter: (row) =>
            h('div', { class: 'group-ratio-cell' }, [
              h('div', { class: 'group-ratio-cell__name' }, row.groupName),
              h('div', { class: 'group-ratio-cell__meta' }, row.groupCode)
            ])
        },
        {
          prop: 'ratio',
          label: '倍率',
          width: 120,
          formatter: (row) => `x${Number(row.ratio || 0).toFixed(2)}`
        },
        {
          prop: 'enabled',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getGroupRatioEnabledTagType(row.enabled) }, () =>
              getGroupRatioEnabledLabel(row.enabled)
            )
        },
        {
          prop: 'modelWhitelist',
          label: '白名单',
          minWidth: 180,
          formatter: (row) => previewArray(row.modelWhitelist)
        },
        {
          prop: 'modelBlacklist',
          label: '黑名单',
          minWidth: 180,
          formatter: (row) => previewArray(row.modelBlacklist)
        },
        {
          prop: 'endpointScopes',
          label: 'Endpoint',
          minWidth: 180,
          formatter: (row) => previewArray(row.endpointScopes)
        },
        {
          prop: 'fallbackGroupCode',
          label: '回退分组',
          minWidth: 180,
          formatter: (row) => getGroupOptionLabel(row.fallbackGroupCode)
        },
        {
          prop: 'policy',
          label: '策略',
          minWidth: 200,
          formatter: (row) => h('span', { class: 'group-ratio-policy' }, previewPolicy(row.policy))
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 180,
          formatter: (row) => row.remark || '-'
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
                { key: 'edit', label: '编辑分组比率', icon: 'ri:edit-2-line' },
                {
                  key: 'delete',
                  label: '删除分组比率',
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

  const showDialog = (type: DialogType, row?: GroupRatioListItem) => {
    dialogType.value = type
    currentGroupRatioData.value = row || {}
    dialogVisible.value = true
  }

  const deleteGroupRatio = (row: GroupRatioListItem) => {
    ElMessageBox.confirm(`确定删除分组“${row.groupName}”吗？`, '删除分组比率', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteGroupRatio(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
      await loadGroupOptions()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: GroupRatioListItem) => {
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }

    if (item.key === 'delete') {
      deleteGroupRatio(row)
    }
  }

  const handleDialogSubmit = async (type: DialogType) => {
    if (type === 'add') {
      await refreshCreate()
    } else {
      await refreshUpdate()
    }
    await loadGroupOptions()
  }

  onMounted(async () => {
    await Promise.all([getData(), loadGroupOptions()])
  })
</script>

<style scoped lang="scss">
  .group-ratio-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .group-ratio-page-card {
    flex: 1;
  }

  .group-ratio-cell {
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

  .group-ratio-policy {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    color: var(--art-text-gray-600);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
