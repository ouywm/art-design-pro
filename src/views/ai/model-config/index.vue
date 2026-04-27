<template>
  <div class="model-config-page art-full-height">
    <ModelConfigSearch
      v-model="searchForm"
      :vendor-options="vendorOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card model-config-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增模型配置</ElButton>
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

      <ModelConfigDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :model-config-data="currentModelConfigData"
        :vendor-options="vendorOptions"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import { fetchGetVendorList } from '@/api/ai-vendor'
  import { fetchDeleteModelConfig, fetchGetModelConfigList } from '@/api/ai-model-config'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    getEnabledLabel,
    getEnabledTagType,
    getModelConfigTypeLabel,
    getModelConfigTypeTagType
  } from './constants'
  import ModelConfigDialog from './modules/model-config-dialog.vue'
  import ModelConfigSearch from './modules/model-config-search.vue'
  import type { ModelConfigListItem, SearchFormModel, VendorOption } from './types'

  defineOptions({ name: 'AiModelConfig' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentModelConfigData = ref<Partial<ModelConfigListItem>>({})
  const vendorOptions = ref<VendorOption[]>([])

  const searchForm = ref<SearchFormModel>({
    modelName: undefined,
    modelType: undefined,
    vendorCode: undefined,
    enabled: undefined,
    keyword: undefined
  })

  const getVendorLabel = (vendorCode: string) => {
    return vendorOptions.value.find((item) => item.value === vendorCode)?.label ?? vendorCode
  }

  const loadVendorOptions = async () => {
    const response = await fetchGetVendorList({ page: 1, size: 1000 })
    vendorOptions.value = response.content.map((item) => ({
      label: `${item.vendorName} (${item.vendorCode})`,
      value: item.vendorCode,
      enabled: item.enabled
    }))
  }

  const previewArray = (items: string[]) => {
    if (!items.length) return '-'
    const preview = items.slice(0, 2).join(', ')
    return items.length > 2 ? `${preview} +${items.length - 2}` : preview
  }

  const formatRatio = (row: ModelConfigListItem) =>
    `I ${Number(row.inputRatio || 0).toFixed(2)} / O ${Number(row.outputRatio || 0).toFixed(2)}`

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
      apiFn: fetchGetModelConfigList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'displayName',
          label: '模型',
          minWidth: 240,
          formatter: (row) =>
            h('div', { class: 'model-config-cell' }, [
              h('div', { class: 'model-config-cell__name' }, row.displayName),
              h('div', { class: 'model-config-cell__meta' }, row.modelName)
            ])
        },
        {
          prop: 'modelType',
          label: '类型',
          width: 120,
          formatter: (row) =>
            h(ElTag, { type: getModelConfigTypeTagType(row.modelType) }, () =>
              getModelConfigTypeLabel(row.modelType)
            )
        },
        {
          prop: 'vendorCode',
          label: '供应商',
          minWidth: 180,
          formatter: (row) => getVendorLabel(row.vendorCode)
        },
        {
          prop: 'supportedEndpoints',
          label: 'Endpoints',
          minWidth: 160,
          formatter: (row) => previewArray(row.supportedEndpoints)
        },
        {
          prop: 'capabilities',
          label: '能力标签',
          minWidth: 160,
          formatter: (row) => previewArray(row.capabilities)
        },
        {
          prop: 'ratio',
          label: '倍率',
          minWidth: 170,
          formatter: (row) =>
            h('div', { class: 'model-config-ratio' }, [
              h('div', formatRatio(row)),
              h(
                'div',
                { class: 'model-config-ratio__sub' },
                `Cache ${Number(row.cachedInputRatio || 0).toFixed(2)} / Reason ${Number(row.reasoningRatio || 0).toFixed(2)}`
              )
            ])
        },
        {
          prop: 'maxContext',
          label: '上下文',
          width: 120
        },
        {
          prop: 'enabled',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getEnabledTagType(row.enabled) }, () => getEnabledLabel(row.enabled))
        },
        {
          prop: 'effectiveFrom',
          label: '生效时间',
          minWidth: 180,
          formatter: (row) => row.effectiveFrom || '-'
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
                { key: 'edit', label: '编辑模型配置', icon: 'ri:edit-2-line' },
                {
                  key: 'delete',
                  label: '删除模型配置',
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

  const showDialog = (type: DialogType, row?: ModelConfigListItem) => {
    dialogType.value = type
    currentModelConfigData.value = row || {}
    dialogVisible.value = true
  }

  const deleteModelConfig = (row: ModelConfigListItem) => {
    ElMessageBox.confirm(`确定删除模型配置“${row.displayName}”吗？`, '删除模型配置', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteModelConfig(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ModelConfigListItem) => {
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }
    if (item.key === 'delete') {
      deleteModelConfig(row)
    }
  }

  const handleDialogSubmit = async (type: DialogType) => {
    if (type === 'add') {
      await refreshCreate()
    } else {
      await refreshUpdate()
    }
  }

  onMounted(() => {
    void loadVendorOptions()
  })
</script>

<style scoped lang="scss">
  .model-config-page {
    .model-config-page-card {
      :deep(.el-card__body) {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
    }
  }

  .model-config-cell,
  .model-config-ratio {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .model-config-cell {
    &__name {
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__meta {
      margin-top: 4px;
      overflow: hidden;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .model-config-ratio {
    &__sub {
      margin-top: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
