<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增用户额度' : '编辑用户额度'"
    width="760px"
    align-center
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
      v-loading="detailLoading"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="用户" prop="userId">
            <ElSelect
              v-model="formData.userId"
              :disabled="dialogType === 'edit'"
              filterable
              placeholder="请选择用户"
            >
              <ElOption
                v-for="item in userOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="渠道分组" prop="channelGroup">
            <ElInput v-model="formData.channelGroup" placeholder="默认 default" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="总额度" prop="quota">
            <ElInputNumber
              v-model="formData.quota"
              :min="0"
              :step="1000"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态">
              <ElOption
                v-for="item in USER_QUOTA_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="日额度上限" prop="dailyQuotaLimit">
            <ElInputNumber
              v-model="formData.dailyQuotaLimit"
              :min="0"
              :step="1000"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="月额度上限" prop="monthlyQuotaLimit">
            <ElInputNumber
              v-model="formData.monthlyQuotaLimit"
              :min="0"
              :step="1000"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
  import {
    fetchCreateUserQuota,
    fetchGetUserQuotaDetail,
    fetchUpdateUserQuota
  } from '@/api/ai-user-quota'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { USER_QUOTA_STATUS_OPTIONS } from '../constants'
  import type { FormModel, UserOption, UserQuotaListItem } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    quotaData?: Partial<UserQuotaListItem>
    userOptions: UserOption[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', type: DialogType): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)
  const userOptions = computed(() => props.userOptions)

  const createDefaultFormData = (): FormModel => ({
    userId: undefined,
    channelGroup: 'default',
    status: 1,
    quota: 0,
    dailyQuotaLimit: 0,
    monthlyQuotaLimit: 0,
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const rules: FormRules = {
    userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
    channelGroup: [{ required: true, message: '请输入渠道分组', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    quota: [{ required: true, message: '请输入总额度', trigger: 'change' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
  }

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.quotaData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetUserQuotaDetail(props.quotaData!.id!)
      Object.assign(formData, {
        userId: detail.userId,
        channelGroup: detail.channelGroup,
        status: detail.status,
        quota: detail.quota,
        dailyQuotaLimit: detail.dailyQuotaLimit,
        monthlyQuotaLimit: detail.monthlyQuotaLimit,
        remark: detail.remark
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.quotaData?.id],
    async ([visible]) => {
      if (!visible) return
      await initFormData()
      await nextTick()
      formRef.value?.clearValidate()
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
    } catch {
      return
    }

    submitLoading.value = true
    try {
      const createPayload: Api.AiManage.CreateUserQuotaParams = {
        userId: Number(formData.userId),
        channelGroup: formData.channelGroup.trim() || 'default',
        status: formData.status,
        quota: Number(formData.quota ?? 0),
        dailyQuotaLimit: Number(formData.dailyQuotaLimit ?? 0),
        monthlyQuotaLimit: Number(formData.monthlyQuotaLimit ?? 0),
        remark: formData.remark.trim()
      }

      if (dialogType.value === 'add') {
        await fetchCreateUserQuota(createPayload)
      } else if (props.quotaData?.id) {
        const updatePayload: Api.AiManage.UpdateUserQuotaParams = {
          channelGroup: createPayload.channelGroup,
          status: createPayload.status,
          quota: createPayload.quota,
          dailyQuotaLimit: createPayload.dailyQuotaLimit,
          monthlyQuotaLimit: createPayload.monthlyQuotaLimit,
          remark: createPayload.remark
        }
        await fetchUpdateUserQuota(props.quotaData.id, updatePayload)
      }

      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
      dialogVisible.value = false
      emit('submit', dialogType.value)
    } finally {
      submitLoading.value = false
    }
  }
</script>
