<template>
  <ElDrawer
    v-model="visible"
    :title="panelMode === 'add' ? '新增告警规则' : '编辑告警规则'"
    :size="drawerSize"
    destroy-on-close
  >
    <ElForm
      ref="formRef"
      v-loading="detailLoading"
      class="alert-rule-form"
      :model="formData"
      :rules="rules"
      label-width="118px"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="域编码" prop="domainCode">
            <ElInput
              v-model="formData.domainCode"
              :disabled="panelMode === 'edit'"
              placeholder="请输入域编码"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="规则编码" prop="ruleCode">
            <ElInput
              v-model="formData.ruleCode"
              :disabled="panelMode === 'edit'"
              placeholder="请输入规则编码"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="规则名称" prop="ruleName">
            <ElInput v-model="formData.ruleName" placeholder="请输入规则名称" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="严重级别" prop="severity">
            <ElSelect v-model="formData.severity" placeholder="请选择严重级别">
              <ElOption
                v-for="item in severityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="panelMode === 'edit' ? 12 : 24">
          <ElFormItem label="指标键" prop="metricKey">
            <ElInput v-model="formData.metricKey" placeholder="请输入指标键" />
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

        <ElCol :span="24">
          <ElFormItem label="条件表达式" prop="conditionExpr">
            <ElInput
              v-model="formData.conditionExpr"
              type="textarea"
              :rows="4"
              placeholder="如：error_rate >= 0.05 && window == '5m'"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElAlert
            title="thresholdConfig 与 channelConfig 使用 JSON 输入。规则编码与域编码在编辑时不可修改。"
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

        <ElCol :span="12">
          <ElFormItem label="默认静默秒数" prop="silenceSeconds">
            <ElInputNumber
              v-model="formData.silenceSeconds"
              :min="0"
              placeholder="请输入静默秒数"
              style="width: 100%"
            />
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
    fetchCreateAiAlertRule,
    fetchGetAiAlertRuleDetail,
    fetchUpdateAiAlertRule
  } from '@/api/ai-admin'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    buildJsonEditorPreset,
    formatJsonEditorValue,
    parseJsonEditorValue,
    validateJsonEditorValue
  } from '../../json-editor'
  import type { AlertRuleFormModel, AlertRuleListItem, AlertRuleStatus } from '../types'

  interface Props {
    modelValue: boolean
    panelMode: 'add' | 'edit'
    ruleData?: AlertRuleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    panelMode: 'add',
    ruleData: undefined
  })

  const emit = defineEmits<Emits>()
  const { width } = useWindowSize()

  const severityOptions = [
    { label: 'P1', value: 1 },
    { label: 'P2', value: 2 },
    { label: 'P3', value: 3 },
    { label: 'P4', value: 4 }
  ]

  const statusOptions: Array<{ label: string; value: AlertRuleStatus }> = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 2 }
  ]

  const jsonFieldPresetMap = {
    thresholdConfig: buildJsonEditorPreset({
      description: '填写阈值配置，例如统计窗口、阈值、比较方式等。',
      emptyHint: '可留空，留空时提交空对象。',
      templateData: {
        operator: 'gte',
        value: 5,
        window: '5m'
      }
    }),
    channelConfig: buildJsonEditorPreset({
      description: '填写通知渠道配置，例如 webhook、模板、通知对象等。',
      emptyHint: '可留空，留空时提交空对象。',
      templateData: {
        channels: ['webhook'],
        template: 'default'
      }
    })
  }

  const jsonFields = [
    {
      key: 'thresholdConfig',
      prop: 'thresholdConfigText',
      label: '阈值配置 JSON',
      rows: 6,
      required: false,
      placeholder: '如：{"operator":"gte","value":5,"window":"5m"}',
      ...jsonFieldPresetMap.thresholdConfig
    },
    {
      key: 'channelConfig',
      prop: 'channelConfigText',
      label: '通知渠道 JSON',
      rows: 6,
      required: false,
      placeholder: '如：{"channels":["webhook"],"template":"default"}',
      ...jsonFieldPresetMap.channelConfig
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

  const createDefaultForm = (): AlertRuleFormModel => ({
    domainCode: 'relay',
    ruleCode: '',
    ruleName: '',
    severity: 2,
    metricKey: '',
    conditionExpr: '',
    thresholdConfigText: '',
    channelConfigText: '',
    silenceSeconds: 0,
    status: undefined
  })

  const formData = reactive<AlertRuleFormModel>(createDefaultForm())

  const createJsonValidator =
    (label: string, required: boolean = false) =>
    (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      const errorMessage = validateJsonEditorValue(label, value, required)
      callback(errorMessage ? new Error(errorMessage) : undefined)
    }

  const getJsonFieldError = (label: string, value: string, required: boolean = false) =>
    validateJsonEditorValue(label, value, required)

  const applyJsonTemplate = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    if (fieldKey === 'thresholdConfig') {
      formData.thresholdConfigText = jsonFieldPresetMap.thresholdConfig.template
    } else {
      formData.channelConfigText = jsonFieldPresetMap.channelConfig.template
    }
  }

  const clearJsonField = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    if (fieldKey === 'thresholdConfig') {
      formData.thresholdConfigText = ''
    } else {
      formData.channelConfigText = ''
    }
  }

  const formatJsonField = (fieldKey: keyof typeof jsonFieldPresetMap) => {
    const currentValue =
      fieldKey === 'thresholdConfig' ? formData.thresholdConfigText : formData.channelConfigText

    if (!currentValue.trim()) {
      return
    }

    const formatted = formatJsonEditorValue(parseJsonEditorValue(currentValue))
    if (fieldKey === 'thresholdConfig') {
      formData.thresholdConfigText = formatted
    } else {
      formData.channelConfigText = formatted
    }
  }

  const rules: FormRules<AlertRuleFormModel> = {
    domainCode: [
      { required: true, message: '请输入域编码', trigger: 'blur' },
      { min: 1, max: 32, message: '域编码长度必须在 1 到 32 个字符之间', trigger: 'blur' }
    ],
    ruleCode: [
      { required: true, message: '请输入规则编码', trigger: 'blur' },
      { min: 1, max: 64, message: '规则编码长度必须在 1 到 64 个字符之间', trigger: 'blur' }
    ],
    ruleName: [
      { required: true, message: '请输入规则名称', trigger: 'blur' },
      { min: 1, max: 128, message: '规则名称长度必须在 1 到 128 个字符之间', trigger: 'blur' }
    ],
    severity: [{ required: true, message: '请选择严重级别', trigger: 'change' }],
    metricKey: [
      { required: true, message: '请输入指标键', trigger: 'blur' },
      { min: 1, max: 128, message: '指标键长度必须在 1 到 128 个字符之间', trigger: 'blur' }
    ],
    thresholdConfigText: [{ validator: createJsonValidator('阈值配置 JSON'), trigger: 'blur' }],
    channelConfigText: [{ validator: createJsonValidator('通知渠道 JSON'), trigger: 'blur' }]
  }

  const resetForm = () => {
    Object.assign(formData, createDefaultForm())
    formRef.value?.clearValidate()
  }

  const loadDetail = async (id: number) => {
    detailLoading.value = true
    try {
      const detail = await fetchGetAiAlertRuleDetail(id)
      Object.assign(formData, {
        domainCode: detail.domainCode,
        ruleCode: detail.ruleCode,
        ruleName: detail.ruleName,
        severity: detail.severity,
        metricKey: detail.metricKey,
        conditionExpr: detail.conditionExpr,
        thresholdConfigText: formatJsonEditorValue(detail.thresholdConfig),
        channelConfigText: formatJsonEditorValue(detail.channelConfig),
        silenceSeconds: detail.silenceSeconds,
        status: detail.status
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.modelValue, props.panelMode, props.ruleData?.id],
    async ([visibleValue, panelMode, id]) => {
      if (!visibleValue) {
        resetForm()
        return
      }

      if (panelMode === 'edit' && typeof id === 'number') {
        await loadDetail(id)
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )

  const buildCreatePayload = (): Api.AiAlertRule.CreateAlertRuleParams => ({
    domainCode: formData.domainCode.trim(),
    ruleCode: formData.ruleCode.trim(),
    ruleName: formData.ruleName.trim(),
    severity: formData.severity ?? 2,
    metricKey: formData.metricKey.trim(),
    conditionExpr: formData.conditionExpr.trim(),
    thresholdConfig: parseJsonEditorValue(formData.thresholdConfigText, {}),
    channelConfig: parseJsonEditorValue(formData.channelConfigText, {}),
    silenceSeconds: formData.silenceSeconds ?? 0,
    status: formData.status
  })

  const buildUpdatePayload = (): Api.AiAlertRule.UpdateAlertRuleParams => ({
    ruleName: formData.ruleName.trim(),
    severity: formData.severity ?? 2,
    metricKey: formData.metricKey.trim(),
    conditionExpr: formData.conditionExpr.trim(),
    thresholdConfig: parseJsonEditorValue(formData.thresholdConfigText, {}),
    channelConfig: parseJsonEditorValue(formData.channelConfigText, {}),
    silenceSeconds: formData.silenceSeconds ?? 0,
    status: formData.status
  })

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true

    try {
      if (props.panelMode === 'add') {
        await fetchCreateAiAlertRule(buildCreatePayload())
      } else if (typeof props.ruleData?.id === 'number') {
        await fetchUpdateAiAlertRule(props.ruleData.id, buildUpdatePayload())
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
  .alert-rule-form {
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
