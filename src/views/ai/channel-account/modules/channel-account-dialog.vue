<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增渠道账号' : '编辑渠道账号'"
    width="860px"
    align-center
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      v-loading="detailLoading"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="所属渠道" prop="channelId">
            <ElSelect
              v-model="formData.channelId"
              :disabled="dialogType === 'edit'"
              filterable
              placeholder="请选择渠道"
            >
              <ElOption
                v-for="item in channelOptions"
                :key="item.value"
                :label="item.label + (item.status === 1 ? '' : '（已不可用）')"
                :value="item.value"
                :disabled="item.status !== 1 && dialogType === 'add'"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="账号名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入账号名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="凭证类型" prop="credentialType">
            <ElSelect
              v-model="formData.credentialType"
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入凭证类型"
            >
              <ElOption
                v-for="item in COMMON_CREDENTIAL_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="账号状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态">
              <ElOption
                v-for="item in CHANNEL_ACCOUNT_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="调度开关" prop="schedulable">
            <ElSwitch v-model="formData.schedulable" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="密钥引用" prop="secretRef">
            <ElInput v-model="formData.secretRef" placeholder="可选，例如 vault/openai/prod" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="优先级" prop="priority">
            <ElInputNumber v-model="formData.priority" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="权重" prop="weight">
            <ElInputNumber
              v-model="formData.weight"
              :min="0"
              :step="10"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="倍率" prop="rateMultiplier">
            <ElInputNumber
              v-model="formData.rateMultiplier"
              :min="0"
              :step="0.1"
              :precision="2"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="并发上限" prop="concurrencyLimit">
            <ElInputNumber v-model="formData.concurrencyLimit" :min="0" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="额度上限" prop="quotaLimit">
            <ElInputNumber
              v-model="formData.quotaLimit"
              :min="0"
              :step="100"
              :precision="2"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="测速模型" prop="testModel">
            <ElInput v-model="formData.testModel" placeholder="可选" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="凭证配置" prop="credentialsText">
        <ElInput
          v-model="formData.credentialsText"
          type="textarea"
          :rows="5"
          placeholder='请输入 JSON，例如：{"api_key":"sk-xxx"}'
        />
      </ElFormItem>

      <ElFormItem label="扩展配置" prop="extraText">
        <ElInput
          v-model="formData.extraText"
          type="textarea"
          :rows="4"
          placeholder='请输入 JSON，例如：{"region":"us-east-1"}'
        />
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>

      <ElAlert
        v-if="runtimeState.lastErrorMessage"
        class="mb-4"
        type="warning"
        :closable="false"
        show-icon
        :title="runtimeState.lastErrorMessage"
      />

      <ElFormItem v-if="runtimeState.disabledApiKeysText" label="禁用 Keys">
        <ElInput
          :model-value="runtimeState.disabledApiKeysText"
          type="textarea"
          :rows="3"
          readonly
        />
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
    fetchCreateChannelAccount,
    fetchGetChannelAccountDetail,
    fetchUpdateChannelAccount
  } from '@/api/ai-channel-account'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { CHANNEL_ACCOUNT_STATUS_OPTIONS, COMMON_CREDENTIAL_TYPE_OPTIONS } from '../constants'
  import type { ChannelAccountListItem, ChannelOption, FormModel } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    accountData?: Partial<ChannelAccountListItem>
    channelOptions: ChannelOption[]
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
  const channelOptions = computed(() => props.channelOptions)

  const createDefaultFormData = (): FormModel => ({
    channelId: undefined,
    name: '',
    credentialType: 'api_key',
    credentialsText: '{\n  "api_key": ""\n}',
    secretRef: '',
    status: 1,
    schedulable: true,
    priority: 0,
    weight: 10,
    rateMultiplier: 1,
    concurrencyLimit: 0,
    quotaLimit: 0,
    testModel: '',
    extraText: '',
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())
  const runtimeState = reactive({
    lastErrorMessage: '',
    disabledApiKeysText: ''
  })

  const rules: FormRules = {
    channelId: [{ required: true, message: '请选择所属渠道', trigger: 'change' }],
    name: [{ required: true, message: '请输入账号名称', trigger: 'blur' }],
    credentialType: [{ required: true, message: '请输入凭证类型', trigger: 'change' }],
    status: [{ required: true, message: '请选择账号状态', trigger: 'change' }],
    credentialsText: [{ required: true, message: '请输入凭证配置', trigger: 'blur' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
    Object.assign(runtimeState, {
      lastErrorMessage: '',
      disabledApiKeysText: ''
    })
  }

  const normalizeOptionalString = (value: string) => value.trim() || undefined

  const stringifyJson = (value: unknown, emptyAsBlank = true) => {
    if (value === undefined || value === null) return ''
    if (
      emptyAsBlank &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value as Record<string, unknown>).length === 0
    ) {
      return ''
    }
    return JSON.stringify(value, null, 2)
  }

  const parseJsonValue = (value: string, fieldLabel: string, required = false): unknown => {
    const text = value.trim()
    if (!text) {
      if (required) {
        throw new Error(`${fieldLabel}不能为空`)
      }
      return undefined
    }
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`${fieldLabel}必须是合法 JSON`)
    }
  }

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.accountData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetChannelAccountDetail(props.accountData!.id!)
      Object.assign(formData, {
        channelId: detail.channelId,
        name: detail.name,
        credentialType: detail.credentialType,
        credentialsText: stringifyJson(detail.credentials, false) || '{}',
        secretRef: detail.secretRef || '',
        status: detail.status,
        schedulable: detail.schedulable,
        priority: detail.priority,
        weight: detail.weight,
        rateMultiplier: detail.rateMultiplier,
        concurrencyLimit: detail.concurrencyLimit,
        quotaLimit: detail.quotaLimit,
        testModel: detail.testModel || '',
        extraText: stringifyJson(detail.extra),
        remark: detail.remark || ''
      })

      Object.assign(runtimeState, {
        lastErrorMessage: detail.lastErrorMessage || '',
        disabledApiKeysText: stringifyJson(detail.disabledApiKeys, false)
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.accountData?.id],
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
      const basePayload = {
        name: formData.name.trim(),
        credentialType: formData.credentialType.trim(),
        credentials: parseJsonValue(formData.credentialsText, '凭证配置', true),
        secretRef: normalizeOptionalString(formData.secretRef),
        status: formData.status,
        schedulable: formData.schedulable,
        priority: formData.priority,
        weight: formData.weight,
        rateMultiplier: formData.rateMultiplier,
        concurrencyLimit: formData.concurrencyLimit,
        quotaLimit: formData.quotaLimit,
        testModel: normalizeOptionalString(formData.testModel),
        extra: parseJsonValue(formData.extraText, '扩展配置'),
        remark: normalizeOptionalString(formData.remark)
      }

      if (dialogType.value === 'add') {
        await fetchCreateChannelAccount({
          channelId: formData.channelId!,
          ...basePayload
        })
      } else if (props.accountData?.id) {
        await fetchUpdateChannelAccount(props.accountData.id, basePayload)
      }

      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
      dialogVisible.value = false
      emit('submit', dialogType.value)
    } catch (error) {
      if (error instanceof Error && error.message.includes('JSON')) {
        ElMessage.error(error.message)
      } else if (error instanceof Error && error.message.includes('不能为空')) {
        ElMessage.error(error.message)
      }
    } finally {
      submitLoading.value = false
    }
  }
</script>
