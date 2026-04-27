<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增分组比率' : '编辑分组比率'"
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
          <ElFormItem label="分组编码" prop="groupCode">
            <ElInput
              v-model="formData.groupCode"
              :disabled="dialogType === 'edit'"
              placeholder="请输入唯一分组编码"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="分组名称" prop="groupName">
            <ElInput v-model="formData.groupName" placeholder="请输入分组名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="倍率" prop="ratio">
            <ElInputNumber
              v-model="formData.ratio"
              :min="0"
              :precision="4"
              :step="0.1"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="启用状态" prop="enabled">
            <ElSwitch v-model="formData.enabled" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="模型白名单" prop="modelWhitelist">
        <ElSelect
          v-model="formData.modelWhitelist"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入允许的模型名"
        />
      </ElFormItem>

      <ElFormItem label="模型黑名单" prop="modelBlacklist">
        <ElSelect
          v-model="formData.modelBlacklist"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入禁止的模型名"
        />
      </ElFormItem>

      <ElFormItem label="Endpoint" prop="endpointScopes">
        <ElSelect
          v-model="formData.endpointScopes"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入 endpoint scope"
        />
      </ElFormItem>

      <ElFormItem label="回退分组" prop="fallbackGroupCode">
        <ElSelect
          v-model="formData.fallbackGroupCode"
          clearable
          filterable
          placeholder="可选，选择回退目标分组"
        >
          <ElOption
            v-for="item in props.groupOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.value === formData.groupCode"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="策略配置" prop="policyText">
        <ElInput
          v-model="formData.policyText"
          type="textarea"
          :rows="5"
          placeholder='请输入 JSON，例如：{"strategy":"weighted"}'
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
    fetchCreateGroupRatio,
    fetchGetGroupRatioDetail,
    fetchUpdateGroupRatio
  } from '@/api/ai-group-ratio'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import type { FormModel, GroupRatioListItem } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    groupRatioData?: Partial<GroupRatioListItem>
    groupOptions: { label: string; value: string; enabled: boolean }[]
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
    groupCode: '',
    groupName: '',
    ratio: 1,
    enabled: true,
    modelWhitelist: [],
    modelBlacklist: [],
    endpointScopes: [],
    fallbackGroupCode: '',
    policyText: '',
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const rules: FormRules = {
    groupCode: [{ required: true, message: '请输入分组编码', trigger: 'blur' }],
    groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
    ratio: [{ required: true, message: '请输入倍率', trigger: 'change' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
  }

  const normalizeStringList = (values: string[]) => {
    return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)))
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

    const isEdit = props.type === 'edit' && props.groupRatioData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetGroupRatioDetail(props.groupRatioData!.id!)
      Object.assign(formData, {
        groupCode: detail.groupCode,
        groupName: detail.groupName,
        ratio: detail.ratio,
        enabled: detail.enabled,
        modelWhitelist: detail.modelWhitelist || [],
        modelBlacklist: detail.modelBlacklist || [],
        endpointScopes: detail.endpointScopes || [],
        fallbackGroupCode: detail.fallbackGroupCode || '',
        policyText: stringifyJsonValue(detail.policy),
        remark: detail.remark
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.groupRatioData?.id],
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
      const createPayload: Api.AiManage.CreateGroupRatioParams = {
        groupCode: formData.groupCode.trim(),
        groupName: formData.groupName.trim(),
        ratio: Number(formData.ratio ?? 0),
        enabled: formData.enabled,
        modelWhitelist: normalizeStringList(formData.modelWhitelist),
        modelBlacklist: normalizeStringList(formData.modelBlacklist),
        endpointScopes: normalizeStringList(formData.endpointScopes),
        fallbackGroupCode: formData.fallbackGroupCode.trim(),
        policy: parseJsonValue(formData.policyText, '策略配置'),
        remark: formData.remark.trim()
      }

      if (dialogType.value === 'add') {
        await fetchCreateGroupRatio(createPayload)
      } else if (props.groupRatioData?.id) {
        const updatePayload: Api.AiManage.UpdateGroupRatioParams = {
          groupName: createPayload.groupName,
          ratio: createPayload.ratio,
          enabled: createPayload.enabled,
          modelWhitelist: createPayload.modelWhitelist,
          modelBlacklist: createPayload.modelBlacklist,
          endpointScopes: createPayload.endpointScopes,
          fallbackGroupCode: createPayload.fallbackGroupCode,
          policy: createPayload.policy,
          remark: createPayload.remark
        }
        await fetchUpdateGroupRatio(props.groupRatioData.id, updatePayload)
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
