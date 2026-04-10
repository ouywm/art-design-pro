<template>
  <ElDrawer
    v-model="visible"
    :title="panelMode === 'add' ? '新增 AI 渠道' : '编辑 AI 渠道'"
    :size="drawerSize"
    destroy-on-close
  >
    <ElForm
      ref="formRef"
      v-loading="detailLoading"
      class="channel-form"
      :model="formData"
      :rules="rules"
      label-width="124px"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="渠道名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入渠道名称" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="渠道类型" prop="channelType">
            <ElSelect v-model="formData.channelType" placeholder="请选择渠道类型">
              <ElOption
                v-for="item in channelTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="供应商" prop="vendorCode">
            <ElSelect
              v-model="formData.vendorCode"
              filterable
              :loading="vendorLoading"
              placeholder="请选择供应商"
            >
              <ElOption
                v-for="item in vendorOptions"
                :key="item.vendorCode"
                :label="`${item.vendorName} (${item.vendorCode})${item.enabled ? '' : '（已停用）'}`"
                :value="item.vendorCode"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="渠道分组" prop="channelGroup">
            <ElInput v-model="formData.channelGroup" placeholder="请输入渠道分组" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="基础地址" prop="baseUrl">
            <ElInput v-model="formData.baseUrl" placeholder="请输入基础地址" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="测试模型" prop="testModel">
            <ElInput v-model="formData.testModel" placeholder="请输入测试模型" />
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
          <ElFormItem label="自动禁用" prop="autoBan">
            <ElSwitch v-model="formData.autoBan" />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="panelMode === 'edit'" :span="12">
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

        <ElCol :span="panelMode === 'edit' ? 12 : 24">
          <ElFormItem label="Endpoint 范围" prop="endpointScopes">
            <ElSelect
              v-model="formData.endpointScopes"
              clearable
              collapse-tags
              collapse-tags-tooltip
              filterable
              multiple
              placeholder="请选择 endpoint scopes"
            >
              <ElOption
                v-for="item in endpointScopeOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElAlert
            title="配置类字段统一使用 JSON 输入。模型列表必填；高级配置在新增时可留空，编辑时留空表示不更新。"
            type="info"
            :closable="false"
            show-icon
            class="!mt-2 !mb-2"
          />
        </ElCol>

        <ElCol v-for="field in basicJsonFields" :key="field.key" :span="24">
          <ElFormItem :label="field.label" :prop="field.prop">
            <div class="json-editor-block">
              <div class="json-editor-toolbar">
                <div class="json-editor-meta">
                  <div class="json-editor-title">{{ field.label }}</div>
                  <div class="json-editor-description">
                    {{ field.description }}
                  </div>
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
          <ElCollapse class="json-editor-collapse">
            <ElCollapseItem title="高级配置" name="config">
              <ElFormItem label="配置 JSON" prop="configText" class="!mb-0">
                <div class="json-editor-block">
                  <div class="json-editor-toolbar">
                    <div class="json-editor-meta">
                      <div class="json-editor-title">配置 JSON</div>
                      <div class="json-editor-description">
                        {{ jsonFieldPresetMap.config.description }}
                      </div>
                    </div>

                    <div class="json-editor-actions">
                      <ElButton text size="small" @click="applyJsonTemplate('config')"
                        >模板</ElButton
                      >
                      <ElButton text size="small" @click="formatJsonField('config')"
                        >格式化</ElButton
                      >
                      <ElButton text size="small" @click="clearJsonField('config')">清空</ElButton>
                    </div>
                  </div>

                  <ElInput
                    v-model="formData.configText"
                    type="textarea"
                    :rows="6"
                    placeholder='如：{"timeoutMs":30000,"headers":{"x-org":"demo"}}'
                    class="json-editor-input"
                  />

                  <div
                    class="json-editor-feedback"
                    :class="{ 'is-error': getJsonFieldError('配置 JSON', formData.configText) }"
                  >
                    {{
                      getJsonFieldError('配置 JSON', formData.configText) ||
                      jsonFieldPresetMap.config.emptyHint
                    }}
                  </div>
                </div>
              </ElFormItem>
            </ElCollapseItem>
          </ElCollapse>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="备注" prop="remark">
            <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import {
    fetchCreateAiChannel,
    fetchGetAiChannelDetail,
    fetchGetAiVendorList,
    fetchUpdateAiChannel
  } from '@/api/ai-admin'
  import { useDict } from '@/utils/dict'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    AI_CHANNEL_STATUS_OPTIONS,
    AI_CHANNEL_TYPE_OPTIONS,
    buildNumericDictOptions
  } from '../../enum-options'
  import {
    buildJsonFieldPresetMap,
    formatJsonEditorValue,
    parseJsonEditorValue,
    validateJsonEditorValue
  } from '../json-fields'
  import type { ChannelFormModel, ChannelListItem, ChannelStatus, ChannelType } from '../types'

  interface Props {
    modelValue: boolean
    panelMode: 'add' | 'edit'
    channelData?: ChannelListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    panelMode: 'add',
    channelData: undefined
  })

  const emit = defineEmits<Emits>()
  const { width } = useWindowSize()
  const { getDict } = useDict()

  const channelTypeOptions = computed<Array<{ label: string; value: ChannelType }>>(
    () =>
      buildNumericDictOptions(getDict('ai_channel_type'), AI_CHANNEL_TYPE_OPTIONS) as Array<{
        label: string
        value: ChannelType
      }>
  )

  const statusOptions = computed<Array<{ label: string; value: ChannelStatus }>>(
    () =>
      buildNumericDictOptions(getDict('ai_channel_status'), AI_CHANNEL_STATUS_OPTIONS) as Array<{
        label: string
        value: ChannelStatus
      }>
  )

  const endpointScopeOptions = [
    'chat',
    'completions',
    'responses',
    'embeddings',
    'images',
    'audio',
    'moderations',
    'rerank',
    'files',
    'batches',
    'assistants',
    'threads',
    'vector_stores',
    'fine_tuning',
    'uploads',
    'models'
  ]

  const jsonFieldPresetMap = buildJsonFieldPresetMap()
  const basicJsonFields = [
    {
      key: 'models',
      prop: 'modelsText',
      label: '模型列表 JSON',
      rows: 6,
      required: true,
      placeholder: '如：["gpt-4o", "gpt-4.1"]',
      ...jsonFieldPresetMap.models
    },
    {
      key: 'modelMapping',
      prop: 'modelMappingText',
      label: '模型映射',
      rows: 5,
      required: false,
      placeholder: '如：{"gpt-4.1-mini":"gpt-4o-mini"}',
      ...jsonFieldPresetMap.modelMapping
    },
    {
      key: 'capabilities',
      prop: 'capabilitiesText',
      label: '能力标签',
      rows: 5,
      required: false,
      placeholder: '如：{"stream":true,"vision":true}',
      ...jsonFieldPresetMap.capabilities
    }
  ] as const

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)
  const vendorLoading = ref(false)
  const vendorOptions = ref<Api.AiVendor.VendorVo[]>([])

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const drawerSize = computed(() => (width.value < 1280 ? '100%' : '980px'))

  const createDefaultForm = (): ChannelFormModel => ({
    name: '',
    channelType: undefined,
    vendorCode: '',
    baseUrl: '',
    channelGroup: '',
    modelsText: '',
    modelMappingText: '',
    endpointScopes: [],
    capabilitiesText: '',
    configText: '',
    weight: 1,
    priority: 0,
    autoBan: true,
    testModel: '',
    status: undefined,
    remark: ''
  })

  const formData = reactive<ChannelFormModel>(createDefaultForm())

  const createJsonValidator =
    (label: string, required: boolean = false) =>
    (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      const errorMessage = validateJsonEditorValue(label, value, required)
      callback(errorMessage ? new Error(errorMessage) : undefined)
    }

  const getJsonFieldError = (label: string, value: string, required: boolean = false) =>
    validateJsonEditorValue(label, value, required)

  const applyJsonTemplate = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    if (fieldKey === 'models') {
      formData.modelsText = jsonFieldPresetMap.models.template
    } else if (fieldKey === 'modelMapping') {
      formData.modelMappingText = jsonFieldPresetMap.modelMapping.template
    } else if (fieldKey === 'capabilities') {
      formData.capabilitiesText = jsonFieldPresetMap.capabilities.template
    } else if (fieldKey === 'config') {
      formData.configText = jsonFieldPresetMap.config.template
    }
  }

  const clearJsonField = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    if (fieldKey === 'models') {
      formData.modelsText = ''
    } else if (fieldKey === 'modelMapping') {
      formData.modelMappingText = ''
    } else if (fieldKey === 'capabilities') {
      formData.capabilitiesText = ''
    } else if (fieldKey === 'config') {
      formData.configText = ''
    }
  }

  const formatJsonField = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    const currentValue =
      fieldKey === 'models'
        ? formData.modelsText
        : fieldKey === 'modelMapping'
          ? formData.modelMappingText
          : fieldKey === 'capabilities'
            ? formData.capabilitiesText
            : formData.configText

    if (!currentValue.trim()) {
      return
    }

    const formatted = formatJsonEditorValue(parseJsonEditorValue(currentValue))

    if (fieldKey === 'models') {
      formData.modelsText = formatted
    } else if (fieldKey === 'modelMapping') {
      formData.modelMappingText = formatted
    } else if (fieldKey === 'capabilities') {
      formData.capabilitiesText = formatted
    } else if (fieldKey === 'config') {
      formData.configText = formatted
    }
  }

  const rules: FormRules<ChannelFormModel> = {
    name: [
      { required: true, message: '请输入渠道名称', trigger: 'blur' },
      { min: 1, max: 128, message: '渠道名称长度必须在 1 到 128 个字符之间', trigger: 'blur' }
    ],
    channelType: [{ required: true, message: '请选择渠道类型', trigger: 'change' }],
    vendorCode: [{ required: true, message: '请选择供应商', trigger: 'change' }],
    baseUrl: [{ required: true, message: '请输入基础地址', trigger: 'blur' }],
    channelGroup: [
      { required: true, message: '请输入渠道分组', trigger: 'blur' },
      { min: 1, max: 64, message: '渠道分组长度必须在 1 到 64 个字符之间', trigger: 'blur' }
    ],
    modelsText: [{ validator: createJsonValidator('Models JSON', true), trigger: 'blur' }]
  }

  const resetForm = () => {
    Object.assign(formData, createDefaultForm())
    formRef.value?.clearValidate()
  }

  const loadVendors = async () => {
    vendorLoading.value = true
    try {
      const response = await fetchGetAiVendorList({
        page: 1,
        size: 200
      })
      vendorOptions.value = response.content
    } finally {
      vendorLoading.value = false
    }
  }

  const loadDetail = async (id: number) => {
    detailLoading.value = true
    try {
      const detail = await fetchGetAiChannelDetail(id)
      Object.assign(formData, {
        name: detail.name,
        channelType: detail.channelType,
        vendorCode: detail.vendorCode,
        baseUrl: detail.baseUrl,
        channelGroup: detail.channelGroup,
        modelsText: formatJsonEditorValue(detail.models, '[]'),
        modelMappingText: formatJsonEditorValue(detail.modelMapping),
        endpointScopes: Array.isArray(detail.endpointScopes)
          ? detail.endpointScopes.filter((item): item is string => typeof item === 'string')
          : [],
        capabilitiesText: formatJsonEditorValue(detail.capabilities),
        configText: '',
        weight: detail.weight,
        priority: detail.priority,
        autoBan: detail.autoBan,
        testModel: detail.testModel,
        status: detail.status,
        remark: detail.remark
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.modelValue, props.panelMode, props.channelData?.id],
    async ([visibleValue, panelMode, id]) => {
      if (!visibleValue) {
        resetForm()
        return
      }

      await loadVendors()

      if (panelMode === 'edit' && typeof id === 'number') {
        await loadDetail(id)
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )

  const buildCreatePayload = (): Api.AiChannel.CreateChannelParams => ({
    name: formData.name.trim(),
    channelType: formData.channelType!,
    vendorCode: formData.vendorCode,
    baseUrl: formData.baseUrl.trim(),
    channelGroup: formData.channelGroup.trim(),
    models: parseJsonEditorValue(formData.modelsText, []),
    modelMapping: parseJsonEditorValue(formData.modelMappingText, null),
    endpointScopes: formData.endpointScopes,
    capabilities: parseJsonEditorValue(formData.capabilitiesText, null),
    config: parseJsonEditorValue(formData.configText, null),
    weight: formData.weight ?? 1,
    priority: formData.priority ?? 0,
    autoBan: formData.autoBan,
    testModel: formData.testModel.trim(),
    remark: formData.remark.trim()
  })

  const buildUpdatePayload = (): Api.AiChannel.UpdateChannelParams => {
    const payload: Api.AiChannel.UpdateChannelParams = {
      name: formData.name.trim(),
      vendorCode: formData.vendorCode,
      baseUrl: formData.baseUrl.trim(),
      status: formData.status,
      models: parseJsonEditorValue(formData.modelsText, []),
      modelMapping: parseJsonEditorValue(formData.modelMappingText, null),
      channelGroup: formData.channelGroup.trim(),
      endpointScopes: formData.endpointScopes,
      capabilities: parseJsonEditorValue(formData.capabilitiesText, null),
      autoBan: formData.autoBan,
      testModel: formData.testModel.trim(),
      weight: formData.weight ?? 1,
      priority: formData.priority ?? 0,
      remark: formData.remark.trim()
    }

    if (formData.configText.trim()) {
      payload.config = parseJsonEditorValue(formData.configText, null)
    }

    return payload
  }

  const handleClose = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true

    try {
      if (props.panelMode === 'add') {
        await fetchCreateAiChannel(buildCreatePayload())
      } else if (typeof props.channelData?.id === 'number') {
        await fetchUpdateAiChannel(props.channelData.id, buildUpdatePayload())
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
  .channel-form {
    :deep(.el-form-item__label) {
      white-space: normal;
    }
  }

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

  .json-editor-collapse {
    :deep(.el-collapse-item__header) {
      font-weight: 600;
    }

    :deep(.el-collapse-item__content) {
      padding-bottom: 0;
    }
  }
</style>
