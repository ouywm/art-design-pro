<template>
  <div class="art-full-height">
    <AlertRuleSearch
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
            <ElButton type="primary" @click="showFormPanel('add')" v-ripple>新增告警规则</ElButton>
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

    <AlertRuleFormPanel
      v-model="formPanelVisible"
      :panel-mode="formPanelMode"
      :rule-data="currentRuleData"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { fetchDeleteAiAlertRule, fetchGetAiAlertRuleList } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    buildAlertRuleJsonSummary,
    getAlertRuleSeverityMeta,
    getAlertRuleStatusMeta
  } from './helpers'
  import AlertRuleFormPanel from './modules/alert-rule-form-panel.vue'
  import AlertRuleSearch from './modules/alert-rule-search.vue'
  import type { AlertRuleListItem, AlertRuleSearchFormModel } from './types'

  defineOptions({ name: 'AiAlertRule' })

  const showSearchBar = ref(false)
  const formPanelVisible = ref(false)
  const formPanelMode = ref<'add' | 'edit'>('add')
  const currentRuleData = ref<AlertRuleListItem | undefined>(undefined)

  const searchForm = ref<AlertRuleSearchFormModel>({
    domainCode: undefined,
    ruleCode: undefined,
    metricKey: undefined,
    status: undefined,
    severity: undefined
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
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetAiAlertRuleList,
      apiParams: {
        page: 1,
        size: 20
      },
      columnsFactory: () => [
        {
          prop: 'ruleName',
          label: '规则信息',
          minWidth: 220,
          showOverflowTooltip: false,
          formatter: (row: AlertRuleListItem) =>
            h('div', { class: 'rule-info-cell' }, [
              h('div', { class: 'rule-name' }, row.ruleName),
              h('div', { class: 'rule-subtext' }, `${row.ruleCode} / ${row.domainCode}`)
            ])
        },
        {
          prop: 'severity',
          label: '严重级别',
          width: 110,
          formatter: (row: AlertRuleListItem) =>
            h(
              ElTag,
              { type: getAlertRuleSeverityMeta(row.severity).type, size: 'small' },
              () => getAlertRuleSeverityMeta(row.severity).text
            )
        },
        {
          prop: 'metricKey',
          label: '指标键',
          minWidth: 180
        },
        {
          prop: 'conditionExpr',
          label: '条件表达式',
          minWidth: 220,
          showOverflowTooltip: true,
          formatter: (row: AlertRuleListItem) => row.conditionExpr || '-'
        },
        {
          prop: 'thresholdConfig',
          label: '阈值配置',
          minWidth: 220,
          formatter: (row: AlertRuleListItem) => buildAlertRuleJsonSummary(row.thresholdConfig)
        },
        {
          prop: 'channelConfig',
          label: '通知配置',
          minWidth: 220,
          formatter: (row: AlertRuleListItem) => buildAlertRuleJsonSummary(row.channelConfig)
        },
        {
          prop: 'silenceSeconds',
          label: '静默秒数',
          width: 110
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: AlertRuleListItem) =>
            h(
              ElTag,
              { type: getAlertRuleStatusMeta(row.status).type, size: 'small' },
              () => getAlertRuleStatusMeta(row.status).text
            )
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
          formatter: (row: AlertRuleListItem) =>
            h(ArtButtonMore, {
              list: [
                { key: 'edit', label: '编辑规则', icon: 'ri:edit-2-line', auth: 'edit' },
                {
                  key: 'delete',
                  label: '删除规则',
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

  const handleSearch = (params: AlertRuleSearchFormModel) => {
    Object.assign(searchParams, params)
    getData()
  }

  const showFormPanel = (mode: 'add' | 'edit', row?: AlertRuleListItem) => {
    formPanelMode.value = mode
    currentRuleData.value = row
    formPanelVisible.value = true
  }

  const handleDelete = (row: AlertRuleListItem) => {
    ElMessageBox.confirm(`确定删除告警规则“${row.ruleName}”吗？`, '删除告警规则', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteAiAlertRule(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: AlertRuleListItem) => {
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
    currentRuleData.value = undefined
    if (formPanelMode.value === 'add') {
      refreshCreate()
    } else {
      refreshUpdate()
    }
  }
</script>

<style scoped lang="scss">
  .rule-info-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    justify-content: center;
    min-height: 42px;
  }

  .rule-name {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .rule-subtext {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    word-break: break-all;
  }
</style>
