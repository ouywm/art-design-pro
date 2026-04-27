<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增能力映射' : '编辑能力映射'"
    width="820px"
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
          <ElFormItem label="渠道分组" prop="channelGroup">
            <ElInput v-model="formData.channelGroup" placeholder="请输入渠道分组" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="Endpoint" prop="endpointScope">
            <ElInput v-model="formData.endpointScope" placeholder="请输入 endpoint scope" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="模型" prop="model">
            <ElInput v-model="formData.model" placeholder="请输入模型名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="渠道" prop="channelId">
            <ElSelect v-model="formData.channelId" filterable placeholder="请选择渠道">
              <ElOption
                v-for="item in channelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="状态" prop="enabled">
            <ElSwitch v-model="formData.enabled" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="优先级" prop="priority">
            <ElInputNumber v-model="formData.priority" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="权重" prop="weight">
            <ElInputNumber
              v-model="formData.weight"
              :min="0"
              :step="10"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="路由配置" prop="routeConfigText">
        <ElInput
          v-model="formData.routeConfigText"
          type="textarea"
          :rows="5"
          placeholder='请输入 JSON，例如：{"timeoutMs":15000}'
        />
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
  import { fetchCreateAbility, fetchGetAbilityDetail, fetchUpdateAbility } from '@/api/ai-ability'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import type { AbilityListItem, ChannelOption, FormModel } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    abilityData?: Partial<AbilityListItem>
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
    channelGroup: 'default',
    endpointScope: '',
    model: '',
    channelId: undefined,
    enabled: true,
    priority: 0,
    weight: 100,
    routeConfigText: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const rules: FormRules = {
    channelGroup: [{ required: true, message: '请输入渠道分组', trigger: 'blur' }],
    endpointScope: [{ required: true, message: '请输入 endpoint scope', trigger: 'blur' }],
    model: [{ required: true, message: '请输入模型名', trigger: 'blur' }],
    channelId: [{ required: true, message: '请选择渠道', trigger: 'change' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
  }

  const stringifyJsonValue = (value: unknown) => {
    if (value === undefined || value === null) return ''
    if (!Array.isArray(value) && typeof value === 'object' && Object.keys(value).length === 0) {
      return ''
    }
    return JSON.stringify(value, null, 2)
  }

  const parseJsonValue = (value: string, fieldLabel: string): unknown => {
    const text = value.trim()
    if (!text) return undefined
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`${fieldLabel}必须是合法 JSON`)
    }
  }

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.abilityData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetAbilityDetail(props.abilityData!.id!)
      Object.assign(formData, {
        channelGroup: detail.channelGroup,
        endpointScope: detail.endpointScope,
        model: detail.model,
        channelId: detail.channelId,
        enabled: detail.enabled,
        priority: detail.priority,
        weight: detail.weight,
        routeConfigText: stringifyJsonValue(detail.routeConfig)
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.abilityData?.id],
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
      const createPayload: Api.AiManage.CreateAbilityParams = {
        channelGroup: formData.channelGroup.trim(),
        endpointScope: formData.endpointScope.trim(),
        model: formData.model.trim(),
        channelId: Number(formData.channelId),
        enabled: formData.enabled,
        priority: Number(formData.priority ?? 0),
        weight: Number(formData.weight ?? 0),
        routeConfig: parseJsonValue(formData.routeConfigText, '路由配置')
      }

      if (dialogType.value === 'add') {
        await fetchCreateAbility(createPayload)
      } else if (props.abilityData?.id) {
        const updatePayload: Api.AiManage.UpdateAbilityParams = {
          channelGroup: createPayload.channelGroup,
          endpointScope: createPayload.endpointScope,
          model: createPayload.model,
          channelId: createPayload.channelId,
          enabled: createPayload.enabled,
          priority: createPayload.priority,
          weight: createPayload.weight,
          routeConfig: createPayload.routeConfig
        }
        await fetchUpdateAbility(props.abilityData.id, updatePayload)
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
