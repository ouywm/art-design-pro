<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增渠道模型价格' : '编辑渠道模型价格'"
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
      <ElAlert
        v-if="runtimeState.currentVersionNo !== null"
        class="mb-4"
        type="info"
        :closable="false"
        show-icon
        :title="`当前版本 V${runtimeState.currentVersionNo} · Reference ID: ${runtimeState.referenceId || '-'}`"
      />

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
          <ElFormItem label="模型名" prop="modelName">
            <ElInput
              v-model="formData.modelName"
              :disabled="dialogType === 'edit'"
              placeholder="请输入模型名，例如 gpt-4o"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="计费模式" prop="billingMode">
            <ElSelect v-model="formData.billingMode" placeholder="请选择计费模式">
              <ElOption
                v-for="item in SUPPORTED_BILLING_MODE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="货币" prop="currency">
            <ElSelect v-model="formData.currency" placeholder="请选择货币">
              <ElOption label="USD" value="USD" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态">
              <ElOption
                v-for="item in CHANNEL_MODEL_PRICE_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="输入单价" prop="inputPerMillion">
            <ElInput
              v-model="formData.inputPerMillion"
              placeholder="每百万输入 Token 单价，例如 2.5"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="输出单价" prop="outputPerMillion">
            <ElInput
              v-model="formData.outputPerMillion"
              placeholder="每百万输出 Token 单价，例如 10"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="Cache Read" prop="cacheReadPerMillion">
            <ElInput
              v-model="formData.cacheReadPerMillion"
              placeholder="可选，每百万缓存读取单价"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="Cache Write" prop="cacheWritePerMillion">
            <ElInput
              v-model="formData.cacheWritePerMillion"
              placeholder="可选，每百万缓存写入单价"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="Reasoning" prop="reasoningPerMillion">
            <ElInput
              v-model="formData.reasoningPerMillion"
              placeholder="可选，每百万推理 Token 单价"
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
    fetchCreateChannelModelPrice,
    fetchGetChannelModelPriceDetail,
    fetchUpdateChannelModelPrice
  } from '@/api/ai-channel-model-price'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { CHANNEL_MODEL_PRICE_STATUS_OPTIONS, SUPPORTED_BILLING_MODE_OPTIONS } from '../constants'
  import type { ChannelModelPriceListItem, ChannelOption, FormModel } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    priceData?: Partial<ChannelModelPriceListItem>
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
    modelName: '',
    billingMode: 1,
    currency: 'USD',
    inputPerMillion: '',
    outputPerMillion: '',
    cacheReadPerMillion: '',
    cacheWritePerMillion: '',
    reasoningPerMillion: '',
    status: 1,
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())
  const runtimeState = reactive({
    currentVersionNo: null as number | null,
    referenceId: ''
  })

  const rules: FormRules = {
    channelId: [{ required: true, message: '请选择所属渠道', trigger: 'change' }],
    modelName: [{ required: true, message: '请输入模型名', trigger: 'blur' }],
    billingMode: [{ required: true, message: '请选择计费模式', trigger: 'change' }],
    currency: [{ required: true, message: '请选择货币', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    inputPerMillion: [{ required: true, message: '请输入输入单价', trigger: 'blur' }],
    outputPerMillion: [{ required: true, message: '请输入输出单价', trigger: 'blur' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
    Object.assign(runtimeState, {
      currentVersionNo: null,
      referenceId: ''
    })
  }

  const normalizeOptionalString = (value: string) => value.trim() || undefined

  const normalizeDecimalString = (fieldLabel: string, value: string, required = false) => {
    const text = value.trim()
    if (!text) {
      if (required) {
        throw new Error(`${fieldLabel}不能为空`)
      }
      return undefined
    }
    if (!/^\d+(?:\.\d+)?$/.test(text)) {
      throw new Error(`${fieldLabel}必须是合法非负小数`)
    }
    return text
  }

  const buildPriceConfig = (): Api.AiManage.ChannelModelPriceConfig => ({
    inputPerMillion: normalizeDecimalString('输入单价', formData.inputPerMillion, true)!,
    outputPerMillion: normalizeDecimalString('输出单价', formData.outputPerMillion, true)!,
    cacheReadPerMillion: normalizeDecimalString('Cache Read', formData.cacheReadPerMillion),
    cacheWritePerMillion: normalizeDecimalString('Cache Write', formData.cacheWritePerMillion),
    reasoningPerMillion: normalizeDecimalString('Reasoning', formData.reasoningPerMillion)
  })

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.priceData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetChannelModelPriceDetail(props.priceData!.id!)
      Object.assign(formData, {
        channelId: detail.channelId,
        modelName: detail.modelName,
        billingMode: detail.billingMode,
        currency: detail.currency,
        inputPerMillion: detail.priceConfig.inputPerMillion,
        outputPerMillion: detail.priceConfig.outputPerMillion,
        cacheReadPerMillion: detail.priceConfig.cacheReadPerMillion || '',
        cacheWritePerMillion: detail.priceConfig.cacheWritePerMillion || '',
        reasoningPerMillion: detail.priceConfig.reasoningPerMillion || '',
        status: detail.status,
        remark: detail.remark || ''
      })

      Object.assign(runtimeState, {
        currentVersionNo: detail.currentVersionNo ?? null,
        referenceId: detail.referenceId || ''
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.priceData?.id],
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
        billingMode: formData.billingMode!,
        currency: formData.currency.trim().toUpperCase(),
        priceConfig: buildPriceConfig(),
        status: formData.status,
        remark: normalizeOptionalString(formData.remark)
      }

      if (dialogType.value === 'add') {
        await fetchCreateChannelModelPrice({
          channelId: formData.channelId!,
          modelName: formData.modelName.trim(),
          ...basePayload
        })
      } else if (props.priceData?.id) {
        await fetchUpdateChannelModelPrice(props.priceData.id, basePayload)
      }

      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
      dialogVisible.value = false
      emit('submit', dialogType.value)
    } catch (error) {
      if (error instanceof Error) {
        ElMessage.error(error.message)
      }
    } finally {
      submitLoading.value = false
    }
  }
</script>
