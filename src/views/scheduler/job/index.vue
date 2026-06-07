<template>
  <div class="scheduler-job-page art-full-height">
    <JobSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard
      class="art-table-card scheduler-job-page-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
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
        @submit="handleFormSubmit"
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
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    getScheduleTypeLabel,
    getScheduleTypeTagType,
    getRunModeLabel,
    summarizeSchedule
  } from '../constants'
  import JobSearch from './modules/job-search.vue'
  import JobFormPanel from './modules/job-form-panel.vue'
  import type { JobListItem, SearchFormModel } from './types'

  defineOptions({ name: 'SchedulerJob' })

  const router = useRouter()

  const dialogType = ref<DialogType>('add')
  const formVisible = ref(false)
  const showSearchBar = ref(false)

  const currentJobData = ref<Partial<JobListItem>>({})

  const searchForm = ref<SearchFormModel>({
    namespace: undefined,
    appName: undefined,
    likeDescription: undefined,
    likeHandleName: undefined
  })

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
      case 'runs':
        goRunList(row)
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
          label: row.enable ? '停用' : '启用',
          icon: row.enable ? 'ri:pause-circle-line' : 'ri:play-circle-line'
        },
        { key: 'runs', label: '执行记录', icon: 'ri:file-list-3-line' },
        { key: 'delete', label: '删除', icon: 'ri:delete-bin-4-line', color: '#f56c6c' }
      ],
      onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
    })

  const formatEmpty = (value: unknown) => {
    if (value === undefined || value === null || value === '') return '-'
    return String(value)
  }

  const formatMillis = (value: number | null | undefined) => {
    if (!value) return '-'
    return new Date(value).toLocaleString()
  }

  const getJobTitle = (row: JobListItem) => row.description || row.key || `#${row.id}`

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
    replaceSearchParams,
    resetSearchParams
  } = useTable({
    core: {
      apiFn: fetchGetJobList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'description',
          label: '任务描述',
          minWidth: 200,
          showOverflowTooltip: true,
          formatter: (row) => formatEmpty(row.description)
        },
        {
          prop: 'key',
          label: '任务 Key',
          minWidth: 150,
          formatter: (row) => h('span', { class: 'job-code' }, row.key || `#${row.id}`)
        },
        { prop: 'namespace', label: '命名空间', minWidth: 120 },
        { prop: 'appName', label: '应用', minWidth: 180, showOverflowTooltip: true },
        {
          prop: 'handleName',
          label: '处理器',
          minWidth: 200,
          formatter: (row) =>
            h('div', { class: 'handler-cell' }, [
              h('div', { class: 'handler-cell__code' }, row.handleName)
            ])
        },
        {
          prop: 'scheduleType',
          label: '调度类型',
          width: 120,
          formatter: (row) =>
            h(ElTag, { type: getScheduleTypeTagType(row.scheduleType), size: 'small' }, () =>
              getScheduleTypeLabel(row.scheduleType)
            )
        },
        {
          prop: 'cronValue',
          label: '调度参数',
          minWidth: 160,
          formatter: (row) =>
            h(
              'span',
              { class: 'job-cron' },
              summarizeSchedule(
                row.scheduleType,
                row.cronValue,
                row.intervalSecond,
                row.delaySecond
              )
            )
        },
        {
          prop: 'runMode',
          label: '运行模式',
          width: 120,
          formatter: (row) => getRunModeLabel(row.runMode)
        },
        {
          prop: 'enable',
          label: '状态',
          width: 90,
          formatter: (row) =>
            h(ElTag, { type: row.enable ? 'success' : 'info', size: 'small' }, () =>
              row.enable ? '启用' : '停用'
            )
        },
        {
          prop: 'lastModifiedMillis',
          label: '最后修改',
          minWidth: 170,
          formatter: (row) => formatMillis(row.lastModifiedMillis)
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
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    Object.assign(searchForm.value, {
      namespace: undefined,
      appName: undefined,
      likeDescription: undefined,
      likeHandleName: undefined
    })
    resetSearchParams()
  }

  const showFormPanel = (type: DialogType, row?: JobListItem) => {
    dialogType.value = type
    currentJobData.value = row || {}
    formVisible.value = true
  }

  const goRunList = (row: JobListItem) => {
    router.push({ path: '/scheduler/run', query: { jobId: String(row.id) } })
  }

  const toggleEnabled = (row: JobListItem) => {
    const next = !row.enable
    const action = next ? '启用' : '停用'
    ElMessageBox.confirm(`确定${action}任务「${getJobTitle(row)}」吗?`, `${action}任务`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchToggleJob(row.id, next)
      ElMessage.success(`${action}成功`)
      await refreshUpdate()
    })
  }

  const deleteJob = (row: JobListItem) => {
    ElMessageBox.confirm(
      `确定删除任务「${getJobTitle(row)}」吗?如有依赖关系会被后端拒绝。`,
      '删除任务',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
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
    await getData()
  })
</script>

<style scoped lang="scss">
  .scheduler-job-page {
    display: flex;
    flex-direction: column;
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
