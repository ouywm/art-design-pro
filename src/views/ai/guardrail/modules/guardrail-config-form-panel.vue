<template>
  <ElDrawer
    v-model="visible"
    :title="panelMode === 'add' ? '新增 Guardrail Config' : '编辑 Guardrail Config'"
    :size="drawerSize"
    destroy-on-close
  >
    <ElForm
      ref="formRef"
      v-loading="detailLoading"
      class="guardrail-config-form"
      :model="formData"
      :rules="rules"
      label-width="128px"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="Scope Type" prop="scopeType">
            <ElSelect v-model="formData.scopeType" placeholder="请选择 scope type">
              <ElOption label="platform" value="platform" />
              <ElOption label="organization" value="organization" />
              <ElOption label="project" value="project" />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="Mode" prop="mode">
            <ElSelect v-model="formData.mode" placeholder="请选择 mode">
              <ElOption label="enforce" value="enforce" />
              <ElOption label="observe" value="observe" />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="Organization ID" prop="organizationId">
            <ElInputNumber
              v-model="formData.organizationId"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="Project ID" prop="projectId">
            <ElInputNumber
              v-model="formData.projectId"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="Enabled" prop="enabled">
            <ElSwitch v-model="formData.enabled" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="Max File Size MB" prop="maxFileSizeMb">
            <ElInputNumber v-model="formData.maxFileSizeMb" :min="0" style="width: 100%" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="PII Action" prop="piiAction">
            <ElSelect v-model="formData.piiAction" placeholder="请选择 PII action">
              <ElOption label="allow" value="allow" />
              <ElOption label="warn" value="warn" />
              <ElOption label="redact" value="redact" />
              <ElOption label="block" value="block" />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="Secret Action" prop="secretAction">
            <ElSelect v-model="formData.secretAction" placeholder="请选择 secret action">
              <ElOption label="allow" value="allow" />
              <ElOption label="warn" value="warn" />
              <ElOption label="redact" value="redact" />
              <ElOption label="block" value="block" />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElAlert
            title="systemRules、allowedFileTypes、metadata 使用 JSON 输入。"
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
          <ElFormItem label="Remark" prop="remark">
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
    fetchCreateAiGuardrailConfig,
    fetchGetAiGuardrailConfigDetail,
    fetchUpdateAiGuardrailConfig
  } from '@/api/ai-admin'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    buildJsonEditorPreset,
    formatJsonEditorValue,
    parseJsonEditorValue,
    validateJsonEditorValue
  } from '../../json-editor'
  import type { GuardrailConfigFormModel, GuardrailConfigItem } from '../types'

  interface Props {
    modelValue: boolean
    panelMode: 'add' | 'edit'
    configData?: GuardrailConfigItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    panelMode: 'add',
    configData: undefined
  })

  const emit = defineEmits<Emits>()
  const { width } = useWindowSize()

  const jsonFieldPresetMap = {
    systemRules: buildJsonEditorPreset({
      description: '系统级规则配置，例如 jailbreak、pii、secrets 等。',
      emptyHint: '可留空，留空时提交空对象。',
      templateData: { jailbreak: true, pii: true, secrets: true }
    }),
    allowedFileTypes: buildJsonEditorPreset({
      description: '允许的文件类型列表。',
      emptyHint: '可留空，留空时提交空数组。',
      templateData: ['pdf', 'docx', 'png']
    }),
    metadata: buildJsonEditorPreset({
      description: '扩展配置元数据。',
      emptyHint: '可留空，留空时提交空对象。',
      templateData: { owner: 'security-team' }
    })
  }

  const jsonFields = [
    {
      key: 'systemRules',
      prop: 'systemRulesText',
      label: 'System Rules JSON',
      rows: 5,
      required: false,
      placeholder: '如：{"jailbreak":true,"pii":true}',
      ...jsonFieldPresetMap.systemRules
    },
    {
      key: 'allowedFileTypes',
      prop: 'allowedFileTypesText',
      label: 'Allowed File Types JSON',
      rows: 4,
      required: false,
      placeholder: '如：["pdf","docx","png"]',
      ...jsonFieldPresetMap.allowedFileTypes
    },
    {
      key: 'metadata',
      prop: 'metadataText',
      label: 'Metadata JSON',
      rows: 4,
      required: false,
      placeholder: '如：{"owner":"security-team"}',
      ...jsonFieldPresetMap.metadata
    }
  ] as const

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const drawerSize = computed(() => (width.value < 1280 ? '100%' : '980px'))

  const createDefaultForm = (): GuardrailConfigFormModel => ({
    scopeType: 'platform',
    organizationId: 0,
    projectId: 0,
    enabled: true,
    mode: 'enforce',
    systemRulesText: '',
    allowedFileTypesText: '',
    maxFileSizeMb: 20,
    piiAction: 'redact',
    secretAction: 'block',
    metadataText: '',
    remark: ''
  })

  const formData = reactive<GuardrailConfigFormModel>(createDefaultForm())

  const rules: FormRules<GuardrailConfigFormModel> = {
    scopeType: [{ required: true, message: '请选择 scope type', trigger: 'change' }],
    mode: [{ required: true, message: '请选择 mode', trigger: 'change' }],
    piiAction: [{ required: true, message: '请选择 PII action', trigger: 'change' }],
    secretAction: [{ required: true, message: '请选择 secret action', trigger: 'change' }]
  }

  const getJsonFieldError = (label: string, value: string, required: boolean = false) =>
    validateJsonEditorValue(label, value, required)

  const applyJsonTemplate = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    if (fieldKey === 'systemRules')
      formData.systemRulesText = jsonFieldPresetMap.systemRules.template
    else if (fieldKey === 'allowedFileTypes')
      formData.allowedFileTypesText = jsonFieldPresetMap.allowedFileTypes.template
    else formData.metadataText = jsonFieldPresetMap.metadata.template
  }

  const clearJsonField = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    if (fieldKey === 'systemRules') formData.systemRulesText = ''
    else if (fieldKey === 'allowedFileTypes') formData.allowedFileTypesText = ''
    else formData.metadataText = ''
  }

  const formatJsonField = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    const currentValue =
      fieldKey === 'systemRules'
        ? formData.systemRulesText
        : fieldKey === 'allowedFileTypes'
          ? formData.allowedFileTypesText
          : formData.metadataText
    if (!currentValue.trim()) return
    const formatted = formatJsonEditorValue(parseJsonEditorValue(currentValue))
    if (fieldKey === 'systemRules') formData.systemRulesText = formatted
    else if (fieldKey === 'allowedFileTypes') formData.allowedFileTypesText = formatted
    else formData.metadataText = formatted
  }

  const resetForm = () => {
    Object.assign(formData, createDefaultForm())
    formRef.value?.clearValidate()
  }

  const loadDetail = async (id: number) => {
    detailLoading.value = true
    try {
      const detail = await fetchGetAiGuardrailConfigDetail(id)
      Object.assign(formData, {
        scopeType: detail.scopeType,
        organizationId: detail.organizationId,
        projectId: detail.projectId,
        enabled: detail.enabled,
        mode: detail.mode,
        systemRulesText: formatJsonEditorValue(detail.systemRules),
        allowedFileTypesText: formatJsonEditorValue(detail.allowedFileTypes),
        maxFileSizeMb: detail.maxFileSizeMb,
        piiAction: detail.piiAction,
        secretAction: detail.secretAction,
        metadataText: formatJsonEditorValue(detail.metadata),
        remark: detail.remark
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.modelValue, props.panelMode, props.configData?.id],
    async ([visibleValue, panelMode, id]) => {
      if (!visibleValue) {
        resetForm()
        return
      }
      if (panelMode === 'edit' && typeof id === 'number') await loadDetail(id)
      else resetForm()
    },
    { immediate: true }
  )

  const buildPayload = () => ({
    scopeType: formData.scopeType,
    organizationId: formData.organizationId ?? 0,
    projectId: formData.projectId ?? 0,
    enabled: formData.enabled,
    mode: formData.mode,
    systemRules: parseJsonEditorValue(formData.systemRulesText, {}),
    allowedFileTypes: parseJsonEditorValue(formData.allowedFileTypesText, []),
    maxFileSizeMb: formData.maxFileSizeMb ?? 20,
    piiAction: formData.piiAction,
    secretAction: formData.secretAction,
    metadata: parseJsonEditorValue(formData.metadataText, {}),
    remark: formData.remark.trim()
  })

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate()
    submitLoading.value = true
    try {
      if (props.panelMode === 'add') await fetchCreateAiGuardrailConfig(buildPayload())
      else if (typeof props.configData?.id === 'number') {
        await fetchUpdateAiGuardrailConfig(props.configData.id, buildPayload())
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
  .guardrail-config-form {
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
</style>
