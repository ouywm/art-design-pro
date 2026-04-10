<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增 AI 供应商' : '编辑 AI 供应商'"
    width="720px"
    destroy-on-close
    align-center
  >
    <ElForm
      ref="formRef"
      v-loading="detailLoading"
      :model="formData"
      :rules="rules"
      label-width="108px"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="供应商编码" prop="vendorCode">
            <ElInput
              v-model="formData.vendorCode"
              :disabled="dialogType === 'edit'"
              placeholder="请输入供应商编码"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="供应商名称" prop="vendorName">
            <ElInput v-model="formData.vendorName" placeholder="请输入供应商名称" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="API 风格" prop="apiStyle">
            <ElInput v-model="formData.apiStyle" placeholder="如：openai-compatible" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="排序" prop="vendorSort">
            <ElInputNumber
              v-model="formData.vendorSort"
              :min="0"
              placeholder="请输入排序值"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="基础地址" prop="baseUrl">
            <ElInput v-model="formData.baseUrl" placeholder="请输入基础地址" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="文档地址" prop="docUrl">
            <ElInput v-model="formData.docUrl" placeholder="请输入文档地址" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="图标" prop="icon">
            <ElInput v-model="formData.icon" placeholder="请输入图标 URL 或标识" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="是否启用" prop="enabled">
            <ElSwitch v-model="formData.enabled" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="描述" prop="description">
            <ElInput
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入供应商描述"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="Metadata JSON" prop="metadataText">
            <div class="json-editor-block">
              <div class="json-editor-toolbar">
                <div class="json-editor-meta">
                  <div class="json-editor-title">Metadata JSON</div>
                  <div class="json-editor-description">
                    用于补充供应商扩展信息，例如官网标识、默认请求头、品牌配置等。
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
                :rows="8"
                placeholder='如：{"official":true,"website":"https://example.com"}'
                class="json-editor-input"
              />

              <div class="json-editor-feedback" :class="{ 'is-error': metadataErrorMessage }">
                {{ metadataErrorMessage || '可留空，留空时提交 null。' }}
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
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchCreateAiVendor, fetchGetAiVendorDetail, fetchUpdateAiVendor } from '@/api/ai-admin'
  import { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    buildJsonEditorPreset,
    formatJsonEditorValue,
    parseJsonEditorValue,
    validateJsonEditorValue
  } from '../../json-editor'
  import type { VendorFormModel, VendorListItem } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    vendorData?: Partial<VendorListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', type: DialogType): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)
  const formRef = ref<FormInstance>()
  const detailLoading = ref(false)
  const submitLoading = ref(false)
  const metadataPreset = buildJsonEditorPreset({
    description: '用于补充供应商扩展信息，例如官网标识、默认请求头、品牌配置等。',
    emptyHint: '可留空，留空时提交 null。',
    templateData: {
      official: true,
      website: 'https://example.com'
    }
  })

  const createDefaultForm = (): VendorFormModel => ({
    vendorCode: '',
    vendorName: '',
    apiStyle: '',
    baseUrl: '',
    docUrl: '',
    icon: '',
    description: '',
    metadataText: '',
    vendorSort: 0,
    enabled: true,
    remark: ''
  })

  const formData = reactive<VendorFormModel>(createDefaultForm())

  const validateMetadata = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    const errorMessage = validateJsonEditorValue('Metadata JSON', value)
    callback(errorMessage ? new Error(errorMessage) : undefined)
  }

  const metadataErrorMessage = computed(() =>
    validateJsonEditorValue('Metadata JSON', formData.metadataText)
  )

  const rules: FormRules<VendorFormModel> = {
    vendorCode: [
      { required: true, message: '请输入供应商编码', trigger: 'blur' },
      { min: 1, max: 64, message: '供应商编码长度必须在 1 到 64 个字符之间', trigger: 'blur' }
    ],
    vendorName: [
      { required: true, message: '请输入供应商名称', trigger: 'blur' },
      { min: 1, max: 128, message: '供应商名称长度必须在 1 到 128 个字符之间', trigger: 'blur' }
    ],
    metadataText: [{ validator: validateMetadata, trigger: 'blur' }]
  }

  const resetForm = () => {
    Object.assign(formData, createDefaultForm())
    formRef.value?.clearValidate()
  }

  const applyMetadataTemplate = () => {
    formData.metadataText = metadataPreset.template
  }

  const formatMetadata = () => {
    if (!formData.metadataText.trim()) {
      return
    }
    formData.metadataText = formatJsonEditorValue(parseJsonEditorValue(formData.metadataText))
  }

  const loadDetail = async (id: number) => {
    detailLoading.value = true
    try {
      const detail = await fetchGetAiVendorDetail(id)
      Object.assign(formData, {
        vendorCode: detail.vendorCode,
        vendorName: detail.vendorName,
        apiStyle: detail.apiStyle,
        baseUrl: detail.baseUrl,
        docUrl: detail.docUrl,
        icon: detail.icon,
        description: detail.description,
        metadataText: formatJsonEditorValue(detail.metadata),
        vendorSort: detail.vendorSort,
        enabled: detail.enabled,
        remark: detail.remark
      })
    } finally {
      detailLoading.value = false
    }
  }

  const parseMetadata = () => {
    return parseJsonEditorValue(formData.metadataText, null)
  }

  watch(
    () => [props.visible, props.type, props.vendorData?.id],
    async ([visible, type, id]) => {
      if (!visible) {
        resetForm()
        return
      }

      if (type === 'edit' && typeof id === 'number') {
        await loadDetail(id)
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true

    try {
      const payloadBase = {
        vendorName: formData.vendorName.trim(),
        apiStyle: formData.apiStyle.trim(),
        baseUrl: formData.baseUrl.trim(),
        docUrl: formData.docUrl.trim(),
        icon: formData.icon.trim(),
        description: formData.description.trim(),
        metadata: parseMetadata(),
        vendorSort: formData.vendorSort ?? 0,
        enabled: formData.enabled,
        remark: formData.remark.trim()
      }

      if (dialogType.value === 'add') {
        await fetchCreateAiVendor({
          vendorCode: formData.vendorCode.trim(),
          ...payloadBase
        })
      } else if (typeof props.vendorData?.id === 'number') {
        await fetchUpdateAiVendor(props.vendorData.id, payloadBase)
      }

      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
      emit('submit', dialogType.value)
      dialogVisible.value = false
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
