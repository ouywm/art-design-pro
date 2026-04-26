<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增渠道' : '编辑渠道'"
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
          <ElFormItem label="渠道名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入渠道名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="渠道类型" prop="channelType">
            <ElSelect v-model="formData.channelType" placeholder="请选择渠道类型">
              <ElOption
                v-for="item in CHANNEL_TYPE_OPTIONS"
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
          <ElFormItem label="渠道状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态">
              <ElOption
                v-for="item in CHANNEL_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="基础地址" prop="baseUrl">
            <ElInput v-model="formData.baseUrl" placeholder="请输入上游 API Base URL" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="渠道分组" prop="channelGroup">
            <ElInput v-model="formData.channelGroup" placeholder="默认 default" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="路由权重" prop="weight">
            <ElInputNumber
              v-model="formData.weight"
              :min="0"
              :step="10"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="优先级" prop="priority">
            <ElInputNumber v-model="formData.priority" :min="0" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="测速模型" prop="testModel">
            <ElInput v-model="formData.testModel" placeholder="可选" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="自动禁用" prop="autoBan">
            <ElSwitch v-model="formData.autoBan" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="支持模型" prop="modelsText">
        <ElInput
          v-model="formData.modelsText"
          type="textarea"
          :rows="3"
          placeholder="使用逗号或换行分隔，例如：gpt-4o, gpt-4o-mini"
        />
      </ElFormItem>

      <ElFormItem label="Endpoint" prop="endpointScopes">
        <ElSelect
          v-model="formData.endpointScopes"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或直接输入 endpoint scope"
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

      <ElFormItem label="模型映射" prop="modelMappingText">
        <ElInput
          v-model="formData.modelMappingText"
          type="textarea"
          :rows="4"
          placeholder='请输入 JSON 对象，例如：{"gpt-4":"gpt-4o"}'
        />
      </ElFormItem>

      <ElFormItem label="扩展配置" prop="configText">
        <ElInput
          v-model="formData.configText"
          type="textarea"
          :rows="4"
          placeholder='请输入 JSON 对象，例如：{"organization":"org_xxx"}'
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
  import { fetchCreateChannel, fetchGetChannelDetail, fetchUpdateChannel } from '@/api/ai-channel'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    CHANNEL_STATUS_OPTIONS,
    CHANNEL_TYPE_OPTIONS,
    COMMON_CAPABILITY_OPTIONS,
    COMMON_ENDPOINT_SCOPE_OPTIONS
  } from '../constants'
  import type { ChannelListItem, FormModel, VendorOption } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    channelData?: Partial<ChannelListItem>
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
    name: '',
    channelType: undefined,
    vendorCode: '',
    baseUrl: '',
    modelsText: '',
    modelMappingText: '',
    channelGroup: 'default',
    endpointScopes: [],
    capabilities: [],
    weight: 100,
    priority: 1,
    configText: '',
    autoBan: true,
    testModel: '',
    status: 1,
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const rules: FormRules = {
    name: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
    channelType: [{ required: true, message: '请选择渠道类型', trigger: 'change' }],
    vendorCode: [{ required: true, message: '请选择供应商', trigger: 'change' }],
    baseUrl: [{ required: true, message: '请输入基础地址', trigger: 'blur' }],
    status: [{ required: true, message: '请选择渠道状态', trigger: 'change' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
  }

  const stringifyJson = (value: Record<string, unknown> | string[] | undefined) => {
    if (!value) return ''
    if (Array.isArray(value) && value.length === 0) return ''
    if (!Array.isArray(value) && Object.keys(value).length === 0) return ''
    return JSON.stringify(value, null, 2)
  }

  const splitTextList = (value: string) => {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const parseJsonObject = (
    value: string,
    fieldLabel: string
  ): Record<string, unknown> | undefined => {
    const text = value.trim()
    if (!text) return undefined
    try {
      const parsed = JSON.parse(text)
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new Error()
      }
      return parsed as Record<string, unknown>
    } catch {
      throw new Error(`${fieldLabel}必须是合法 JSON 对象`)
    }
  }

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.channelData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetChannelDetail(props.channelData!.id!)
      Object.assign(formData, {
        name: detail.name,
        channelType: detail.channelType,
        vendorCode: detail.vendorCode,
        baseUrl: detail.baseUrl,
        modelsText: detail.models.join(', '),
        modelMappingText: stringifyJson(detail.modelMapping),
        channelGroup: detail.channelGroup || 'default',
        endpointScopes: detail.endpointScopes || [],
        capabilities: detail.capabilities || [],
        weight: detail.weight,
        priority: detail.priority,
        configText: stringifyJson(detail.config),
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
    () => [props.visible, props.type, props.channelData?.id],
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
      const payload: Api.AiManage.CreateChannelParams = {
        name: formData.name.trim(),
        channelType: formData.channelType!,
        vendorCode: formData.vendorCode,
        baseUrl: formData.baseUrl.trim(),
        models: splitTextList(formData.modelsText),
        modelMapping: parseJsonObject(formData.modelMappingText, '模型映射'),
        channelGroup: formData.channelGroup.trim() || undefined,
        endpointScopes: formData.endpointScopes.length ? formData.endpointScopes : undefined,
        capabilities: formData.capabilities.length ? formData.capabilities : undefined,
        weight: formData.weight,
        priority: formData.priority,
        config: parseJsonObject(formData.configText, '扩展配置'),
        autoBan: formData.autoBan,
        testModel: formData.testModel.trim() || undefined,
        status: formData.status,
        remark: formData.remark.trim() || undefined
      }

      if (dialogType.value === 'add') {
        await fetchCreateChannel(payload)
      } else if (props.channelData?.id) {
        await fetchUpdateChannel(props.channelData.id, payload)
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
