<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增模型配置' : '编辑模型配置'"
    width="920px"
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
          <ElFormItem label="模型标识" prop="modelName">
            <ElInput
              v-model="formData.modelName"
              :disabled="dialogType === 'edit'"
              placeholder="请输入模型标识，例如 gpt-4o"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="显示名称" prop="displayName">
            <ElInput v-model="formData.displayName" placeholder="请输入显示名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="模型类型" prop="modelType">
            <ElSelect v-model="formData.modelType" placeholder="请选择模型类型">
              <ElOption
                v-for="item in MODEL_CONFIG_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="供应商" prop="vendorCode">
            <ElSelect v-model="formData.vendorCode" filterable placeholder="请选择供应商">
              <ElOption
                v-for="item in vendorOptions"
                :key="item.value"
                :label="item.label + (item.enabled ? '' : '（已禁用）')"
                :value="item.value"
                :disabled="!item.enabled"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="货币" prop="currency">
            <ElInput v-model="formData.currency" maxlength="16" placeholder="默认 USD" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="启用状态" prop="enabled">
            <ElSwitch v-model="formData.enabled" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="生效时间" prop="effectiveFrom">
            <ElDatePicker
              v-model="formData.effectiveFrom"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              placeholder="可选"
              clearable
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="最大上下文" prop="maxContext">
            <ElInputNumber
              v-model="formData.maxContext"
              :min="0"
              :step="1024"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="16">
        <ElCol :span="6">
          <ElFormItem label="输入倍率" prop="inputRatio">
            <ElInputNumber
              v-model="formData.inputRatio"
              :min="0"
              :step="0.1"
              :precision="4"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="输出倍率" prop="outputRatio">
            <ElInputNumber
              v-model="formData.outputRatio"
              :min="0"
              :step="0.1"
              :precision="4"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="缓存倍率" prop="cachedInputRatio">
            <ElInputNumber
              v-model="formData.cachedInputRatio"
              :min="0"
              :step="0.1"
              :precision="4"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="推理倍率" prop="reasoningRatio">
            <ElInputNumber
              v-model="formData.reasoningRatio"
              :min="0"
              :step="0.1"
              :precision="4"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="支持 Endpoint" prop="supportedEndpoints">
        <ElSelect
          v-model="formData.supportedEndpoints"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或直接输入 endpoint"
        >
          <ElOption
            v-for="item in COMMON_ENDPOINT_SCOPE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="能力标签" prop="capabilities">
        <ElSelect
          v-model="formData.capabilities"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或直接输入 capability"
        >
          <ElOption
            v-for="item in COMMON_CAPABILITY_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="扩展元数据" prop="metadataText">
        <ElInput
          v-model="formData.metadataText"
          type="textarea"
          :rows="5"
          placeholder='请输入 JSON，例如：{"family":"gpt-4o"}'
        />
      </ElFormItem>

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
    fetchCreateModelConfig,
    fetchGetModelConfigDetail,
    fetchUpdateModelConfig
  } from '@/api/ai-model-config'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { COMMON_CAPABILITY_OPTIONS, COMMON_ENDPOINT_SCOPE_OPTIONS } from '../../channel/constants'
  import { MODEL_CONFIG_TYPE_OPTIONS } from '../constants'
  import type { FormModel, ModelConfigListItem, VendorOption } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    modelConfigData?: Partial<ModelConfigListItem>
    vendorOptions: VendorOption[]
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
  const vendorOptions = computed(() => props.vendorOptions)

  const createDefaultFormData = (): FormModel => ({
    modelName: '',
    displayName: '',
    modelType: 1,
    vendorCode: '',
    supportedEndpoints: [],
    inputRatio: 1,
    outputRatio: 1,
    cachedInputRatio: 0,
    reasoningRatio: 0,
    capabilities: [],
    maxContext: 0,
    currency: 'USD',
    effectiveFrom: '',
    metadataText: '',
    enabled: true,
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const rules: FormRules = {
    modelName: [{ required: true, message: '请输入模型标识', trigger: 'blur' }],
    displayName: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
    modelType: [{ required: true, message: '请选择模型类型', trigger: 'change' }],
    vendorCode: [{ required: true, message: '请选择供应商', trigger: 'change' }],
    currency: [{ required: true, message: '请输入货币编码', trigger: 'blur' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
  }

  const normalizeOptionalString = (value: string) => value.trim() || undefined

  const stringifyJson = (value: unknown) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value as Record<string, unknown>).length === 0
    ) {
      return ''
    }
    return value === undefined || value === null ? '' : JSON.stringify(value, null, 2)
  }

  const parseJsonValue = (value: string, fieldLabel: string): unknown => {
    const text = value.trim()
    if (!text) return {}
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`${fieldLabel}必须是合法 JSON`)
    }
  }

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.modelConfigData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetModelConfigDetail(props.modelConfigData!.id!)
      Object.assign(formData, {
        modelName: detail.modelName,
        displayName: detail.displayName,
        modelType: detail.modelType,
        vendorCode: detail.vendorCode,
        supportedEndpoints: detail.supportedEndpoints || [],
        inputRatio: detail.inputRatio,
        outputRatio: detail.outputRatio,
        cachedInputRatio: detail.cachedInputRatio,
        reasoningRatio: detail.reasoningRatio,
        capabilities: detail.capabilities || [],
        maxContext: detail.maxContext,
        currency: detail.currency || 'USD',
        effectiveFrom: detail.effectiveFrom || '',
        metadataText: stringifyJson(detail.metadata),
        enabled: detail.enabled,
        remark: detail.remark || ''
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.modelConfigData?.id],
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
        displayName: formData.displayName.trim(),
        modelType: formData.modelType!,
        vendorCode: formData.vendorCode,
        supportedEndpoints: formData.supportedEndpoints,
        inputRatio: formData.inputRatio,
        outputRatio: formData.outputRatio,
        cachedInputRatio: formData.cachedInputRatio,
        reasoningRatio: formData.reasoningRatio,
        capabilities: formData.capabilities,
        maxContext: formData.maxContext,
        currency: formData.currency.trim().toUpperCase(),
        effectiveFrom: normalizeOptionalString(formData.effectiveFrom),
        metadata: parseJsonValue(formData.metadataText, '扩展元数据'),
        enabled: formData.enabled,
        remark: normalizeOptionalString(formData.remark)
      }

      if (dialogType.value === 'add') {
        await fetchCreateModelConfig({
          modelName: formData.modelName.trim(),
          ...basePayload
        })
      } else if (props.modelConfigData?.id) {
        await fetchUpdateModelConfig(props.modelConfigData.id, basePayload)
      }

      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
      dialogVisible.value = false
      emit('submit', dialogType.value)
    } catch (error) {
      if (error instanceof Error && error.message.includes('JSON')) {
        ElMessage.error(error.message)
      }
    } finally {
      submitLoading.value = false
    }
  }
</script>
