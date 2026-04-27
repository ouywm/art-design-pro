<template>
  <div class="token-page art-full-height">
    <TokenSearch
      v-model="searchForm"
      :user-options="userOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card token-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增令牌</ElButton>
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

      <TokenDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :token-data="currentTokenData"
        :user-options="userOptions"
        @submit="handleDialogSubmit"
      />

      <TokenDetailDialog
        v-model:visible="detailVisible"
        :token-id="currentTokenId"
        :user-options="userOptions"
      />

      <TokenKeyDialog v-model:visible="keyDialogVisible" :key-result="currentKeyResult" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import {
    fetchBatchDeleteTokens,
    fetchDeleteToken,
    fetchGetTokenList,
    fetchRotateTokenKey,
    fetchUpdateTokenStatus
  } from '@/api/ai-token'
  import { fetchGetUserList } from '@/api/system-manage'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { getTokenStatusLabel, getTokenStatusTagType } from './constants'
  import TokenDetailDialog from './modules/token-detail-dialog.vue'
  import TokenDialog from './modules/token-dialog.vue'
  import TokenKeyDialog from './modules/token-key-dialog.vue'
  import TokenSearch from './modules/token-search.vue'
  import type { SearchFormModel, TokenKeyResult, TokenListItem, UserOption } from './types'

  defineOptions({ name: 'AiToken' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const detailVisible = ref(false)
  const keyDialogVisible = ref(false)
  const currentTokenId = ref<number>()
  const currentTokenData = ref<Partial<TokenListItem>>({})
  const currentKeyResult = ref<TokenKeyResult>()
  const selectedRows = ref<TokenListItem[]>([])
  const userOptions = ref<UserOption[]>([])

  const searchForm = ref<SearchFormModel>({
    keyword: undefined,
    userId: undefined,
    status: undefined,
    keyPrefix: undefined,
    groupCodeOverride: undefined,
    serviceAccountId: undefined,
    projectId: undefined
  })

  const getUserLabel = (userId: number) => {
    return userOptions.value.find((item) => item.value === userId)?.label ?? `用户 #${userId}`
  }

  const formatLimit = (value: number) => (Number(value) === 0 ? '不限' : `${Number(value)}`)

  const formatListPreview = (values: string[], emptyLabel = '不限') => {
    if (!values.length) return emptyLabel
    const preview = values.slice(0, 2).join(', ')
    return values.length > 2 ? `${preview} +${values.length - 2}` : preview
  }

  const loadUserOptions = async () => {
    const response = await fetchGetUserList({ page: 1, size: 1000 })
    userOptions.value = response.content.map((item) => ({
      label: `${item.nickName} (${item.userName} / #${item.id})`,
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
      apiFn: fetchGetTokenList,
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
          label: '令牌',
          minWidth: 260,
          formatter: (row) =>
            h('div', { class: 'token-cell' }, [
              h('div', { class: 'token-cell__name' }, row.name),
              h(
                'div',
                { class: 'token-cell__meta' },
                `${row.keyPrefix} / ${getUserLabel(row.userId)}`
              )
            ])
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getTokenStatusTagType(row.status) }, () =>
              getTokenStatusLabel(row.status)
            )
        },
        {
          prop: 'quota',
          label: '额度',
          minWidth: 200,
          formatter: (row) =>
            h('div', { class: 'token-stack' }, [
              h('div', row.unlimitedQuota ? '总额度 不限' : `剩余 ${row.remainQuota}`),
              h('div', { class: 'token-stack__sub' }, `已用 ${row.usedQuota}`)
            ])
        },
        {
          prop: 'limits',
          label: '限流/上限',
          minWidth: 220,
          formatter: (row) =>
            h('div', { class: 'token-stack' }, [
              h('div', `RPM ${formatLimit(row.rpmLimit)} / TPM ${formatLimit(row.tpmLimit)}`),
              h(
                'div',
                { class: 'token-stack__sub' },
                `并发 ${formatLimit(row.concurrencyLimit)} / 日上限 ${formatLimit(row.dailyQuotaLimit)}`
              )
            ])
        },
        {
          prop: 'scope',
          label: '模型与 Endpoint',
          minWidth: 220,
          formatter: (row) =>
            h('div', { class: 'token-stack' }, [
              h('div', formatListPreview(row.models)),
              h('div', { class: 'token-stack__sub' }, formatListPreview(row.endpointScopes))
            ])
        },
        {
          prop: 'expireTime',
          label: '时效',
          minWidth: 200,
          formatter: (row) =>
            h('div', { class: 'token-stack' }, [
              h('div', row.expireTime || '永不过期'),
              h('div', { class: 'token-stack__sub' }, row.accessTime || '未使用')
            ])
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
                { key: 'detail', label: '查看详情', icon: 'ri:eye-line' },
                { key: 'edit', label: '编辑令牌', icon: 'ri:edit-2-line' },
                {
                  key: 'status',
                  label: row.status === 1 ? '禁用令牌' : '启用令牌',
                  icon: row.status === 1 ? 'ri:pause-circle-line' : 'ri:play-circle-line'
                },
                { key: 'rotate', label: '轮换密钥', icon: 'ri:refresh-line' },
                { key: 'delete', label: '删除令牌', icon: 'ri:delete-bin-4-line', color: '#f56c6c' }
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

  const handleSelectionChange = (rows: TokenListItem[]) => {
    selectedRows.value = rows
  }

  const showDialog = (type: DialogType, row?: TokenListItem) => {
    dialogType.value = type
    currentTokenData.value = row || {}
    dialogVisible.value = true
  }

  const showDetail = (row: TokenListItem) => {
    currentTokenId.value = row.id
    detailVisible.value = true
  }

  const showKeyDialog = (result: TokenKeyResult) => {
    currentKeyResult.value = result
    keyDialogVisible.value = true
  }

  const deleteToken = (row: TokenListItem) => {
    ElMessageBox.confirm(`确定删除令牌“${row.name}”吗？`, '删除令牌', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteToken(row.id)
      ElMessage.success('删除成功')
      selectedRows.value = selectedRows.value.filter((item) => item.id !== row.id)
      await refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return

    ElMessageBox.confirm(`确定删除已选中的 ${selectedRows.value.length} 个令牌吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      const result = await fetchBatchDeleteTokens({
        ids: selectedRows.value.map((item) => item.id)
      })
      ElMessage.success(`已删除 ${result.deleted} 个令牌`)
      selectedRows.value = []
      await refreshRemove()
    })
  }

  const updateTokenStatus = (row: TokenListItem) => {
    const nextStatus: Api.AiManage.TokenStatus = row.status === 1 ? 2 : 1
    const actionText = nextStatus === 1 ? '启用' : '禁用'

    ElMessageBox.confirm(`确定${actionText}令牌“${row.name}”吗？`, `${actionText}令牌`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchUpdateTokenStatus(row.id, { status: nextStatus })
      ElMessage.success(`${actionText}成功`)
      await refreshUpdate()
    })
  }

  const rotateTokenKey = (row: TokenListItem) => {
    ElMessageBox.confirm(`确定轮换令牌“${row.name}”的密钥吗？旧密钥会立即失效。`, '轮换密钥', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      const result = await fetchRotateTokenKey(row.id)
      ElMessage.success('密钥已轮换')
      showKeyDialog({
        action: 'rotate',
        tokenName: row.name,
        keyPrefix: result.keyPrefix,
        rawKey: result.rawKey
      })
      await refreshUpdate()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: TokenListItem) => {
    if (item.key === 'detail') {
      showDetail(row)
      return
    }

    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }

    if (item.key === 'status') {
      updateTokenStatus(row)
      return
    }

    if (item.key === 'rotate') {
      rotateTokenKey(row)
      return
    }

    if (item.key === 'delete') {
      deleteToken(row)
    }
  }

  const handleDialogSubmit = async (type: DialogType, result?: Api.AiManage.CreatedTokenVo) => {
    if (type === 'add') {
      await refreshCreate()
      if (result) {
        showKeyDialog({
          action: 'create',
          tokenName: result.token.name,
          keyPrefix: result.token.keyPrefix,
          rawKey: result.rawKey
        })
      }
      return
    }

    await refreshUpdate()
  }

  onMounted(async () => {
    await Promise.all([getData(), loadUserOptions()])
  })
</script>

<style scoped lang="scss">
  .token-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .token-page-card {
    flex: 1;
  }

  .token-cell {
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
      line-height: 1.4;
      color: var(--art-text-gray-500);
    }
  }

  .token-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &__sub {
      font-size: 12px;
      line-height: 1.4;
      color: var(--art-text-gray-500);
    }
  }
</style>
