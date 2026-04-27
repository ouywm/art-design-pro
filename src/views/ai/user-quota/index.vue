<template>
  <div class="user-quota-page art-full-height">
    <UserQuotaSearch
      v-model="searchForm"
      :user-options="userOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card user-quota-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增用户额度</ElButton>
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

      <UserQuotaDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :quota-data="currentQuotaData"
        :user-options="userOptions"
        @submit="handleDialogSubmit"
      />

      <UserQuotaAdjustDialog
        v-model:visible="adjustDialogVisible"
        :quota-data="currentQuotaData"
        :user-label="getUserLabel(currentQuotaData.userId)"
        @submit="handleAdjustSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import { fetchGetUserList } from '@/api/system-manage'
  import { fetchGetUserQuotaList } from '@/api/ai-user-quota'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElTag } from 'element-plus'
  import { getUserQuotaStatusLabel, getUserQuotaStatusTagType } from './constants'
  import UserQuotaAdjustDialog from './modules/user-quota-adjust-dialog.vue'
  import UserQuotaDialog from './modules/user-quota-dialog.vue'
  import UserQuotaSearch from './modules/user-quota-search.vue'
  import type { SearchFormModel, UserOption, UserQuotaListItem } from './types'

  defineOptions({ name: 'AiUserQuota' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const adjustDialogVisible = ref(false)
  const currentQuotaData = ref<Partial<UserQuotaListItem>>({})
  const userOptions = ref<UserOption[]>([])

  const searchForm = ref<SearchFormModel>({
    userId: undefined,
    status: undefined,
    channelGroup: undefined,
    keyword: undefined
  })

  const formatLimit = (value: number) => (Number(value) === 0 ? '不限' : `${Number(value)}`)

  const getUserLabel = (userId?: number) => {
    if (typeof userId !== 'number') return '-'
    return userOptions.value.find((item) => item.value === userId)?.label ?? `用户 #${userId}`
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
    refreshUpdate
  } = useTable({
    core: {
      apiFn: fetchGetUserQuotaList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'userId',
          label: '用户',
          minWidth: 220,
          formatter: (row) =>
            h('div', { class: 'user-quota-user' }, [
              h('div', { class: 'user-quota-user__name' }, getUserLabel(row.userId)),
              h('div', { class: 'user-quota-user__meta' }, `ID ${row.userId}`)
            ])
        },
        {
          prop: 'channelGroup',
          label: '渠道分组',
          minWidth: 140
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getUserQuotaStatusTagType(row.status) }, () =>
              getUserQuotaStatusLabel(row.status)
            )
        },
        {
          prop: 'quota',
          label: '额度',
          minWidth: 190,
          formatter: (row) =>
            h('div', { class: 'user-quota-metric' }, [
              h('div', `总 ${row.quota}`),
              h(
                'div',
                { class: 'user-quota-metric__sub' },
                `已用 ${row.usedQuota} / 剩余 ${row.remainingQuota}`
              )
            ])
        },
        {
          prop: 'limits',
          label: '周期上限',
          minWidth: 190,
          formatter: (row) =>
            h('div', { class: 'user-quota-metric' }, [
              h('div', `日 ${formatLimit(row.dailyQuotaLimit)}`),
              h(
                'div',
                { class: 'user-quota-metric__sub' },
                `月 ${formatLimit(row.monthlyQuotaLimit)}`
              )
            ])
        },
        {
          prop: 'usage',
          label: '窗口使用',
          minWidth: 190,
          formatter: (row) =>
            h('div', { class: 'user-quota-metric' }, [
              h('div', `日用量 ${row.dailyUsedQuota}`),
              h('div', { class: 'user-quota-metric__sub' }, `月用量 ${row.monthlyUsedQuota}`)
            ])
        },
        {
          prop: 'requestCount',
          label: '请求数',
          width: 110
        },
        {
          prop: 'lastRequestTime',
          label: '最后请求',
          minWidth: 170,
          formatter: (row) => row.lastRequestTime || '-'
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
                { key: 'edit', label: '编辑额度', icon: 'ri:edit-2-line' },
                { key: 'adjust', label: '调整额度', icon: 'ri:exchange-funds-line' }
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

  const showDialog = (type: DialogType, row?: UserQuotaListItem) => {
    dialogType.value = type
    currentQuotaData.value = row || {}
    dialogVisible.value = true
  }

  const showAdjustDialog = (row: UserQuotaListItem) => {
    currentQuotaData.value = row
    adjustDialogVisible.value = true
  }

  const handleMoreClick = (item: ButtonMoreItem, row: UserQuotaListItem) => {
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }

    if (item.key === 'adjust') {
      showAdjustDialog(row)
    }
  }

  const handleDialogSubmit = async (type: DialogType) => {
    if (type === 'add') {
      await refreshCreate()
    } else {
      await refreshUpdate()
    }
  }

  const handleAdjustSubmit = async () => {
    await refreshUpdate()
  }

  onMounted(async () => {
    await Promise.all([getData(), loadUserOptions()])
  })
</script>

<style scoped lang="scss">
  .user-quota-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .user-quota-page-card {
    flex: 1;
  }

  .user-quota-user {
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

  .user-quota-metric {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &__sub {
      font-size: 12px;
      line-height: 1.2;
      color: var(--art-text-gray-500);
    }
  }
</style>
