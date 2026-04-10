<template>
  <ElDrawer
    v-model="visible"
    :title="panelMode === 'add' ? '新增模型价格' : '编辑模型价格'"
    :size="drawerSize"
    destroy-on-close
  >
    <ElForm
      ref="formRef"
      v-loading="detailLoading"
      :model="formData"
      :rules="rules"
      label-width="112px"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="所属渠道" prop="channelId">
            <ElSelect
              v-model="formData.channelId"
              filterable
              :disabled="panelMode === 'edit'"
              :loading="channelOptionsLoading"
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
          <ElFormItem label="模型名称" prop="modelName">
            <ElInput
              v-model="formData.modelName"
              :disabled="panelMode === 'edit'"
              placeholder="请输入模型名称"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="panelMode === 'edit' ? 8 : 12">
          <ElFormItem label="计费模式" prop="billingMode">
            <ElSelect v-model="formData.billingMode" placeholder="请选择计费模式">
              <ElOption
                v-for="item in billingModeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="panelMode === 'edit' ? 8 : 12">
          <ElFormItem label="货币" prop="currency">
            <ElInput v-model="formData.currency" placeholder="如：USD" />
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

        <ElCol v-if="panelMode === 'edit'" :span="24">
          <ElFormItem label="Reference ID">
            <ElInput :model-value="formData.referenceId || '-'" disabled />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElAlert
            :title="
              panelMode === 'add'
                ? '价格配置统一使用 JSON 输入；新增后会自动生成 referenceId。'
                : '价格配置统一使用 JSON 输入；编辑时渠道和模型名称不可修改。'
            "
            type="info"
            :closable="false"
            show-icon
            class="!mb-2"
          />
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="价格配置 JSON" prop="priceConfigText">
            <div class="json-editor-block">
              <div class="json-editor-toolbar">
                <div class="json-editor-meta">
                  <div class="json-editor-title">价格配置 JSON</div>
                  <div class="json-editor-description">
                    用于填写模型计费参数，例如 input、output、cacheRead、cacheWrite。
                  </div>
                </div>

                <div class="json-editor-actions">
                  <ElButton text size="small" @click="applyPriceConfigTemplate">模板</ElButton>
                  <ElButton text size="small" @click="formatPriceConfig">格式化</ElButton>
                  <ElButton text size="small" @click="formData.priceConfigText = ''">清空</ElButton>
                </div>
              </div>

              <ElInput
                v-model="formData.priceConfigText"
                type="textarea"
                :rows="10"
                placeholder='如：{"input":0.15,"output":0.6,"cacheRead":0.02}'
                class="json-editor-input"
              />

              <div class="json-editor-feedback" :class="{ 'is-error': priceConfigErrorMessage }">
                {{ priceConfigErrorMessage || '不能为空，必须是合法 JSON 对象。' }}
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
    fetchCreateAiChannelModelPrice,
    fetchGetAiChannelModelPriceDetail,
    fetchUpdateAiChannelModelPrice
  } from '@/api/ai-admin'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    buildJsonEditorPreset,
    formatJsonEditorValue,
    parseJsonEditorValue,
    validateJsonEditorValue
  } from '../../json-editor'
  import type {
    ChannelModelPriceBillingMode,
    ChannelModelPriceFormModel,
    ChannelModelPriceListItem,
    ChannelModelPriceStatus
  } from '../types'

  interface Props {
    modelValue: boolean
    panelMode: 'add' | 'edit'
    priceData?: ChannelModelPriceListItem
    channelOptions: Api.AiChannel.ChannelListItem[]
    channelOptionsLoading?: boolean
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    panelMode: 'add',
    priceData: undefined,
    channelOptionsLoading: false
  })

  const emit = defineEmits<Emits>()
  const { width } = useWindowSize()

  const billingModeOptions: Array<{ label: string; value: ChannelModelPriceBillingMode }> = [
    { label: '按 Token', value: 1 },
    { label: '按请求', value: 2 },
    { label: '按媒体单元', value: 3 }
  ]

  const statusOptions: Array<{ label: string; value: ChannelModelPriceStatus }> = [
    { label: '启用', value: 1 },
    { label: '停用', value: 2 }
  ]

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)
  const priceConfigPreset = buildJsonEditorPreset({
    description: '用于填写模型计费参数，例如 input、output、cacheRead、cacheWrite。',
    emptyHint: '不能为空，必须是合法 JSON 对象。',
    templateData: {
      input: 0.15,
      output: 0.6,
      cacheRead: 0.02
    }
  })

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const drawerSize = computed(() => (width.value < 1280 ? '100%' : '980px'))

  const createDefaultForm = (): ChannelModelPriceFormModel => ({
    channelId: undefined,
    modelName: '',
    billingMode: 1,
    currency: 'USD',
    priceConfigText: '',
    status: 1,
    referenceId: '',
    remark: ''
  })

  const formData = reactive<ChannelModelPriceFormModel>(createDefaultForm())

  const createJsonValidator =
    (label: string, required: boolean = false) =>
    (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      const errorMessage = validateJsonEditorValue(label, value, required)
      callback(errorMessage ? new Error(errorMessage) : undefined)
    }

  const priceConfigErrorMessage = computed(() =>
    validateJsonEditorValue('价格配置 JSON', formData.priceConfigText, true)
  )

  const applyPriceConfigTemplate = () => {
    formData.priceConfigText = priceConfigPreset.template
  }

  const formatPriceConfig = () => {
    if (!formData.priceConfigText.trim()) {
      return
    }
    formData.priceConfigText = formatJsonEditorValue(parseJsonEditorValue(formData.priceConfigText))
  }

  const rules: FormRules<ChannelModelPriceFormModel> = {
    channelId: [{ required: true, message: '请选择所属渠道', trigger: 'change' }],
    modelName: [
      { required: true, message: '请输入模型名称', trigger: 'blur' },
      { min: 1, max: 128, message: '模型名称长度必须在 1 到 128 个字符之间', trigger: 'blur' }
    ],
    billingMode: [{ required: true, message: '请选择计费模式', trigger: 'change' }],
    currency: [
      { required: true, message: '请输入货币编码', trigger: 'blur' },
      { min: 1, max: 16, message: '货币编码长度必须在 1 到 16 个字符之间', trigger: 'blur' }
    ],
    priceConfigText: [{ validator: createJsonValidator('价格配置 JSON', true), trigger: 'blur' }]
  }

  const resetForm = () => {
    Object.assign(formData, createDefaultForm())
    formRef.value?.clearValidate()
  }

  const loadDetail = async (id: number) => {
    detailLoading.value = true
    try {
      const detail = await fetchGetAiChannelModelPriceDetail(id)
      Object.assign(formData, {
        channelId: detail.channelId,
        modelName: detail.modelName,
        billingMode: detail.billingMode,
        currency: detail.currency,
        priceConfigText: formatJsonEditorValue(detail.priceConfig),
        status: detail.status,
        referenceId: detail.referenceId,
        remark: detail.remark
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.modelValue, props.panelMode, props.priceData?.id],
    async ([visibleValue]) => {
      if (!visibleValue) {
        resetForm()
        return
      }

      if (props.panelMode === 'edit' && typeof props.priceData?.id === 'number') {
        await loadDetail(props.priceData.id)
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )

  const buildCreatePayload = (): Api.AiChannelModelPrice.CreateChannelModelPriceParams => ({
    channelId: formData.channelId!,
    modelName: formData.modelName.trim(),
    billingMode: formData.billingMode ?? 1,
    currency: formData.currency.trim() || 'USD',
    priceConfig: parseJsonEditorValue(formData.priceConfigText, {}) ?? {},
    remark: formData.remark.trim()
  })

  const buildUpdatePayload = (): Api.AiChannelModelPrice.UpdateChannelModelPriceParams => ({
    billingMode: formData.billingMode,
    currency: formData.currency.trim() || 'USD',
    priceConfig: parseJsonEditorValue(formData.priceConfigText),
    status: formData.status,
    remark: formData.remark.trim()
  })

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true

    try {
      if (props.panelMode === 'add') {
        await fetchCreateAiChannelModelPrice(buildCreatePayload())
      } else if (typeof props.priceData?.id === 'number') {
        await fetchUpdateAiChannelModelPrice(props.priceData.id, buildUpdatePayload())
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
