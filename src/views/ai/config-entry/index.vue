<template>
  <div class="config-entry-page art-full-height">
    <ConfigEntrySearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card config-entry-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增配置项</ElButton>
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

      <ConfigEntryDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :config-entry-data="currentConfigEntryData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import { fetchDeleteConfigEntry, fetchGetConfigEntryList } from '@/api/ai-config-entry'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    getConfigEntryScopeTypeLabel,
    getConfigEntryStatusLabel,
    getConfigEntryStatusTagType
  } from './constants'
  import ConfigEntryDialog from './modules/config-entry-dialog.vue'
  import ConfigEntrySearch from './modules/config-entry-search.vue'
  import type { ConfigEntryListItem, SearchFormModel } from './types'

  defineOptions({ name: 'AiConfigEntry' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentConfigEntryData = ref<Partial<ConfigEntryListItem>>({})

  const searchForm = ref<SearchFormModel>({
    scopeType: undefined,
    scopeId: undefined,
    category: undefined,
    configKey: undefined,
    status: undefined,
    keyword: undefined
  })

  const previewJsonValue = (value: unknown) => {
    const text = JSON.stringify(value)
    if (!text || text === '{}' || text === '[]') return '-'
    return text.length > 48 ? `${text.slice(0, 48)}...` : text
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
      apiFn: fetchGetConfigEntryList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'configKey',
          label: '配置项',
          minWidth: 240,
          formatter: (row) =>
            h('div', { class: 'config-entry-cell' }, [
              h('div', { class: 'config-entry-cell__name' }, row.configKey),
              h('div', { class: 'config-entry-cell__meta' }, row.category)
            ])
        },
        {
          prop: 'scopeType',
          label: '作用域',
          minWidth: 170,
          formatter: (row) =>
            h('div', { class: 'config-entry-scope' }, [
              h('div', getConfigEntryScopeTypeLabel(row.scopeType)),
              h('div', { class: 'config-entry-scope__sub' }, `ID ${row.scopeId}`)
            ])
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getConfigEntryStatusTagType(row.status) }, () =>
              getConfigEntryStatusLabel(row.status)
            )
        },
        {
          prop: 'versionNo',
          label: '版本',
          width: 100
        },
        {
          prop: 'secretRef',
          label: 'Secret Ref',
          minWidth: 180,
          formatter: (row) => row.secretRef || '-'
        },
        {
          prop: 'configValue',
          label: '配置值',
          minWidth: 220,
          formatter: (row) =>
            h('span', { class: 'config-entry-json' }, previewJsonValue(row.configValue))
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
                { key: 'edit', label: '编辑配置项', icon: 'ri:edit-2-line' },
                {
                  key: 'delete',
                  label: '删除配置项',
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

  const showDialog = (type: DialogType, row?: ConfigEntryListItem) => {
    dialogType.value = type
    currentConfigEntryData.value = row || {}
    dialogVisible.value = true
  }

  const deleteConfigEntry = (row: ConfigEntryListItem) => {
    ElMessageBox.confirm(`确定删除配置项“${row.configKey}”吗？`, '删除配置项', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteConfigEntry(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ConfigEntryListItem) => {
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }

    if (item.key === 'delete') {
      deleteConfigEntry(row)
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
  .config-entry-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .config-entry-page-card {
    flex: 1;
  }

  .config-entry-cell {
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

  .config-entry-scope {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &__sub {
      font-size: 12px;
      line-height: 1.2;
      color: var(--art-text-gray-500);
    }
  }

  .config-entry-json {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    color: var(--art-text-gray-600);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
