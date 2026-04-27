<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增路由规则' : '编辑路由规则'"
    width="920px"
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
          <ElFormItem label="组织 ID" prop="organizationId">
            <ElInputNumber v-model="formData.organizationId" :min="0" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="项目 ID" prop="projectId">
            <ElInputNumber v-model="formData.projectId" :min="0" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="规则编码" prop="ruleCode">
            <ElInput v-model="formData.ruleCode" placeholder="请输入规则编码" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="规则名称" prop="ruleName">
            <ElInput v-model="formData.ruleName" placeholder="请输入规则名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="优先级" prop="priority">
            <ElInputNumber v-model="formData.priority" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态">
              <ElOption
                v-for="item in ROUTING_RULE_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="回退策略" prop="fallbackStrategy">
            <ElInput v-model="formData.fallbackStrategy" placeholder="默认 none" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="匹配类型" prop="matchType">
            <ElSelect
              v-model="formData.matchType"
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入匹配类型"
            >
              <ElOption
                v-for="item in ROUTING_RULE_MATCH_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="路由策略" prop="routeStrategy">
            <ElSelect
              v-model="formData.routeStrategy"
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入路由策略"
            >
              <ElOption
                v-for="item in ROUTING_RULE_ROUTE_STRATEGY_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="开始时间" prop="startTime">
            <ElDatePicker
              v-model="formData.startTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              placeholder="可选"
              clearable
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="结束时间" prop="endTime">
            <ElDatePicker
              v-model="formData.endTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              placeholder="可选"
              clearable
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="匹配条件" prop="matchConditionsText">
        <ElInput
          v-model="formData.matchConditionsText"
          type="textarea"
          :rows="5"
          placeholder='请输入 JSON，例如：{"model":"gpt-4o"}'
        />
      </ElFormItem>

      <ElFormItem label="元数据" prop="metadataText">
        <ElInput
          v-model="formData.metadataText"
          type="textarea"
          :rows="4"
          placeholder='请输入 JSON，例如：{"owner":"routing-team"}'
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
    fetchCreateRoutingRule,
    fetchGetRoutingRuleDetail,
    fetchUpdateRoutingRule
  } from '@/api/ai-routing-rule'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    ROUTING_RULE_MATCH_TYPE_OPTIONS,
    ROUTING_RULE_ROUTE_STRATEGY_OPTIONS,
    ROUTING_RULE_STATUS_OPTIONS
  } from '../constants'
  import type { FormModel, RoutingRuleListItem } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    routingRuleData?: Partial<RoutingRuleListItem>
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

  const createDefaultFormData = (): FormModel => ({
    organizationId: 0,
    projectId: 0,
    ruleCode: '',
    ruleName: '',
    priority: 0,
    matchType: 'json',
    matchConditionsText: '',
    routeStrategy: 'weighted',
    fallbackStrategy: 'none',
    status: 1,
    startTime: '',
    endTime: '',
    metadataText: '',
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const rules: FormRules = {
    organizationId: [{ required: true, message: '请输入组织 ID', trigger: 'change' }],
    projectId: [{ required: true, message: '请输入项目 ID', trigger: 'change' }],
    ruleCode: [{ required: true, message: '请输入规则编码', trigger: 'blur' }],
    ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
    matchType: [{ required: true, message: '请输入匹配类型', trigger: 'change' }],
    routeStrategy: [{ required: true, message: '请输入路由策略', trigger: 'change' }],
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

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.routingRuleData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetRoutingRuleDetail(props.routingRuleData!.id!)
      Object.assign(formData, {
        organizationId: detail.organizationId,
        projectId: detail.projectId,
        ruleCode: detail.ruleCode,
        ruleName: detail.ruleName,
        priority: detail.priority,
        matchType: detail.matchType,
        matchConditionsText: stringifyJsonValue(detail.matchConditions),
        routeStrategy: detail.routeStrategy,
        fallbackStrategy: detail.fallbackStrategy || 'none',
        status: detail.status,
        startTime: detail.startTime || '',
        endTime: detail.endTime || '',
        metadataText: stringifyJsonValue(detail.metadata),
        remark: detail.remark
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.routingRuleData?.id],
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

    if (
      formData.startTime &&
      formData.endTime &&
      new Date(formData.startTime).getTime() > new Date(formData.endTime).getTime()
    ) {
      ElMessage.error('开始时间不能晚于结束时间')
      return
    }

    submitLoading.value = true
    try {
      const createPayload: Api.AiManage.CreateRoutingRuleParams = {
        organizationId: Number(formData.organizationId ?? 0),
        projectId: Number(formData.projectId ?? 0),
        ruleCode: formData.ruleCode.trim(),
        ruleName: formData.ruleName.trim(),
        priority: Number(formData.priority ?? 0),
        matchType: formData.matchType.trim(),
        matchConditions: parseJsonValue(formData.matchConditionsText, '匹配条件'),
        routeStrategy: formData.routeStrategy.trim(),
        fallbackStrategy: formData.fallbackStrategy.trim() || 'none',
        status: formData.status,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        metadata: parseJsonValue(formData.metadataText, '元数据'),
        remark: formData.remark.trim()
      }

      if (dialogType.value === 'add') {
        await fetchCreateRoutingRule(createPayload)
      } else if (props.routingRuleData?.id) {
        const updatePayload: Api.AiManage.UpdateRoutingRuleParams = {
          organizationId: createPayload.organizationId,
          projectId: createPayload.projectId,
          ruleCode: createPayload.ruleCode,
          ruleName: createPayload.ruleName,
          priority: createPayload.priority,
          matchType: createPayload.matchType,
          matchConditions: createPayload.matchConditions,
          routeStrategy: createPayload.routeStrategy,
          fallbackStrategy: createPayload.fallbackStrategy,
          status: createPayload.status,
          startTime: createPayload.startTime,
          endTime: createPayload.endTime,
          metadata: createPayload.metadata,
          remark: createPayload.remark
        }
        await fetchUpdateRoutingRule(props.routingRuleData.id, updatePayload)
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
