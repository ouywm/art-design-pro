<template>
  <ElDrawer v-model="visible" title="新增告警静默" :size="drawerSize" destroy-on-close>
    <ElForm
      ref="formRef"
      class="alert-silence-form"
      :model="formData"
      :rules="rules"
      label-width="118px"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="规则 ID" prop="alertRuleId">
            <ElInputNumber
              v-model="formData.alertRuleId"
              :min="1"
              placeholder="请输入规则 ID"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="作用域类型" prop="scopeType">
            <ElInput v-model="formData.scopeType" placeholder="如：rule / source" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="作用域键" prop="scopeKey">
            <ElInput v-model="formData.scopeKey" placeholder="请输入作用域键" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="静默原因" prop="reason">
            <ElInput
              v-model="formData.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入静默原因"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElAlert
            title="metadata 使用 JSON 输入；startTime 留空时后端会自动使用当前时间。"
            type="info"
            :closable="false"
            show-icon
            class="!mb-2"
          />
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="Metadata JSON" prop="metadataText">
            <div class="json-editor-block">
              <div class="json-editor-toolbar">
                <div class="json-editor-meta">
                  <div class="json-editor-title">Metadata JSON</div>
                  <div class="json-editor-description">
                    用于补充静默策略上下文，例如操作者说明、环境信息、来源标签等。
                  </div>
                </div>

                <div class="json-editor-actions">
                  <ElButton text size="small" @click="applyMetadataTemplate">模板</ElButton>
                  <ElButton text size="small" @click="formatMetadata">格式化</ElButton>
                  <ElButton text size="small" @click="formData.metadataText = ''">清空</ElButton>
                </div>
              </div>

              <ElInput
                v-model="formData.metadataText"
                type="textarea"
                :rows="6"
                placeholder='如：{"operator":"ops","ticket":"INC-1024"}'
                class="json-editor-input"
              />

              <div class="json-editor-feedback" :class="{ 'is-error': metadataErrorMessage }">
                {{ metadataErrorMessage || '可留空，留空时提交空对象。' }}
              </div>
            </div>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="开始时间" prop="startTime">
            <ElDatePicker
              v-model="formData.startTime"
              clearable
              style="width: 100%"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              placeholder="留空则立即生效"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="结束时间" prop="endTime">
            <ElDatePicker
              v-model="formData.endTime"
              style="width: 100%"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              placeholder="请选择结束时间"
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
  import { fetchCreateAiAlertSilence } from '@/api/ai-admin'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    buildJsonEditorPreset,
    formatJsonEditorValue,
    parseJsonEditorValue,
    validateJsonEditorValue
  } from '../../json-editor'
  import type { AlertSilenceFormModel } from '../types'

  interface Props {
    modelValue: boolean
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false
  })

  const emit = defineEmits<Emits>()
  const { width } = useWindowSize()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const metadataPreset = buildJsonEditorPreset({
    description: '用于补充静默策略上下文，例如操作者说明、环境信息、来源标签等。',
    emptyHint: '可留空，留空时提交空对象。',
    templateData: {
      operator: 'ops',
      ticket: 'INC-1024'
    }
  })

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const drawerSize = computed(() => (width.value < 1280 ? '100%' : '980px'))

  const createDefaultForm = (): AlertSilenceFormModel => ({
    alertRuleId: undefined,
    scopeType: 'rule',
    scopeKey: '',
    reason: '',
    metadataText: '',
    startTime: null,
    endTime: null
  })

  const formData = reactive<AlertSilenceFormModel>(createDefaultForm())

  const metadataErrorMessage = computed(() =>
    validateJsonEditorValue('Metadata JSON', formData.metadataText)
  )

  const rules: FormRules<AlertSilenceFormModel> = {
    alertRuleId: [{ required: true, message: '请输入规则 ID', trigger: 'blur' }],
    scopeType: [
      { required: true, message: '请输入作用域类型', trigger: 'blur' },
      { min: 1, max: 32, message: '作用域类型长度必须在 1 到 32 个字符之间', trigger: 'blur' }
    ],
    scopeKey: [{ max: 128, message: '作用域键长度不能超过 128 个字符', trigger: 'blur' }],
    reason: [{ max: 255, message: '静默原因长度不能超过 255 个字符', trigger: 'blur' }],
    metadataText: [
      {
        validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
          const errorMessage = validateJsonEditorValue('Metadata JSON', value)
          callback(errorMessage ? new Error(errorMessage) : undefined)
        },
        trigger: 'blur'
      }
    ],
    endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
  }

  const resetForm = () => {
    Object.assign(formData, createDefaultForm())
    formRef.value?.clearValidate()
  }

  watch(
    () => props.modelValue,
    (visibleValue) => {
      if (!visibleValue) {
        resetForm()
      }
    }
  )

  const applyMetadataTemplate = () => {
    formData.metadataText = metadataPreset.template
  }

  const formatMetadata = () => {
    if (!formData.metadataText.trim()) {
      return
    }
    formData.metadataText = formatJsonEditorValue(parseJsonEditorValue(formData.metadataText))
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true

    try {
      await fetchCreateAiAlertSilence({
        alertRuleId: formData.alertRuleId!,
        scopeType: formData.scopeType.trim(),
        scopeKey: formData.scopeKey.trim(),
        reason: formData.reason.trim(),
        metadata: parseJsonEditorValue(formData.metadataText, {}),
        startTime: formData.startTime,
        endTime: formData.endTime!
      })

      ElMessage.success('新增成功')
      emit('success')
      visible.value = false
    } finally {
      submitLoading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .alert-silence-form {
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
