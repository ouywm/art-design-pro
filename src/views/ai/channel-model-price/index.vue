<template>
  <div class="channel-model-price-page art-full-height">
    <ChannelModelPriceSearch
      v-model="searchForm"
      :channel-options="channelOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card channel-model-price-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增价格配置</ElButton>
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

      <ChannelModelPriceDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :price-data="currentPriceData"
        :channel-options="channelOptions"
        @submit="handleDialogSubmit"
      />

      <ChannelModelPriceVersionsDrawer
        v-model:visible="versionsDrawerVisible"
        :price-id="currentVersionPriceId"
        :channel-label="currentVersionChannelLabel"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import { fetchGetChannelList } from '@/api/ai-channel'
  import {
    fetchDeleteChannelModelPrice,
    fetchGetChannelModelPriceList
  } from '@/api/ai-channel-model-price'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    getChannelModelPriceBillingModeLabel,
    getChannelModelPriceBillingModeTagType,
    getChannelModelPriceStatusLabel,
    getChannelModelPriceStatusTagType
  } from './constants'
  import ChannelModelPriceDialog from './modules/channel-model-price-dialog.vue'
  import ChannelModelPriceSearch from './modules/channel-model-price-search.vue'
  import ChannelModelPriceVersionsDrawer from './modules/channel-model-price-versions-drawer.vue'
  import type { ChannelModelPriceListItem, ChannelOption, SearchFormModel } from './types'

  defineOptions({ name: 'AiChannelModelPrice' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentPriceData = ref<Partial<ChannelModelPriceListItem>>({})
  const channelOptions = ref<ChannelOption[]>([])
  const versionsDrawerVisible = ref(false)
  const currentVersionPriceId = ref<number>()
  const currentVersionChannelLabel = ref('')

  const searchForm = ref<SearchFormModel>({
    channelId: undefined,
    modelName: undefined,
    status: undefined,
    billingMode: undefined,
    keyword: undefined
  })

  const getChannelLabel = (channelId: number) =>
    channelOptions.value.find((item) => item.value === channelId)?.label ?? `#${channelId}`

  const loadChannelOptions = async () => {
    const response = await fetchGetChannelList({ page: 1, size: 1000 })
    channelOptions.value = response.content.map((item) => ({
      label: `${item.name} (${item.vendorCode})`,
      value: item.id,
      status: item.status
    }))
  }

  const formatPriceConfig = (config: Api.AiManage.ChannelModelPriceConfig) => {
    const parts = [`I ${config.inputPerMillion}`, `O ${config.outputPerMillion}`]
    if (config.cacheReadPerMillion) parts.push(`CR ${config.cacheReadPerMillion}`)
    if (config.cacheWritePerMillion) parts.push(`CW ${config.cacheWritePerMillion}`)
    if (config.reasoningPerMillion) parts.push(`R ${config.reasoningPerMillion}`)
    return parts.join(' / ')
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
      apiFn: fetchGetChannelModelPriceList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'modelName',
          label: '渠道 / 模型',
          minWidth: 240,
          formatter: (row) =>
            h('div', { class: 'channel-model-price-cell' }, [
              h('div', { class: 'channel-model-price-cell__name' }, row.modelName),
              h('div', { class: 'channel-model-price-cell__meta' }, getChannelLabel(row.channelId))
            ])
        },
        {
          prop: 'billingMode',
          label: '计费模式',
          width: 120,
          formatter: (row) =>
            h(ElTag, { type: getChannelModelPriceBillingModeTagType(row.billingMode) }, () =>
              getChannelModelPriceBillingModeLabel(row.billingMode)
            )
        },
        {
          prop: 'currency',
          label: '货币',
          width: 90
        },
        {
          prop: 'priceConfig',
          label: '价格配置',
          minWidth: 220,
          formatter: (row) =>
            h('div', { class: 'channel-model-price-price' }, [
              h('div', formatPriceConfig(row.priceConfig)),
              h('div', { class: 'channel-model-price-price__sub' }, row.referenceId)
            ])
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getChannelModelPriceStatusTagType(row.status) }, () =>
              getChannelModelPriceStatusLabel(row.status)
            )
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
                { key: 'versions', label: '版本记录', icon: 'ri:history-line' },
                { key: 'edit', label: '编辑价格', icon: 'ri:edit-2-line' },
                { key: 'delete', label: '删除价格', icon: 'ri:delete-bin-4-line', color: '#f56c6c' }
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

  const showDialog = (type: DialogType, row?: ChannelModelPriceListItem) => {
    dialogType.value = type
    currentPriceData.value = row || {}
    dialogVisible.value = true
  }

  const showVersionsDrawer = (row: ChannelModelPriceListItem) => {
    currentVersionPriceId.value = row.id
    currentVersionChannelLabel.value = getChannelLabel(row.channelId)
    versionsDrawerVisible.value = true
  }

  const deletePrice = (row: ChannelModelPriceListItem) => {
    ElMessageBox.confirm(`确定删除价格配置“${row.modelName}”吗？`, '删除渠道模型价格', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteChannelModelPrice(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ChannelModelPriceListItem) => {
    if (item.key === 'versions') {
      showVersionsDrawer(row)
      return
    }
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }
    if (item.key === 'delete') {
      deletePrice(row)
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
    void loadChannelOptions()
  })
</script>

<style scoped lang="scss">
  .channel-model-price-page {
    .channel-model-price-page-card {
      :deep(.el-card__body) {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
    }
  }

  .channel-model-price-cell,
  .channel-model-price-price {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .channel-model-price-cell {
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

  .channel-model-price-price {
    &__sub {
      margin-top: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      word-break: break-all;
    }
  }
</style>
