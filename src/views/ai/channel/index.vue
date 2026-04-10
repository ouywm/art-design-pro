<template>
  <div class="art-full-height">
    <ChannelSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" :style="{ 'margin-top': showSearchBar ? '12px' : '0' }">
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showFormPanel('add')" v-ripple>新增渠道</ElButton>
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

    <ChannelFormPanel
      v-model="formPanelVisible"
      :panel-mode="formPanelMode"
      :channel-data="currentChannelData"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { fetchDeleteAiChannel, fetchGetAiChannelList } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { dictClassToTagType, useDict } from '@/utils/dict'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    AI_CHANNEL_STATUS_OPTIONS,
    AI_CHANNEL_TYPE_OPTIONS,
    getNumericEnumMeta
  } from '../enum-options'
  import ChannelFormPanel from './modules/channel-form-panel.vue'
  import ChannelSearch from './modules/channel-search.vue'
  import type { ChannelListItem, ChannelSearchFormModel, ChannelStatus, ChannelType } from './types'

  defineOptions({ name: 'AiChannel' })
  const { getDict, hasDictType } = useDict()

  const showSearchBar = ref(false)
  const formPanelVisible = ref(false)
  const formPanelMode = ref<'add' | 'edit'>('add')
  const currentChannelData = ref<ChannelListItem | undefined>(undefined)

  const searchForm = ref<ChannelSearchFormModel>({
    name: undefined,
    vendorCode: undefined,
    status: undefined,
    channelType: undefined,
    channelGroup: undefined
  })

  const getChannelTypeLabel = (value: ChannelType) =>
    getNumericEnumMeta(
      hasDictType('ai_channel_type') ? getDict('ai_channel_type') : undefined,
      AI_CHANNEL_TYPE_OPTIONS,
      value
    ).label

  const getChannelStatusMeta = (value: ChannelStatus) => {
    const meta = getNumericEnumMeta(
      hasDictType('ai_channel_status') ? getDict('ai_channel_status') : undefined,
      AI_CHANNEL_STATUS_OPTIONS,
      value
    )

    return {
      text: meta.label,
      type: dictClassToTagType(meta.listClass || '')
    }
  }

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
      apiFn: fetchGetAiChannelList,
      apiParams: {
        page: 1,
        size: 20
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '渠道名称',
          minWidth: 180
        },
        {
          prop: 'channelType',
          label: '渠道类型',
          width: 140,
          formatter: (row: ChannelListItem) => getChannelTypeLabel(row.channelType)
        },
        {
          prop: 'vendorCode',
          label: '供应商编码',
          width: 140
        },
        {
          prop: 'channelGroup',
          label: '渠道分组',
          width: 140
        },
        {
          prop: 'status',
          label: '状态',
          width: 110,
          formatter: (row: ChannelListItem) => {
            const statusMeta = getChannelStatusMeta(row.status)
            return h(ElTag, { type: statusMeta.type }, () => statusMeta.text)
          }
        },
        {
          prop: 'baseUrl',
          label: '基础地址',
          minWidth: 220,
          showOverflowTooltip: true
        },
        {
          prop: 'usedQuota',
          label: '已用额度',
          width: 110
        },
        {
          prop: 'responseTime',
          label: '响应时间',
          width: 110,
          formatter: (row: ChannelListItem) => `${row.responseTime} ms`
        },
        {
          prop: 'failureStreak',
          label: '连续失败',
          width: 110
        },
        {
          prop: 'lastUsedAt',
          label: '最近使用',
          width: 180,
          formatter: (row: ChannelListItem) => row.lastUsedAt || '-'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: ChannelListItem) =>
            h(ArtButtonMore, {
              list: [
                { key: 'edit', label: '编辑渠道', icon: 'ri:edit-2-line', auth: 'edit' },
                {
                  key: 'delete',
                  label: '删除渠道',
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

  const handleSearch = (params: ChannelSearchFormModel) => {
    Object.assign(searchParams, params)
    getData()
  }

  const showFormPanel = (mode: 'add' | 'edit', row?: ChannelListItem) => {
    formPanelMode.value = mode
    currentChannelData.value = row
    formPanelVisible.value = true
  }

  const handleDelete = (row: ChannelListItem) => {
    ElMessageBox.confirm(`确定删除渠道“${row.name}”吗？`, '删除渠道', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteAiChannel(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ChannelListItem) => {
    switch (item.key) {
      case 'edit':
        showFormPanel('edit', row)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }

  const handleFormSuccess = () => {
    currentChannelData.value = undefined
    if (formPanelMode.value === 'add') {
      refreshCreate()
    } else {
      refreshUpdate()
    }
  }
</script>
