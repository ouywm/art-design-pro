<template>
  <ElDialog v-model="dialogVisible" title="调整额度" width="560px" align-center>
    <ElAlert
      class="mb-4"
      type="info"
      :closable="false"
      show-icon
      :title="summaryTitle"
      :description="summaryDescription"
    />

    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="调整值" prop="quotaDelta">
        <ElInputNumber
          v-model="formData.quotaDelta"
          :step="1000"
          controls-position="right"
          placeholder="正数增加，负数扣减"
        />
      </ElFormItem>

      <ElFormItem label="参考号" prop="referenceNo">
        <ElInput v-model="formData.referenceNo" placeholder="可选，例如工单号 / 订单号" />
      </ElFormItem>

      <ElFormItem label="原因" prop="reason">
        <ElInput v-model="formData.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchAdjustUserQuota } from '@/api/ai-user-quota'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import type { AdjustFormModel, UserQuotaListItem } from '../types'

  interface Props {
    visible: boolean
    quotaData?: Partial<UserQuotaListItem>
    userLabel?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const createDefaultFormData = (): AdjustFormModel => ({
    quotaDelta: undefined,
    referenceNo: '',
    reason: ''
  })

  const formData = reactive<AdjustFormModel>(createDefaultFormData())

  const rules: FormRules = {
    quotaDelta: [{ required: true, message: '请输入调整值', trigger: 'change' }]
  }

  const summaryTitle = computed(() => props.userLabel || '当前用户')
  const summaryDescription = computed(() => {
    const quota = props.quotaData
    if (!quota) return '正数表示增加额度，负数表示扣减额度。'
    return `当前总额度 ${quota.quota ?? 0}，已用 ${quota.usedQuota ?? 0}，剩余 ${quota.remainingQuota ?? 0}。`
  })

  watch(
    () => props.visible,
    async (visible) => {
      if (!visible) return
      Object.assign(formData, createDefaultFormData())
      await nextTick()
      formRef.value?.clearValidate()
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value || !props.quotaData?.id) return

    try {
      await formRef.value.validate()
    } catch {
      return
    }

    if (!formData.quotaDelta || formData.quotaDelta === 0) {
      ElMessage.error('调整值不能为 0')
      return
    }

    submitLoading.value = true
    try {
      const payload: Api.AiManage.AdjustUserQuotaParams = {
        quotaDelta: Number(formData.quotaDelta),
        referenceNo: formData.referenceNo.trim(),
        reason: formData.reason.trim()
      }
      await fetchAdjustUserQuota(props.quotaData.id, payload)
      ElMessage.success('调整成功')
      dialogVisible.value = false
      emit('submit')
    } finally {
      submitLoading.value = false
    }
  }
</script>
