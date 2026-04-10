<template>
  <div class="art-full-height">
    <ChannelModelPriceSearch
      v-show="showSearchBar"
      v-model="searchForm"
      :channel-options="channelSearchOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" :style="{ 'margin-top': showSearchBar ? '12px' : '0' }">
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading || channelOptionsLoading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showFormPanel('add')" v-ripple>新增模型价格</ElButton>
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
    </ElCard>

    <ChannelModelPriceFormPanel
      v-model="formPanelVisible"
      :panel-mode="formPanelMode"
      :price-data="currentPriceData"
      :channel-options="channelOptions"
      :channel-options-loading="channelOptionsLoading"
      @success="handleFormSuccess"
    />

    <ChannelModelPriceDetailDialog
      v-model="detailDialogVisible"
      :price-id="currentPriceId"
      :channel-options="channelOptions"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import {
    fetchDeleteAiChannelModelPrice,
    fetchGetAiChannelList,
    fetchGetAiChannelModelPriceList
  } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { buildPriceConfigSummary } from './helpers'
  import ChannelModelPriceDetailDialog from './modules/channel-model-price-detail-dialog.vue'
  import ChannelModelPriceFormPanel from './modules/channel-model-price-form-panel.vue'
  import ChannelModelPriceSearch from './modules/channel-model-price-search.vue'
  import type {
    ChannelModelPriceBillingMode,
    ChannelModelPriceListItem,
    ChannelModelPriceSearchFormModel,
    ChannelModelPriceStatus
  } from './types'

  defineOptions({ name: 'AiChannelModelPrice' })

  const showSearchBar = ref(false)
  const formPanelVisible = ref(false)
  const formPanelMode = ref<'add' | 'edit'>('add')
  const detailDialogVisible = ref(false)
  const currentPriceData = ref<ChannelModelPriceListItem | undefined>(undefined)
  const currentPriceId = ref<number | undefined>(undefined)
  const channelOptionsLoading = ref(false)
  const channelOptions = ref<Api.AiChannel.ChannelListItem[]>([])

  const searchForm = ref<ChannelModelPriceSearchFormModel>({
    channelId: undefined,
    modelName: undefined,
    billingMode: undefined,
    status: undefined
  })

  const billingModeLabelMap: Record<ChannelModelPriceBillingMode, string> = {
    1: '按 Token',
    2: '按请求',
    3: '按媒体单元'
  }

  const statusTagMap: Record<
    ChannelModelPriceStatus,
    { text: string; type: 'success' | 'warning' }
  > = {
    1: { text: '启用', type: 'success' },
    2: { text: '停用', type: 'warning' }
  }

  const channelNameMap = computed(
    () =>
      new Map(channelOptions.value.map((item) => [item.id, `${item.name} (${item.vendorCode})`]))
  )

  const channelSearchOptions = computed(() =>
    channelOptions.value.map((item) => ({
      label: `${item.name} (${item.vendorCode})`,
      value: item.id
    }))
  )

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
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetAiChannelModelPriceList,
      apiParams: {
        page: 1,
        size: 20
      },
      columnsFactory: () => [
        {
          prop: 'channelId',
          label: '所属渠道',
          minWidth: 180,
          formatter: (row: ChannelModelPriceListItem) =>
            channelNameMap.value.get(row.channelId) || row.channelId
        },
        {
          prop: 'modelName',
          label: '模型名称',
          minWidth: 180
        },
        {
          prop: 'billingMode',
          label: '计费模式',
          width: 120,
          formatter: (row: ChannelModelPriceListItem) => billingModeLabelMap[row.billingMode]
        },
        {
          prop: 'currency',
          label: '货币',
          width: 90
        },
        {
          prop: 'priceConfig',
          label: '价格摘要',
          minWidth: 260,
          formatter: (row: ChannelModelPriceListItem) => buildPriceConfigSummary(row.priceConfig)
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: ChannelModelPriceListItem) =>
            h(ElTag, { type: statusTagMap[row.status].type }, () => statusTagMap[row.status].text)
        },
        {
          prop: 'referenceId',
          label: 'Reference ID',
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: 180
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: ChannelModelPriceListItem) =>
            h(ArtButtonMore, {
              list: [
                { key: 'detail', label: '查看详情', icon: 'ri:file-list-3-line' },
                { key: 'edit', label: '编辑价格', icon: 'ri:edit-2-line', auth: 'edit' },
                {
                  key: 'delete',
                  label: '删除价格',
                  icon: 'ri:delete-bin-4-line',
                  color: '#f56c6c',
                  auth: 'delete'
                }
              ],
              onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
            })
        }
      ]
    }
  })

  const loadChannelOptions = async () => {
    channelOptionsLoading.value = true
    try {
      const response = await fetchGetAiChannelList({
        page: 1,
        size: 200
      })
      channelOptions.value = response.content
    } finally {
      channelOptionsLoading.value = false
    }
  }

  onMounted(() => {
    void loadChannelOptions()
  })

  const handleSearch = (params: ChannelModelPriceSearchFormModel) => {
    Object.assign(searchParams, params)
    getData()
  }

  const showFormPanel = (mode: 'add' | 'edit', row?: ChannelModelPriceListItem) => {
    formPanelMode.value = mode
    currentPriceData.value = row
    formPanelVisible.value = true
  }

  const showDetailDialog = (row: ChannelModelPriceListItem) => {
    currentPriceId.value = row.id
    detailDialogVisible.value = true
  }

  const handleDelete = (row: ChannelModelPriceListItem) => {
    ElMessageBox.confirm(`确定删除模型价格“${row.modelName}”吗？`, '删除模型价格', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteAiChannelModelPrice(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ChannelModelPriceListItem) => {
    switch (item.key) {
      case 'detail':
        showDetailDialog(row)
        break
      case 'edit':
        showFormPanel('edit', row)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }

  const handleFormSuccess = () => {
    currentPriceData.value = undefined
    if (formPanelMode.value === 'add') {
      refreshCreate()
    } else {
      refreshUpdate()
    }
  }
</script>
