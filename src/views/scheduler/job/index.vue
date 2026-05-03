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

      <JobDependenciesPanel
        v-model:visible="depsVisible"
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
  import { fetchDeleteJob, fetchGetJobList, fetchToggleJob } from '@/api/scheduler-job'
  import { fetchGetHandlers } from '@/api/scheduler-handler'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { getRunStateLabel, getRunStateTagType } from '../constants'
  import { getHandlerLabel } from './handler-meta'
  import JobSearch from './modules/job-search.vue'
  import JobFormPanel from './modules/job-form-panel.vue'
  import JobTriggerDialog from './modules/job-trigger-dialog.vue'
  import JobDependenciesPanel from './modules/job-dependencies-panel.vue'
  import type { HandlerOption, JobListItem, SearchFormModel } from './types'

  defineOptions({ name: 'SchedulerJob' })

  const router = useRouter()

  const dialogType = ref<DialogType>('add')
  const formVisible = ref(false)
  const triggerVisible = ref(false)
  const depsVisible = ref(false)

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
        value: item.name
      }))
    } finally {
      handlerLoading.value = false
    }
  }

  const goRunListAll = () => {
    router.push('/scheduler/run')
  }

  const showDepsPanel = (row: JobListItem) => {
    currentJobId.value = row.id
    currentJobName.value = row.name
    depsVisible.value = true
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
      case 'deps':
        showDepsPanel(row)
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
        { key: 'deps', label: '管理依赖', icon: 'ri:git-branch-line' },
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
    searchParams,
    getData,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetJobList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { prop: 'name', label: '任务名称', minWidth: 180 },
        {
          prop: 'handler',
          label: '处理器',
          minWidth: 200,
          formatter: (row) =>
            h('div', { class: 'handler-cell' }, [
              h('div', { class: 'handler-cell__label' }, getHandlerLabel(row.handler)),
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
        {
          prop: 'lastRunState',
          label: '最近执行',
          width: 100,
          formatter: (row) =>
            row.lastRunState
              ? h(ElTag, { type: getRunStateTagType(row.lastRunState), size: 'small' }, () =>
                  getRunStateLabel(row.lastRunState!)
                )
              : h(ElTag, { type: 'info', size: 'small' }, () => '未执行')
        },
        {
          prop: 'lastRunFinishedAt',
          label: '上次执行',
          minWidth: 170,
          formatter: (row) => row.lastRunFinishedAt || '-'
        },
        {
          prop: 'nextFireAt',
          label: '下次执行',
          minWidth: 170,
          formatter: (row) => row.nextFireAt || '-'
        },
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
