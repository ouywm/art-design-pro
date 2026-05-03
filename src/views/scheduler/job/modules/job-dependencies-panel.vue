<template>
  <ElDrawer
    v-model="drawerVisible"
    :size="drawerSize"
    :title="jobName ? `任务依赖 — ${jobName}` : '任务依赖'"
    destroy-on-close
  >
    <ElAlert
      type="info"
      :closable="false"
      show-icon
      class="dep-alert"
      title="出向 = 本任务跑完后会触发哪些下游;入向 = 哪些上游跑完会触发本任务。修改入向请到对应上游任务里管理。"
    />

    <div class="dep-section">
      <div class="dep-section__head">
        <span class="dep-section__title">出向依赖</span>
        <ElButton size="small" type="primary" @click="openAddPanel">添加出向依赖</ElButton>
      </div>
      <ElTable
        :data="dependencies?.outgoing || []"
        v-loading="listLoading"
        empty-text="暂无出向依赖"
        size="small"
        border
      >
        <ElTableColumn prop="downstreamName" label="下游任务" min-width="160" />
        <ElTableColumn label="触发条件" width="130">
          <template #default="{ row }">
            <ElTag :type="getDependencyOnStateTagType(row.onState)">
              {{ getDependencyOnStateLabel(row.onState) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="启用" width="70">
          <template #default="{ row }">
            <span>{{ row.enabled ? '是' : '否' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="80">
          <template #default="{ row }">
            <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <div class="dep-section">
      <div class="dep-section__head">
        <span class="dep-section__title">入向依赖(只读)</span>
      </div>
      <ElTable
        :data="dependencies?.incoming || []"
        v-loading="listLoading"
        empty-text="暂无入向依赖"
        size="small"
        border
      >
        <ElTableColumn prop="upstreamName" label="上游任务" min-width="160" />
        <ElTableColumn label="触发条件" width="130">
          <template #default="{ row }">
            <ElTag :type="getDependencyOnStateTagType(row.onState)">
              {{ getDependencyOnStateLabel(row.onState) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="启用" width="70">
          <template #default="{ row }">
            <span>{{ row.enabled ? '是' : '否' }}</span>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <ElDialog
      v-model="addPanelVisible"
      title="添加出向依赖"
      width="480px"
      append-to-body
      destroy-on-close
    >
      <ElForm ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <ElFormItem label="下游任务" prop="downstreamId">
          <ElSelect
            v-model="addForm.downstreamId"
            filterable
            placeholder="请选择下游任务"
            :loading="jobsLoading"
            style="width: 100%"
          >
            <ElOption
              v-for="item in jobOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="触发条件" prop="onState">
          <ElSelect v-model="addForm.onState" style="width: 100%">
            <ElOption
              v-for="item in DEPENDENCY_ON_STATE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="addPanelVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="addLoading" @click="handleAdd">确定</ElButton>
      </template>
    </ElDialog>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import {
    fetchAddJobDependency,
    fetchDeleteJobDependency,
    fetchGetJobDependencies,
    fetchGetJobList
  } from '@/api/scheduler-job'
  import {
    DEPENDENCY_ON_STATE_OPTIONS,
    getDependencyOnStateLabel,
    getDependencyOnStateTagType
  } from '../../constants'
  import type { AddDependencyFormModel, JobOption } from '../types'

  interface Props {
    visible: boolean
    jobId?: number
    jobName?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { width } = useWindowSize()
  const drawerSize = computed(() => (width.value < 1024 ? '100%' : '640px'))

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dependencies = ref<Api.Scheduler.JobDependencyListVo>()
  const listLoading = ref(false)

  const jobOptions = ref<JobOption[]>([])
  const jobsLoading = ref(false)

  const addPanelVisible = ref(false)
  const addLoading = ref(false)
  const addFormRef = ref<FormInstance>()
  const addForm = reactive<AddDependencyFormModel>({
    downstreamId: undefined,
    onState: 'Succeeded'
  })

  const addRules: FormRules = {
    downstreamId: [{ required: true, message: '请选择下游任务', trigger: 'change' }],
    onState: [{ required: true, message: '请选择触发条件', trigger: 'change' }]
  }

  const loadDependencies = async () => {
    if (!props.jobId) return
    listLoading.value = true
    try {
      dependencies.value = await fetchGetJobDependencies(props.jobId)
    } finally {
      listLoading.value = false
    }
  }

  const loadJobOptions = async () => {
    jobsLoading.value = true
    try {
      const result = await fetchGetJobList({ page: 1, size: 1000 })
      jobOptions.value = result.content.map((item) => ({
        label: `${item.name} (${item.groupName})`,
        value: item.id,
        disabled: item.id === props.jobId
      }))
    } finally {
      jobsLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.jobId],
    async ([visible, jobId]) => {
      if (!visible || typeof jobId !== 'number') return
      await Promise.all([loadDependencies(), loadJobOptions()])
    }
  )

  const openAddPanel = () => {
    addForm.downstreamId = undefined
    addForm.onState = 'Succeeded'
    addPanelVisible.value = true
    nextTick(() => addFormRef.value?.clearValidate())
  }

  const handleDelete = (row: Api.Scheduler.DependencyVo) => {
    ElMessageBox.confirm(
      `确定删除「${row.upstreamName} → ${row.downstreamName}」依赖吗?`,
      '删除依赖',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    ).then(async () => {
      if (!props.jobId) return
      await fetchDeleteJobDependency(props.jobId, row.id)
      ElMessage.success('删除成功')
      await loadDependencies()
    })
  }

  const handleAdd = async () => {
    if (!addFormRef.value || !props.jobId) return
    try {
      await addFormRef.value.validate()
    } catch {
      return
    }
    addLoading.value = true
    try {
      await fetchAddJobDependency(props.jobId, {
        downstreamId: Number(addForm.downstreamId),
        onState: addForm.onState
      })
      ElMessage.success('添加成功')
      addPanelVisible.value = false
      await loadDependencies()
    } catch (err: unknown) {
      // 后端 RFC 7807 错误格式:detail 字段含业务原因(成环、自环、重复等)
      const detail =
        (err as { response?: { data?: { detail?: string } }; data?: { detail?: string } })?.response
          ?.data?.detail ??
        (err as { response?: { data?: { detail?: string } }; data?: { detail?: string } })?.data
          ?.detail
      if (detail) ElMessage.error(detail)
    } finally {
      addLoading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .dep-alert {
    margin-bottom: 16px;
  }

  .dep-section {
    margin-top: 24px;

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: var(--art-text-gray-900);
    }
  }
</style>
