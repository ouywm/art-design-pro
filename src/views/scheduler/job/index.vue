<template>
  <div class="scheduler-job-page art-full-height">
    <JobSearch
      v-model="searchForm"
      :handler-options="handlerOptions"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card scheduler-job-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showFormPanel('add')" v-ripple>新增任务</ElButton>
            <ElButton plain @click="goRunListAll">任务日志</ElButton>
            <ElDivider direction="vertical" />
            <ElButton
              type="success"
              plain
              :disabled="!selectedIds.length"
              @click="batchToggle(true)"
            >
              批量启用 ({{ selectedIds.length }})
            </ElButton>
            <ElButton
              type="warning"
              plain
              :disabled="!selectedIds.length"
              @click="batchToggle(false)"
            >
              批量停用
            </ElButton>
            <ElButton plain :disabled="!selectedIds.length" @click="batchTrigger">
              批量执行
            </ElButton>
            <ElButton type="danger" plain :disabled="!selectedIds.length" @click="batchDelete">
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

      <JobFormPanel
        v-model:visible="formVisible"
        :type="dialogType"
        :job-data="currentJobData"
        :handler-options="handlerOptions"
        :handler-loading="handlerLoading"
        @submit="handleFormSubmit"
      />

      <JobTriggerDialog
        v-model:visible="triggerVisible"
        :job-id="currentJobId"
        :job-name="currentJobName"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import {
    fetchBatchDeleteJobs,
    fetchBatchToggleJobs,
    fetchBatchTriggerJobs,
    fetchDeleteJob,
    fetchGetJobList,
    fetchToggleJob
  } from '@/api/scheduler-job'
  import { fetchGetHandlers } from '@/api/scheduler-handler'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { getHandlerLabel } from './handler-meta'
  import JobSearch from './modules/job-search.vue'
  import JobFormPanel from './modules/job-form-panel.vue'
  import JobTriggerDialog from './modules/job-trigger-dialog.vue'
  import type { HandlerOption, JobListItem, SearchFormModel } from './types'

  defineOptions({ name: 'SchedulerJob' })

  const router = useRouter()

  const dialogType = ref<DialogType>('add')
  const formVisible = ref(false)
  const triggerVisible = ref(false)

  const currentJobData = ref<Partial<JobListItem>>({})
  const currentJobId = ref<number>()
  const currentJobName = ref<string>()

  const handlerOptions = ref<HandlerOption[]>([])
  const handlerLoading = ref(false)

  const searchForm = ref<SearchFormModel>({
    name: undefined,
    groupName: undefined,
    handler: undefined,
    scheduleType: undefined,
    enabled: undefined,
    tenantId: undefined
  })

  const loadHandlers = async () => {
    handlerLoading.value = true
    try {
      const result = await fetchGetHandlers()
      handlerOptions.value = result.map((item) => ({
        label: getHandlerLabel(item.name),
        value: item.name,
        description: item.description
      }))
    } finally {
      handlerLoading.value = false
    }
  }

  const goRunListAll = () => {
    router.push('/scheduler/run')
  }

  const handleMoreClick = (item: ButtonMoreItem, row: JobListItem) => {
    switch (item.key) {
      case 'edit':
        showFormPanel('edit', row)
        break
      case 'toggle':
        toggleEnabled(row)
        break
      case 'trigger':
        showTriggerDialog(row)
        break
      case 'delete':
        deleteJob(row)
        break
    }
  }

  const renderActionRow = (row: JobListItem) =>
    h(ArtButtonMore, {
      list: [
        { key: 'edit', label: '编辑', icon: 'ri:edit-2-line' },
        {
          key: 'toggle',
          label: row.enabled ? '停用' : '启用',
          icon: row.enabled ? 'ri:pause-circle-line' : 'ri:play-circle-line'
        },
        { key: 'trigger', label: '手动触发', icon: 'ri:flashlight-line' },
        { key: 'delete', label: '删除', icon: 'ri:delete-bin-4-line', color: '#f56c6c' }
      ],
      onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
    })

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove,
    searchParams
  } = useTable({
    core: {
      apiFn: fetchGetJobList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection', width: 50, fixed: 'left', align: 'center' },
        { prop: 'name', label: '任务名称', minWidth: 180 },
        {
          prop: 'handler',
          label: '处理器',
          minWidth: 200,
          formatter: (row) =>
            h('div', { class: 'handler-cell' }, [
              h('div', { class: 'handler-cell__code' }, row.handler)
            ])
        },
        {
          prop: 'cronExpr',
          label: 'Cron 表达式',
          minWidth: 160,
          formatter: (row) => h('span', { class: 'job-cron' }, row.cronExpr || '-')
        },
        {
          prop: 'enabled',
          label: '状态',
          width: 90,
          formatter: (row) =>
            h(ElTag, { type: row.enabled ? 'success' : 'info', size: 'small' }, () =>
              row.enabled ? '启用' : '停用'
            )
        },
        { prop: 'groupName', label: '分组', width: 120 },
        { prop: 'updateTime', label: '更新时间', minWidth: 170 },
        {
          prop: 'operation',
          label: '操作',
          width: 90,
          fixed: 'right',
          align: 'center',
          formatter: renderActionRow
        }
      ]
    }
  })

  const handleSearch = (params: SearchFormModel) => {
    Object.assign(searchParams, params)
    getData()
  }

  const handleReset = () => {
    Object.assign(searchForm.value, {
      name: undefined,
      groupName: undefined,
      handler: undefined,
      scheduleType: undefined,
      enabled: undefined,
      tenantId: undefined
    })
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  const showFormPanel = (type: DialogType, row?: JobListItem) => {
    dialogType.value = type
    currentJobData.value = row || {}
    formVisible.value = true
  }

  const showTriggerDialog = (row: JobListItem) => {
    currentJobId.value = row.id
    currentJobName.value = row.name
    triggerVisible.value = true
  }

  const toggleEnabled = (row: JobListItem) => {
    const next = !row.enabled
    const action = next ? '启用' : '停用'
    ElMessageBox.confirm(`确定${action}任务「${row.name}」吗?`, `${action}任务`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchToggleJob(row.id, { enabled: next })
      ElMessage.success(`${action}成功`)
      await refreshUpdate()
    })
  }

  const deleteJob = (row: JobListItem) => {
    ElMessageBox.confirm(`确定删除任务「${row.name}」吗?如有依赖关系会被后端拒绝。`, '删除任务', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteJob(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
    })
  }

  // ============ 批量操作 ============

  const selectedRows = ref<JobListItem[]>([])
  const selectedIds = computed(() => selectedRows.value.map((r) => r.id))

  const handleSelectionChange = (rows: JobListItem[]) => {
    selectedRows.value = rows
  }

  const showBatchResult = (result: Api.Scheduler.BatchResultVo, action: string) => {
    if (result.failedCount === 0) {
      ElMessage.success(`${action}成功 ${result.successCount} 条`)
      return
    }
    const lines = result.failures
      .slice(0, 5)
      .map((f) => `#${f.id}: ${f.reason}`)
      .join('<br/>')
    const more = result.failures.length > 5 ? `<br/>...其余 ${result.failures.length - 5} 条` : ''
    ElMessageBox.alert(
      `成功 ${result.successCount} 条,失败 ${result.failedCount} 条<br/><br/>${lines}${more}`,
      `${action}部分失败`,
      { dangerouslyUseHTMLString: true, type: 'warning' }
    )
  }

  const ensureBatchSize = () => {
    if (selectedIds.value.length === 0) {
      ElMessage.warning('请先选择任务')
      return false
    }
    if (selectedIds.value.length > 100) {
      ElMessage.warning('单次批量操作上限 100 条')
      return false
    }
    return true
  }

  const batchToggle = (enabled: boolean) => {
    if (!ensureBatchSize()) return
    const action = enabled ? '启用' : '停用'
    ElMessageBox.confirm(
      `确定${action}选中的 ${selectedIds.value.length} 个任务吗?`,
      `批量${action}`,
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    ).then(async () => {
      const result = await fetchBatchToggleJobs({ ids: selectedIds.value, enabled })
      showBatchResult(result, `批量${action}`)
      selectedRows.value = []
      await refreshUpdate()
    })
  }

  const batchTrigger = () => {
    if (!ensureBatchSize()) return
    ElMessageBox.confirm(`确定执行选中的 ${selectedIds.value.length} 个任务吗?`, '批量执行', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      const result = await fetchBatchTriggerJobs({ ids: selectedIds.value })
      showBatchResult(result, '批量执行')
      selectedRows.value = []
    })
  }

  const batchDelete = () => {
    if (!ensureBatchSize()) return
    ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 个任务吗?有依赖关系的任务会被拒绝。`,
      '批量删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    ).then(async () => {
      const result = await fetchBatchDeleteJobs({ ids: selectedIds.value })
      showBatchResult(result, '批量删除')
      selectedRows.value = []
      await refreshRemove()
    })
  }

  const handleFormSubmit = async (type: DialogType) => {
    if (type === 'add') {
      await refreshCreate()
    } else {
      await refreshUpdate()
    }
  }

  onMounted(async () => {
    await Promise.all([loadHandlers(), getData()])
  })
</script>

<style scoped lang="scss">
  .scheduler-job-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .scheduler-job-page-card {
    flex: 1;
  }

  .job-cron {
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 12.5px;
    color: var(--art-text-gray-700);
  }

  .handler-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    line-height: 1.4;

    &__label {
      color: var(--art-text-gray-900);
    }

    &__code {
      font-family:
        ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      font-size: 11.5px;
      color: var(--art-text-gray-500);
    }
  }
</style>
