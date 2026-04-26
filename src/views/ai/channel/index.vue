<template>
  <div class="channel-page art-full-height">
    <ChannelSearch
      v-model="searchForm"
      :vendor-options="vendorOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card channel-page-card" shadow="never">
      <div class="channel-page__summary">
        <div
          v-for="item in summaryItems"
          :key="item.label"
          class="channel-page__summary-card"
          :class="`is-${item.type}`"
        >
          <span class="label">{{ item.label }}</span>
          <strong class="value">{{ item.value }}</strong>
        </div>
      </div>

      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增渠道</ElButton>
            <ElButton
              type="danger"
              plain
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
              v-ripple
            >
              批量删除
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <ChannelDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :channel-data="currentChannelData"
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
  import {
    fetchBatchDeleteChannels,
    fetchDeleteChannel,
    fetchGetChannelList,
    fetchGetChannelStatusCounts
  } from '@/api/ai-channel'
  import { fetchGetVendorList } from '@/api/ai-vendor'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    getChannelHealthStatusLabel,
    getChannelHealthTagType,
    getChannelStatusLabel,
    getChannelStatusTagType,
    getChannelTypeLabel
  } from './constants'
  import ChannelDialog from './modules/channel-dialog.vue'
  import ChannelSearch from './modules/channel-search.vue'
  import type { ChannelListItem, SearchFormModel, VendorOption } from './types'

  defineOptions({ name: 'AiChannel' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentChannelData = ref<Partial<ChannelListItem>>({})
  const selectedRows = ref<ChannelListItem[]>([])
  const vendorOptions = ref<VendorOption[]>([])
  const statusCounts = ref<Api.AiManage.ChannelStatusCountsVo>({
    enabled: 0,
    manualDisabled: 0,
    autoDisabled: 0,
    archived: 0,
    total: 0
  })

  const searchForm = ref<SearchFormModel>({
    keyword: undefined,
    status: undefined,
    channelType: undefined,
    vendorCode: undefined,
    channelGroup: undefined
  })

  const summaryItems = computed(() => [
    { label: '总数', value: statusCounts.value.total, type: 'default' },
    { label: '启用', value: statusCounts.value.enabled, type: 'success' },
    { label: '手动禁用', value: statusCounts.value.manualDisabled, type: 'info' },
    { label: '自动禁用', value: statusCounts.value.autoDisabled, type: 'warning' },
    { label: '归档', value: statusCounts.value.archived, type: 'danger' }
  ])

  const loadVendorOptions = async () => {
    const response = await fetchGetVendorList({ page: 1, size: 1000 })
    vendorOptions.value = response.content.map((item) => ({
      label: `${item.vendorName} (${item.vendorCode})`,
      value: item.vendorCode,
      enabled: item.enabled
    }))
  }

  const loadStatusCounts = async (channelType?: Api.AiManage.ChannelType) => {
    statusCounts.value = await fetchGetChannelStatusCounts({ channelType })
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
      apiFn: fetchGetChannelList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'name',
          label: '渠道',
          minWidth: 220,
          formatter: (row) =>
            h('div', { class: 'channel-cell' }, [
              h('div', { class: 'channel-cell__name' }, row.name),
              h('div', { class: 'channel-cell__meta' }, row.vendorCode)
            ])
        },
        {
          prop: 'channelType',
          label: '类型',
          width: 120,
          formatter: (row) => getChannelTypeLabel(row.channelType)
        },
        {
          prop: 'status',
          label: '状态',
          width: 120,
          formatter: (row) =>
            h(ElTag, { type: getChannelStatusTagType(row.status) }, () =>
              getChannelStatusLabel(row.status)
            )
        },
        { prop: 'channelGroup', label: '分组', width: 120 },
        {
          prop: 'models',
          label: '模型',
          minWidth: 180,
          formatter: (row) => {
            if (!row.models.length) return '-'
            const preview = row.models.slice(0, 2).join(', ')
            return row.models.length > 2 ? `${preview} +${row.models.length - 2}` : preview
          }
        },
        {
          prop: 'lastHealthStatus',
          label: '健康度',
          width: 110,
          formatter: (row) =>
            h(ElTag, { type: getChannelHealthTagType(row.lastHealthStatus) }, () =>
              getChannelHealthStatusLabel(row.lastHealthStatus)
            )
        },
        {
          prop: 'successRate',
          label: '成功率',
          width: 100,
          formatter: (row) => `${Number(row.successRate || 0).toFixed(1)}%`
        },
        {
          prop: 'responseTime',
          label: '响应(ms)',
          width: 110
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
                { key: 'edit', label: '编辑渠道', icon: 'ri:edit-2-line' },
                { key: 'delete', label: '删除渠道', icon: 'ri:delete-bin-4-line', color: '#f56c6c' }
              ],
              onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
            })
        }
      ]
    },
    hooks: {
      onSuccess: () => {
        void loadStatusCounts(searchForm.value.channelType)
      }
    }
  })

  const handleSearch = (params: SearchFormModel) => {
    replaceSearchParams(params)
    getData()
    void loadStatusCounts(params.channelType)
  }

  const handleSelectionChange = (rows: ChannelListItem[]) => {
    selectedRows.value = rows
  }

  const showDialog = (type: DialogType, row?: ChannelListItem) => {
    dialogType.value = type
    currentChannelData.value = row || {}
    dialogVisible.value = true
  }

  const deleteChannel = (row: ChannelListItem) => {
    ElMessageBox.confirm(`确定删除渠道“${row.name}”吗？`, '删除渠道', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteChannel(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
      await loadStatusCounts(searchForm.value.channelType)
    })
  }

  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return
    ElMessageBox.confirm(`确定删除已选中的 ${selectedRows.value.length} 个渠道吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchBatchDeleteChannels({ ids: selectedRows.value.map((item) => item.id) })
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      await refreshRemove()
      await loadStatusCounts(searchForm.value.channelType)
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ChannelListItem) => {
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }
    if (item.key === 'delete') {
      deleteChannel(row)
    }
  }

  const handleDialogSubmit = async (type: DialogType) => {
    if (type === 'add') {
      await refreshCreate()
    } else {
      await refreshUpdate()
    }
    await loadStatusCounts(searchForm.value.channelType)
  }

  onMounted(() => {
    void Promise.all([loadVendorOptions(), loadStatusCounts(searchForm.value.channelType)])
  })
</script>

<style scoped lang="scss">
  .channel-page {
    .channel-page-card {
      :deep(.el-card__body) {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
    }

    &__summary {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    &__summary-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 14px 16px;
      background: var(--default-box-color);
      border: 1px solid var(--default-border);
      border-radius: calc(var(--custom-radius) / 2 + 2px);

      .label {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }

      .value {
        font-size: 24px;
        line-height: 1;
        color: var(--el-text-color-primary);
      }

      &.is-success {
        border-color: var(--el-color-success-light-5);
      }

      &.is-warning {
        border-color: var(--el-color-warning-light-5);
      }

      &.is-danger {
        border-color: var(--el-color-danger-light-5);
      }
    }
  }

  .channel-cell {
    display: flex;
    flex-direction: column;
    min-width: 0;

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

  @media (width <= 992px) {
    .channel-page {
      &__summary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  }
</style>
