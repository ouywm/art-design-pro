<template>
  <ElDialog
    v-model="dialogVisible"
    title="手动触发任务"
    width="520px"
    align-center
    destroy-on-close
  >
    <ElAlert
      type="info"
      :closable="false"
      show-icon
      class="trigger-alert"
      title="手动触发不受启停状态限制,执行结果在「执行记录」中查询"
    />
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="任务">
        <span class="trigger-job-name">{{ jobName || '-' }}</span>
      </ElFormItem>
      <ElFormItem label="覆盖参数" prop="paramsOverrideText">
        <ElInput
          v-model="formData.paramsOverrideText"
          type="textarea"
          :rows="6"
          :placeholder="placeholderText"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">触发</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage, type FormInstance, type FormItemRule, type FormRules } from 'element-plus'
  import { fetchTriggerJob } from '@/api/scheduler-job'
  import type { TriggerFormModel } from '../types'

  interface Props {
    visible: boolean
    jobId?: number
    jobName?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formData = reactive<TriggerFormModel>({
    paramsOverrideText: ''
  })

  const placeholderText = '留空使用任务默认 params;或输入 JSON,例如:{"userId":999}'

  const validateParamsOverride: FormItemRule['validator'] = (_rule, value, callback) => {
    const text = String(value || '').trim()
    if (!text) {
      callback()
      return
    }
    try {
      JSON.parse(text)
      callback()
    } catch {
      callback(new Error('JSON 格式不合法'))
    }
  }

  const rules: FormRules = {
    paramsOverrideText: [{ validator: validateParamsOverride, trigger: 'blur' }]
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        formData.paramsOverrideText = ''
        nextTick(() => formRef.value?.clearValidate())
      }
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value || !props.jobId) return
    try {
      await formRef.value.validate()
    } catch {
      return
    }
    submitLoading.value = true
    try {
      const trimmed = formData.paramsOverrideText.trim()
      const paramsOverride = trimmed ? JSON.parse(trimmed) : undefined
      await fetchTriggerJob(props.jobId, { paramsOverride })
      ElMessage.success('已发送触发请求')
      dialogVisible.value = false
      emit('success')
    } finally {
      submitLoading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .trigger-alert {
    margin-bottom: 16px;
  }

  .trigger-job-name {
    font-weight: 600;
    color: var(--art-text-gray-900);
  }
</style>
