<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增路由目标' : '编辑路由目标'"
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
          <ElFormItem label="路由规则" prop="routingRuleId">
            <ElSelect v-model="formData.routingRuleId" filterable placeholder="请选择路由规则">
              <ElOption
                v-for="item in routingRuleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="目标类型" prop="targetType">
            <ElSelect v-model="formData.targetType" placeholder="请选择目标类型">
              <ElOption
                v-for="item in ROUTING_TARGET_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol v-if="formData.targetType === 'channel'" :span="12">
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

        <ElCol v-if="formData.targetType === 'account'" :span="12">
          <ElFormItem label="账号" prop="accountId">
            <ElSelect v-model="formData.accountId" filterable placeholder="请选择账号">
              <ElOption
                v-for="item in accountOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol v-if="formData.targetType === 'plugin'" :span="12">
          <ElFormItem label="插件 ID" prop="pluginId">
            <ElInputNumber v-model="formData.pluginId" :min="1" controls-position="right" />
          </ElFormItem>
        </ElCol>

        <ElCol
          v-if="formData.targetType === 'channel_group' || formData.targetType === 'pipeline'"
          :span="12"
        >
          <ElFormItem label="目标键" prop="targetKey">
            <ElInput v-model="formData.targetKey" placeholder="请输入目标键" />
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
        <ElCol :span="8">
          <ElFormItem label="优先级" prop="priority">
            <ElInputNumber v-model="formData.priority" :min="0" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="冷却秒数" prop="cooldownSeconds">
            <ElInputNumber
              v-model="formData.cooldownSeconds"
              :min="0"
              :step="10"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态">
              <ElOption
                v-for="item in ROUTING_TARGET_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="附加配置" prop="configText">
        <ElInput
          v-model="formData.configText"
          type="textarea"
          :rows="5"
          placeholder='请输入 JSON，例如：{"timeoutMs":30000}'
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
  import {
    fetchCreateRoutingTarget,
    fetchGetRoutingTargetDetail,
    fetchUpdateRoutingTarget
  } from '@/api/ai-routing-target'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { ROUTING_TARGET_STATUS_OPTIONS, ROUTING_TARGET_TYPE_OPTIONS } from '../constants'
  import type {
    AccountOption,
    ChannelOption,
    FormModel,
    RoutingRuleOption,
    RoutingTargetListItem
  } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    routingTargetData?: Partial<RoutingTargetListItem>
    routingRuleOptions: RoutingRuleOption[]
    channelOptions: ChannelOption[]
    accountOptions: AccountOption[]
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
  const routingRuleOptions = computed(() => props.routingRuleOptions)
  const channelOptions = computed(() => props.channelOptions)
  const accountOptions = computed(() => props.accountOptions)

  const createDefaultFormData = (): FormModel => ({
    routingRuleId: undefined,
    targetType: 'channel',
    channelId: undefined,
    accountId: undefined,
    pluginId: undefined,
    targetKey: '',
    weight: 100,
    priority: 0,
    cooldownSeconds: 0,
    configText: '',
    status: 1
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const rules: FormRules = {
    routingRuleId: [{ required: true, message: '请选择路由规则', trigger: 'change' }],
    targetType: [{ required: true, message: '请选择目标类型', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
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

  const resetBindingFields = (targetType: Api.AiManage.RoutingTargetType) => {
    if (targetType !== 'channel') formData.channelId = undefined
    if (targetType !== 'account') formData.accountId = undefined
    if (targetType !== 'plugin') formData.pluginId = undefined
    if (targetType !== 'channel_group' && targetType !== 'pipeline') formData.targetKey = ''
  }

  watch(
    () => formData.targetType,
    (targetType) => {
      resetBindingFields(targetType)
    }
  )

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.routingTargetData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetRoutingTargetDetail(props.routingTargetData!.id!)
      Object.assign(formData, {
        routingRuleId: detail.routingRuleId,
        targetType: detail.targetType,
        channelId: detail.channelId > 0 ? detail.channelId : undefined,
        accountId: detail.accountId > 0 ? detail.accountId : undefined,
        pluginId: detail.pluginId > 0 ? detail.pluginId : undefined,
        targetKey: detail.targetKey || '',
        weight: detail.weight,
        priority: detail.priority,
        cooldownSeconds: detail.cooldownSeconds,
        configText: stringifyJsonValue(detail.config),
        status: detail.status
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.routingTargetData?.id],
    async ([visible]) => {
      if (!visible) return
      await initFormData()
      await nextTick()
      formRef.value?.clearValidate()
    }
  )

  const validateBinding = () => {
    switch (formData.targetType) {
      case 'channel':
        if (typeof formData.channelId !== 'number') {
          throw new Error('请选择渠道')
        }
        break
      case 'account':
        if (typeof formData.accountId !== 'number') {
          throw new Error('请选择账号')
        }
        break
      case 'plugin':
        if (typeof formData.pluginId !== 'number' || formData.pluginId <= 0) {
          throw new Error('请输入有效的插件 ID')
        }
        break
      case 'channel_group':
      case 'pipeline':
        if (!formData.targetKey.trim()) {
          throw new Error('请输入目标键')
        }
        break
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      validateBinding()
    } catch (error) {
      if (error instanceof Error && error.message) {
        ElMessage.error(error.message)
      }
      return
    }

    submitLoading.value = true
    try {
      const createPayload: Api.AiManage.CreateRoutingTargetParams = {
        routingRuleId: Number(formData.routingRuleId),
        targetType: formData.targetType,
        channelId: formData.targetType === 'channel' ? Number(formData.channelId) : undefined,
        accountId: formData.targetType === 'account' ? Number(formData.accountId) : undefined,
        pluginId: formData.targetType === 'plugin' ? Number(formData.pluginId) : undefined,
        targetKey:
          formData.targetType === 'channel_group' || formData.targetType === 'pipeline'
            ? formData.targetKey.trim()
            : undefined,
        weight: Number(formData.weight ?? 0),
        priority: Number(formData.priority ?? 0),
        cooldownSeconds: Number(formData.cooldownSeconds ?? 0),
        config: parseJsonValue(formData.configText, '附加配置'),
        status: formData.status
      }

      if (dialogType.value === 'add') {
        await fetchCreateRoutingTarget(createPayload)
      } else if (props.routingTargetData?.id) {
        const updatePayload: Api.AiManage.UpdateRoutingTargetParams = {
          routingRuleId: createPayload.routingRuleId,
          targetType: createPayload.targetType,
          channelId: createPayload.channelId,
          accountId: createPayload.accountId,
          pluginId: createPayload.pluginId,
          targetKey: createPayload.targetKey,
          weight: createPayload.weight,
          priority: createPayload.priority,
          cooldownSeconds: createPayload.cooldownSeconds,
          config: createPayload.config,
          status: createPayload.status
        }
        await fetchUpdateRoutingTarget(props.routingTargetData.id, updatePayload)
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
