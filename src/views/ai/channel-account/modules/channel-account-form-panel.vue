<template>
  <ElDrawer
    v-model="visible"
    :title="panelMode === 'add' ? '新增渠道账号' : '编辑渠道账号'"
    :size="drawerSize"
    destroy-on-close
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="118px">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="所属渠道" prop="channelId">
            <ElSelect
              v-model="formData.channelId"
              filterable
              :loading="channelLoading"
              placeholder="请选择所属渠道"
            >
              <ElOption
                v-for="item in channelOptions"
                :key="item.id"
                :label="`${item.name} (${item.vendorCode})`"
                :value="item.id"
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
            <ElInput v-model="formData.credentialType" placeholder="如：api_key" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="Secret Ref" prop="secretRef">
            <ElInput v-model="formData.secretRef" placeholder="如：vault://ai/openai" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="可调度" prop="schedulable">
            <ElSwitch v-model="formData.schedulable" />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="panelMode === 'edit'" :span="8">
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态">
              <ElOption
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="panelMode === 'edit' ? 8 : 16">
          <ElFormItem label="测试模型" prop="testModel">
            <ElInput v-model="formData.testModel" placeholder="请输入测试模型" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="优先级" prop="priority">
            <ElInputNumber
              v-model="formData.priority"
              :min="0"
              placeholder="请输入优先级"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="权重" prop="weight">
            <ElInputNumber
              v-model="formData.weight"
              :min="1"
              placeholder="请输入权重"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="倍率" prop="rateMultiplier">
            <ElInputNumber
              v-model="formData.rateMultiplier"
              :min="0"
              :step="0.1"
              placeholder="请输入倍率"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="并发上限" prop="concurrencyLimit">
            <ElInputNumber
              v-model="formData.concurrencyLimit"
              :min="0"
              placeholder="请输入并发上限"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="额度上限" prop="quotaLimit">
            <ElInputNumber
              v-model="formData.quotaLimit"
              :min="0"
              :precision="2"
              placeholder="请输入额度上限"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="余额" prop="balance">
            <ElInputNumber
              v-model="formData.balance"
              :min="0"
              :precision="2"
              placeholder="请输入余额"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="过期时间" prop="expiresAt">
            <ElDatePicker
              v-model="formData.expiresAt"
              clearable
              style="width: 100%"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              placeholder="请选择过期时间"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElAlert
            title="配置类字段统一使用 JSON 输入。编辑时 credentials 与 extra 留空表示保持后端现有值，不会主动清空。"
            type="info"
            :closable="false"
            show-icon
            class="!mb-2"
          />
        </ElCol>

        <ElCol v-for="field in jsonFields" :key="field.key" :span="24">
          <ElFormItem :label="field.label" :prop="field.prop">
            <div class="json-editor-block">
              <div class="json-editor-toolbar">
                <div class="json-editor-meta">
                  <div class="json-editor-title">{{ field.label }}</div>
                  <div class="json-editor-description">{{ field.description }}</div>
                </div>

                <div class="json-editor-actions">
                  <ElButton text size="small" @click="applyJsonTemplate(field.key)">模板</ElButton>
                  <ElButton text size="small" @click="formatJsonField(field.key)">格式化</ElButton>
                  <ElButton text size="small" @click="clearJsonField(field.key)">清空</ElButton>
                </div>
              </div>

              <ElInput
                v-model="formData[field.prop]"
                type="textarea"
                :rows="field.rows"
                :placeholder="field.placeholder"
                class="json-editor-input"
              />

              <div
                class="json-editor-feedback"
                :class="{
                  'is-error': getJsonFieldError(field.label, formData[field.prop], field.required)
                }"
              >
                {{
                  getJsonFieldError(field.label, formData[field.prop], field.required) ||
                  field.emptyHint
                }}
              </div>
            </div>
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="备注" prop="remark">
            <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import {
    fetchCreateAiChannelAccount,
    fetchGetAiChannelList,
    fetchUpdateAiChannelAccount
  } from '@/api/ai-admin'
  import { useDict } from '@/utils/dict'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    buildJsonEditorPreset,
    formatJsonEditorValue,
    parseJsonEditorValue,
    validateJsonEditorValue
  } from '../../json-editor'
  import { AI_CHANNEL_ACCOUNT_STATUS_OPTIONS, buildNumericDictOptions } from '../../enum-options'
  import type {
    ChannelAccountFormModel,
    ChannelAccountListItem,
    ChannelAccountStatus
  } from '../types'

  interface Props {
    modelValue: boolean
    panelMode: 'add' | 'edit'
    accountData?: ChannelAccountListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    panelMode: 'add',
    accountData: undefined
  })

  const emit = defineEmits<Emits>()
  const { width } = useWindowSize()
  const { getDict } = useDict()

  const statusOptions = computed<Array<{ label: string; value: ChannelAccountStatus }>>(
    () =>
      buildNumericDictOptions(
        getDict('ai_channel_account_status'),
        AI_CHANNEL_ACCOUNT_STATUS_OPTIONS
      ) as Array<{ label: string; value: ChannelAccountStatus }>
  )

  const jsonFieldPresetMap = {
    credentials: buildJsonEditorPreset({
      description: '填写账号凭证，例如 api key、access token、headers 等。',
      emptyHint: '新增时可留空；编辑时留空表示不更新当前 credentials。',
      templateData: {
        api_key: 'sk-xxx'
      }
    }),
    extra: buildJsonEditorPreset({
      description: '填写账号级附加配置，例如 region、organization、proxy 等。',
      emptyHint: '新增时可留空；编辑时留空表示不更新当前 extra。',
      templateData: {
        region: 'us-east-1'
      }
    })
  }

  const jsonFields = [
    {
      key: 'credentials',
      prop: 'credentialsText',
      label: 'Credentials JSON',
      rows: 6,
      required: false,
      placeholder: '如：{"api_key":"sk-xxx"}',
      ...jsonFieldPresetMap.credentials
    },
    {
      key: 'extra',
      prop: 'extraText',
      label: 'Extra JSON',
      rows: 5,
      required: false,
      placeholder: '如：{"region":"us-east-1"}',
      ...jsonFieldPresetMap.extra
    }
  ] as const

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const channelLoading = ref(false)
  const channelOptions = ref<Api.AiChannel.ChannelListItem[]>([])

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const drawerSize = computed(() => (width.value < 1280 ? '100%' : '980px'))

  const createDefaultForm = (): ChannelAccountFormModel => ({
    channelId: undefined,
    name: '',
    credentialType: '',
    credentialsText: '',
    secretRef: '',
    status: undefined,
    schedulable: true,
    priority: 0,
    weight: 1,
    rateMultiplier: 1,
    concurrencyLimit: 0,
    quotaLimit: 0,
    balance: 0,
    expiresAt: null,
    testModel: '',
    extraText: '',
    remark: ''
  })

  const formData = reactive<ChannelAccountFormModel>(createDefaultForm())

  const createJsonValidator =
    (label: string, required: boolean = false) =>
    (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      const errorMessage = validateJsonEditorValue(label, value, required)
      callback(errorMessage ? new Error(errorMessage) : undefined)
    }

  const getJsonFieldError = (label: string, value: string, required: boolean = false) =>
    validateJsonEditorValue(label, value, required)

  const applyJsonTemplate = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    if (fieldKey === 'credentials') {
      formData.credentialsText = jsonFieldPresetMap.credentials.template
    } else {
      formData.extraText = jsonFieldPresetMap.extra.template
    }
  }

  const clearJsonField = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    if (fieldKey === 'credentials') {
      formData.credentialsText = ''
    } else {
      formData.extraText = ''
    }
  }

  const formatJsonField = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    const currentValue = fieldKey === 'credentials' ? formData.credentialsText : formData.extraText
    if (!currentValue.trim()) {
      return
    }

    const formatted = formatJsonEditorValue(parseJsonEditorValue(currentValue))
    if (fieldKey === 'credentials') {
      formData.credentialsText = formatted
    } else {
      formData.extraText = formatted
    }
  }

  const rules: FormRules<ChannelAccountFormModel> = {
    channelId: [{ required: true, message: '请选择所属渠道', trigger: 'change' }],
    name: [
      { required: true, message: '请输入账号名称', trigger: 'blur' },
      { min: 1, max: 128, message: '账号名称长度必须在 1 到 128 个字符之间', trigger: 'blur' }
    ],
    credentialType: [
      { required: true, message: '请输入凭证类型', trigger: 'blur' },
      { min: 1, max: 64, message: '凭证类型长度必须在 1 到 64 个字符之间', trigger: 'blur' }
    ],
    credentialsText: [
      { validator: createJsonValidator('Credentials JSON', false), trigger: 'blur' }
    ],
    extraText: [{ validator: createJsonValidator('Extra JSON', false), trigger: 'blur' }]
  }

  const resetForm = () => {
    Object.assign(formData, createDefaultForm())
    formRef.value?.clearValidate()
  }

  const loadChannels = async () => {
    channelLoading.value = true
    try {
      const response = await fetchGetAiChannelList({
        page: 1,
        size: 200
      })
      channelOptions.value = response.content
    } finally {
      channelLoading.value = false
    }
  }

  watch(
    () => [props.modelValue, props.panelMode, props.accountData?.id],
    async ([visibleValue]) => {
      if (!visibleValue) {
        resetForm()
        return
      }

      await loadChannels()

      if (props.panelMode === 'edit' && props.accountData) {
        Object.assign(formData, {
          channelId: props.accountData.channelId,
          name: props.accountData.name,
          credentialType: props.accountData.credentialType,
          credentialsText: '',
          secretRef: props.accountData.secretRef,
          status: props.accountData.status,
          schedulable: props.accountData.schedulable,
          priority: props.accountData.priority,
          weight: props.accountData.weight,
          rateMultiplier: props.accountData.rateMultiplier,
          concurrencyLimit: props.accountData.concurrencyLimit,
          quotaLimit: Number(props.accountData.quotaLimit),
          balance: Number(props.accountData.balance),
          expiresAt: props.accountData.expiresAt ?? null,
          testModel: props.accountData.testModel,
          extraText: '',
          remark: props.accountData.remark
        })
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )

  const buildCreatePayload = (): Api.AiChannelAccount.CreateChannelAccountParams => ({
    channelId: formData.channelId!,
    name: formData.name.trim(),
    credentialType: formData.credentialType.trim(),
    credentials: parseJsonEditorValue(formData.credentialsText, undefined),
    secretRef: formData.secretRef.trim(),
    schedulable: formData.schedulable,
    priority: formData.priority ?? 0,
    weight: formData.weight ?? 1,
    rateMultiplier: formData.rateMultiplier ?? 1,
    concurrencyLimit: formData.concurrencyLimit ?? 0,
    quotaLimit: formData.quotaLimit ?? 0,
    balance: formData.balance ?? 0,
    expiresAt: formData.expiresAt,
    testModel: formData.testModel.trim(),
    extra: parseJsonEditorValue(formData.extraText, undefined),
    remark: formData.remark.trim()
  })

  const buildUpdatePayload = (): Api.AiChannelAccount.UpdateChannelAccountParams => {
    const payload: Api.AiChannelAccount.UpdateChannelAccountParams = {
      channelId: formData.channelId,
      name: formData.name.trim(),
      credentialType: formData.credentialType.trim(),
      secretRef: formData.secretRef.trim(),
      status: formData.status,
      schedulable: formData.schedulable,
      priority: formData.priority ?? 0,
      weight: formData.weight ?? 1,
      rateMultiplier: formData.rateMultiplier ?? 1,
      concurrencyLimit: formData.concurrencyLimit ?? 0,
      quotaLimit: formData.quotaLimit ?? 0,
      balance: formData.balance ?? 0,
      expiresAt: formData.expiresAt,
      testModel: formData.testModel.trim(),
      remark: formData.remark.trim()
    }

    const credentials = parseJsonEditorValue(formData.credentialsText, undefined)
    if (credentials !== undefined) {
      payload.credentials = credentials
    }

    const extra = parseJsonEditorValue(formData.extraText, undefined)
    if (extra !== undefined) {
      payload.extra = extra
    }

    return payload
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true

    try {
      if (props.panelMode === 'add') {
        await fetchCreateAiChannelAccount(buildCreatePayload())
      } else if (typeof props.accountData?.id === 'number') {
        await fetchUpdateAiChannelAccount(props.accountData.id, buildUpdatePayload())
      }

      ElMessage.success(props.panelMode === 'add' ? '新增成功' : '更新成功')
      emit('success')
      visible.value = false
    } finally {
      submitLoading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .json-editor-block {
    width: 100%;
    padding: 12px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-light);
    border-radius: 12px;
  }

  .json-editor-toolbar {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .json-editor-meta {
    min-width: 0;
  }

  .json-editor-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .json-editor-description {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  .json-editor-actions {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
  }

  .json-editor-input {
    :deep(textarea) {
      font-family:
        SFMono-Regular, 'JetBrains Mono', 'Fira Code', 'Source Code Pro', Consolas,
        'Liberation Mono', Menlo, monospace;
      line-height: 1.6;
    }
  }

  .json-editor-feedback {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);

    &.is-error {
      color: var(--el-color-danger);
    }
  }
</style>
