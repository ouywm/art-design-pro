<template>
  <div class="art-full-height">
    <ChannelAccountSearch
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
            <ElButton type="primary" @click="showFormPanel('add')" v-ripple>新增渠道账号</ElButton>
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

    <ChannelAccountFormPanel
      v-model="formPanelVisible"
      :panel-mode="formPanelMode"
      :account-data="currentAccountData"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import {
    fetchDeleteAiChannelAccount,
    fetchGetAiChannelAccountList,
    fetchGetAiChannelList
  } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { dictClassToTagType, useDict } from '@/utils/dict'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { AI_CHANNEL_ACCOUNT_STATUS_OPTIONS, getNumericEnumMeta } from '../enum-options'
  import ChannelAccountFormPanel from './modules/channel-account-form-panel.vue'
  import ChannelAccountSearch from './modules/channel-account-search.vue'
  import type {
    ChannelAccountListItem,
    ChannelAccountSearchFormModel,
    ChannelAccountStatus
  } from './types'

  defineOptions({ name: 'AiChannelAccount' })
  const { getDict, hasDictType } = useDict()

  const showSearchBar = ref(false)
  const formPanelVisible = ref(false)
  const formPanelMode = ref<'add' | 'edit'>('add')
  const currentAccountData = ref<ChannelAccountListItem | undefined>(undefined)
  const channelOptionsLoading = ref(false)
  const channelOptions = ref<Api.AiChannel.ChannelListItem[]>([])

  const searchForm = ref<ChannelAccountSearchFormModel>({
    channelId: undefined,
    name: undefined,
    status: undefined,
    schedulable: undefined
  })

  const getChannelAccountStatusMeta = (value: ChannelAccountStatus) => {
    const meta = getNumericEnumMeta(
      hasDictType('ai_channel_account_status') ? getDict('ai_channel_account_status') : undefined,
      AI_CHANNEL_ACCOUNT_STATUS_OPTIONS,
      value
    )

    return {
      text: meta.label,
      type: dictClassToTagType(meta.listClass || '')
    }
  }

  const channelNameMap = computed(() => {
    return new Map(channelOptions.value.map((item) => [item.id, item.name]))
  })

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
      apiFn: fetchGetAiChannelAccountList,
      apiParams: {
        page: 1,
        size: 20
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '账号名称',
          minWidth: 180
        },
        {
          prop: 'channelId',
          label: '所属渠道',
          minWidth: 180,
          formatter: (row: ChannelAccountListItem) =>
            channelNameMap.value.get(row.channelId) || row.channelId
        },
        {
          prop: 'credentialType',
          label: '凭证类型',
          minWidth: 140
        },
        {
          prop: 'secretRef',
          label: 'Secret Ref',
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'status',
          label: '状态',
          width: 110,
          formatter: (row: ChannelAccountListItem) => {
            const statusMeta = getChannelAccountStatusMeta(row.status)
            return h(ElTag, { type: statusMeta.type }, () => statusMeta.text)
          }
        },
        {
          prop: 'schedulable',
          label: '可调度',
          width: 100,
          formatter: (row: ChannelAccountListItem) =>
            h(ElTag, { type: row.schedulable ? 'success' : 'info' }, () =>
              row.schedulable ? '可调度' : '不可调度'
            )
        },
        {
          prop: 'quotaUsed',
          label: '已用额度',
          width: 110
        },
        {
          prop: 'balance',
          label: '余额',
          width: 110
        },
        {
          prop: 'expiresAt',
          label: '过期时间',
          width: 180,
          formatter: (row: ChannelAccountListItem) => row.expiresAt || '-'
        },
        {
          prop: 'lastUsedAt',
          label: '最近使用',
          width: 180,
          formatter: (row: ChannelAccountListItem) => row.lastUsedAt || '-'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: ChannelAccountListItem) =>
            h(ArtButtonMore, {
              list: [
                { key: 'edit', label: '编辑账号', icon: 'ri:edit-2-line', auth: 'edit' },
                {
                  key: 'delete',
                  label: '删除账号',
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

  const handleSearch = (params: ChannelAccountSearchFormModel) => {
    Object.assign(searchParams, params)
    getData()
  }

  const showFormPanel = (mode: 'add' | 'edit', row?: ChannelAccountListItem) => {
    formPanelMode.value = mode
    currentAccountData.value = row
    formPanelVisible.value = true
  }

  const handleDelete = (row: ChannelAccountListItem) => {
    ElMessageBox.confirm(`确定删除渠道账号“${row.name}”吗？`, '删除渠道账号', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteAiChannelAccount(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ChannelAccountListItem) => {
    switch (item.key) {
      case 'edit':
        showFormPanel('edit', row)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }

  const handleFormSuccess = async () => {
    currentAccountData.value = undefined
    await loadChannelOptions()
    if (formPanelMode.value === 'add') {
      refreshCreate()
    } else {
      refreshUpdate()
    }
  }
</script>
