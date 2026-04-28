<template>
  <div class="channel-account-page art-full-height">
    <ChannelAccountSearch
      v-model="searchForm"
      :channel-options="channelOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card channel-account-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增渠道账号</ElButton>
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

      <ChannelAccountDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :account-data="currentAccountData"
        :channel-options="channelOptions"
        :pending-payload="oauthPendingPayload"
        :callback-params="oauthCallbackParams"
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
  import { fetchDeleteChannelAccount, fetchGetChannelAccountList } from '@/api/ai-channel-account'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    getChannelAccountStatusLabel,
    getChannelAccountStatusTagType,
    getCredentialTypeLabel,
    getSchedulableLabel,
    getSchedulableTagType
  } from './constants'
  import {
    clearOpenAiOAuthCallbackParamsFromUrl,
    getOpenAiOAuthCallbackParams,
    readOpenAiOAuthPendingPayload
  } from './oauth'
  import ChannelAccountDialog from './modules/channel-account-dialog.vue'
  import ChannelAccountSearch from './modules/channel-account-search.vue'
  import type {
    ChannelAccountListItem,
    ChannelOption,
    OpenAiOAuthCallbackParams,
    OpenAiOAuthPendingPayload,
    SearchFormModel
  } from './types'

  defineOptions({ name: 'AiChannelAccount' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentAccountData = ref<Partial<ChannelAccountListItem>>({})
  const channelOptions = ref<ChannelOption[]>([])
  const oauthPendingPayload = ref<OpenAiOAuthPendingPayload>()
  const oauthCallbackParams = ref<OpenAiOAuthCallbackParams>()

  const searchForm = ref<SearchFormModel>({
    channelId: undefined,
    status: undefined,
    credentialType: undefined,
    keyword: undefined
  })

  const getChannelLabel = (channelId: number) => {
    return channelOptions.value.find((item) => item.value === channelId)?.label ?? `#${channelId}`
  }

  const loadChannelOptions = async () => {
    const response = await fetchGetChannelList({ page: 1, size: 1000 })
    channelOptions.value = response.content.map((item) => ({
      label: `${item.name} (${item.vendorCode})`,
      value: item.id,
      channelType: item.channelType,
      status: item.status
    }))
  }

  const formatQuota = (used: number, limit: number) => {
    const usedText = Number(used || 0).toFixed(2)
    if (!limit || Number(limit) <= 0) return `${usedText} / 不限`
    return `${usedText} / ${Number(limit).toFixed(2)}`
  }

  const syncOpenAiOAuthCallbackState = () => {
    const callback = getOpenAiOAuthCallbackParams()
    const hasCallback = Boolean(callback.code) || Boolean(callback.state) || Boolean(callback.error)

    oauthPendingPayload.value = readOpenAiOAuthPendingPayload()
    oauthCallbackParams.value = hasCallback ? callback : undefined

    if (!hasCallback) return

    if (!oauthPendingPayload.value) {
      const title = callback.errorDescription || callback.error || '本地授权会话已失效'
      ElMessage.warning(`检测到 OpenAI OAuth 回跳参数，但无法恢复会话：${title}`)
      clearOpenAiOAuthCallbackParamsFromUrl()
      return
    }

    dialogType.value = oauthPendingPayload.value.mode === 'rebind' ? 'edit' : 'add'
    currentAccountData.value =
      oauthPendingPayload.value.mode === 'rebind'
        ? {
            id: oauthPendingPayload.value.accountId,
            channelId: oauthPendingPayload.value.channelId,
            name: oauthPendingPayload.value.name,
            remark: oauthPendingPayload.value.remark || '',
            testModel: oauthPendingPayload.value.testModel || ''
          }
        : {}
    dialogVisible.value = true
    clearOpenAiOAuthCallbackParamsFromUrl()
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
      apiFn: fetchGetChannelAccountList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'name',
          label: '账号',
          minWidth: 220,
          formatter: (row) =>
            h('div', { class: 'channel-account-cell' }, [
              h('div', { class: 'channel-account-cell__name' }, row.name),
              h(
                'div',
                { class: 'channel-account-cell__meta' },
                `${getCredentialTypeLabel(row.credentialType)}${row.secretRef ? ` · ${row.secretRef}` : ''}`
              )
            ])
        },
        {
          prop: 'channelId',
          label: '所属渠道',
          minWidth: 220,
          formatter: (row) =>
            h('div', { class: 'channel-account-cell' }, [
              h('div', { class: 'channel-account-cell__name' }, getChannelLabel(row.channelId)),
              h('div', { class: 'channel-account-cell__meta' }, `ID: ${row.channelId}`)
            ])
        },
        {
          prop: 'status',
          label: '状态',
          width: 110,
          formatter: (row) =>
            h(ElTag, { type: getChannelAccountStatusTagType(row.status) }, () =>
              getChannelAccountStatusLabel(row.status)
            )
        },
        {
          prop: 'schedulable',
          label: '调度',
          width: 110,
          formatter: (row) =>
            h(ElTag, { type: getSchedulableTagType(row.schedulable) }, () =>
              getSchedulableLabel(row.schedulable)
            )
        },
        {
          prop: 'quota',
          label: '额度',
          minWidth: 150,
          formatter: (row) => formatQuota(row.quotaUsed, row.quotaLimit)
        },
        {
          prop: 'rateMultiplier',
          label: '倍率',
          width: 90,
          formatter: (row) => `${Number(row.rateMultiplier || 0).toFixed(2)}x`
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
                { key: 'edit', label: '编辑账号', icon: 'ri:edit-2-line' },
                { key: 'delete', label: '删除账号', icon: 'ri:delete-bin-4-line', color: '#f56c6c' }
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

  const showDialog = (type: DialogType, row?: ChannelAccountListItem) => {
    dialogType.value = type
    currentAccountData.value = row || {}
    dialogVisible.value = true
  }

  const deleteAccount = (row: ChannelAccountListItem) => {
    ElMessageBox.confirm(`确定删除账号“${row.name}”吗？`, '删除渠道账号', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteChannelAccount(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ChannelAccountListItem) => {
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }
    if (item.key === 'delete') {
      deleteAccount(row)
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
    syncOpenAiOAuthCallbackState()
  })
</script>

<style scoped lang="scss">
  .channel-account-page {
    .channel-account-page-card {
      :deep(.el-card__body) {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
    }
  }

  .channel-account-cell {
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
</style>
