<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增配置项' : '编辑配置项'"
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
          <ElFormItem label="作用域" prop="scopeType">
            <ElSelect v-model="formData.scopeType" placeholder="请选择作用域">
              <ElOption
                v-for="item in CONFIG_ENTRY_SCOPE_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="作用域 ID" prop="scopeId">
            <ElInputNumber
              v-model="formData.scopeId"
              :min="0"
              :disabled="formData.scopeType === 'system'"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="配置分类" prop="category">
            <ElInput v-model="formData.category" placeholder="例如 routing / auth / billing" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="配置键" prop="configKey">
            <ElInput v-model="formData.configKey" placeholder="请输入唯一配置键" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态">
              <ElOption
                v-for="item in CONFIG_ENTRY_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="密钥引用" prop="secretRef">
            <ElInput
              v-model="formData.secretRef"
              placeholder="可选，例如 vault/ai/prod/config-key"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="配置值" prop="configValueText">
        <ElInput
          v-model="formData.configValueText"
          type="textarea"
          :rows="6"
          placeholder='请输入 JSON，例如：{"timeoutMs":30000}'
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
    fetchCreateConfigEntry,
    fetchGetConfigEntryDetail,
    fetchUpdateConfigEntry
  } from '@/api/ai-config-entry'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormItemRule, type FormRules } from 'element-plus'
  import { CONFIG_ENTRY_SCOPE_TYPE_OPTIONS, CONFIG_ENTRY_STATUS_OPTIONS } from '../constants'
  import type { ConfigEntryListItem, FormModel } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    configEntryData?: Partial<ConfigEntryListItem>
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
    scopeType: 'system',
    scopeId: 0,
    category: '',
    configKey: '',
    configValueText: '{\n  \n}',
    secretRef: '',
    status: 1,
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const validateScopeId: FormItemRule['validator'] = (_rule, value, callback) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      callback(new Error('请输入作用域 ID'))
      return
    }

    if (formData.scopeType === 'system' && value !== 0) {
      callback(new Error('system 作用域的 scopeId 必须为 0'))
      return
    }

    if (formData.scopeType !== 'system' && value <= 0) {
      callback(new Error('非 system 作用域的 scopeId 必须大于 0'))
      return
    }

    callback()
  }

  const rules: FormRules = {
    scopeType: [{ required: true, message: '请选择作用域', trigger: 'change' }],
    scopeId: [{ required: true, validator: validateScopeId, trigger: 'change' }],
    category: [{ required: true, message: '请输入配置分类', trigger: 'blur' }],
    configKey: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
    configValueText: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
  }

  const stringifyJsonValue = (value: unknown) => {
    if (value === undefined || value === null) return '{\n  \n}'
    return JSON.stringify(value, null, 2)
  }

  const parseJsonValue = (value: string, fieldLabel: string): unknown => {
    const text = value.trim()
    if (!text) {
      throw new Error(`${fieldLabel}不能为空`)
    }
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`${fieldLabel}必须是合法 JSON`)
    }
  }

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.configEntryData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetConfigEntryDetail(props.configEntryData!.id!)
      Object.assign(formData, {
        scopeType: detail.scopeType,
        scopeId: detail.scopeId,
        category: detail.category,
        configKey: detail.configKey,
        configValueText: stringifyJsonValue(detail.configValue),
        secretRef: detail.secretRef,
        status: detail.status,
        remark: detail.remark
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => formData.scopeType,
    (scopeType) => {
      if (scopeType === 'system') {
        formData.scopeId = 0
      } else if (formData.scopeId === 0) {
        formData.scopeId = undefined
      }
    }
  )

  watch(
    () => [props.visible, props.type, props.configEntryData?.id],
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
      const createPayload: Api.AiManage.CreateConfigEntryParams = {
        scopeType: formData.scopeType!,
        scopeId: Number(formData.scopeId ?? 0),
        category: formData.category.trim(),
        configKey: formData.configKey.trim(),
        configValue: parseJsonValue(formData.configValueText, '配置值'),
        secretRef: formData.secretRef.trim(),
        status: formData.status,
        remark: formData.remark.trim()
      }

      if (dialogType.value === 'add') {
        await fetchCreateConfigEntry(createPayload)
      } else if (props.configEntryData?.id) {
        const updatePayload: Api.AiManage.UpdateConfigEntryParams = {
          scopeType: createPayload.scopeType,
          scopeId: createPayload.scopeId,
          category: createPayload.category,
          configKey: createPayload.configKey,
          configValue: createPayload.configValue,
          secretRef: createPayload.secretRef,
          status: createPayload.status,
          remark: createPayload.remark
        }
        await fetchUpdateConfigEntry(props.configEntryData.id, updatePayload)
      }

      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
      dialogVisible.value = false
      emit('submit', dialogType.value)
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('JSON') || error.message.includes('不能为空'))
      ) {
        ElMessage.error(error.message)
      }
    } finally {
      submitLoading.value = false
    }
  }
</script>
