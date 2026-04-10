<template>
  <div class="art-full-height">
    <AlertSilenceSearch
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
            <ElButton type="primary" @click="formVisible = true" v-ripple>新增告警静默</ElButton>
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

    <AlertSilenceFormPanel v-model="formVisible" @success="handleCreateSuccess" />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { fetchDeleteAiAlertSilence, fetchGetAiAlertSilenceList } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { formatJsonValue } from '@/views/ai/request/helpers'
  import { formatAlertSilenceTime, getAlertSilenceStatusMeta } from './helpers'
  import AlertSilenceFormPanel from './modules/alert-silence-form-panel.vue'
  import AlertSilenceSearch from './modules/alert-silence-search.vue'
  import type { AlertSilenceListItem, AlertSilenceSearchFormModel } from './types'

  defineOptions({ name: 'AiAlertSilence' })

  const showSearchBar = ref(false)
  const formVisible = ref(false)

  const searchForm = ref<AlertSilenceSearchFormModel>({
    alertRuleId: undefined,
    status: undefined,
    scopeType: undefined,
    scopeKey: undefined
  })

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
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetAiAlertSilenceList,
      apiParams: {
        page: 1,
        size: 20
      },
      columnsFactory: () => [
        {
          prop: 'alertRuleId',
          label: '规则 / 范围',
          minWidth: 220,
          showOverflowTooltip: false,
          formatter: (row: AlertSilenceListItem) =>
            h('div', { class: 'silence-info-cell' }, [
              h('div', { class: 'silence-main' }, `Rule #${row.alertRuleId}`),
              h(
                'div',
                { class: 'silence-subtext' },
                `${row.scopeType}${row.scopeKey ? ` / ${row.scopeKey}` : ''}`
              )
            ])
        },
        {
          prop: 'reason',
          label: '静默原因',
          minWidth: 220,
          showOverflowTooltip: true,
          formatter: (row: AlertSilenceListItem) => row.reason || '-'
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: AlertSilenceListItem) =>
            h(
              ElTag,
              { type: getAlertSilenceStatusMeta(row.status).type, size: 'small' },
              () => getAlertSilenceStatusMeta(row.status).text
            )
        },
        {
          prop: 'startTime',
          label: '开始时间',
          width: 180,
          formatter: (row: AlertSilenceListItem) => formatAlertSilenceTime(row.startTime)
        },
        {
          prop: 'endTime',
          label: '结束时间',
          width: 180,
          formatter: (row: AlertSilenceListItem) => formatAlertSilenceTime(row.endTime)
        },
        {
          prop: 'metadata',
          label: 'Metadata',
          minWidth: 220,
          showOverflowTooltip: true,
          formatter: (row: AlertSilenceListItem) => formatJsonValue(row.metadata) || '-'
        },
        {
          prop: 'createBy',
          label: '创建人',
          width: 120
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 180,
          formatter: (row: AlertSilenceListItem) => formatAlertSilenceTime(row.createTime)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: AlertSilenceListItem) =>
            h(ArtButtonMore, {
              list: [
                {
                  key: 'delete',
                  label: '删除静默',
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

  const handleSearch = (params: AlertSilenceSearchFormModel) => {
    Object.assign(searchParams, params)
    getData()
  }

  const handleDelete = (row: AlertSilenceListItem) => {
    ElMessageBox.confirm(`确定删除这条告警静默记录吗？`, '删除告警静默', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteAiAlertSilence(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: AlertSilenceListItem) => {
    switch (item.key) {
      case 'delete':
        handleDelete(row)
        break
    }
  }

  const handleCreateSuccess = () => {
    refreshCreate()
  }
</script>

<style scoped lang="scss">
  .silence-info-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    justify-content: center;
    min-height: 42px;
  }

  .silence-main {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .silence-subtext {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    word-break: break-all;
  }
</style>
