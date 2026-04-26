<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增供应商' : '编辑供应商'"
    width="780px"
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
          <ElFormItem label="供应商编码" prop="vendorCode">
            <ElInput
              v-model="formData.vendorCode"
              :disabled="dialogType === 'edit'"
              placeholder="请输入唯一编码，例如 openai"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="供应商名称" prop="vendorName">
            <ElInput v-model="formData.vendorName" placeholder="请输入供应商名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="接口风格" prop="apiStyle">
            <ElSelect v-model="formData.apiStyle" placeholder="请选择接口风格">
              <ElOption
                v-for="item in API_STYLE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="启用状态" prop="enabled">
            <ElSwitch v-model="formData.enabled" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="基础地址" prop="baseUrl">
            <ElInput
              v-model="formData.baseUrl"
              placeholder="可选，例如 https://api.openai.com/v1"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="文档地址" prop="docUrl">
            <ElInput v-model="formData.docUrl" placeholder="可选" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="图标地址" prop="icon">
            <ElInput v-model="formData.icon" placeholder="可选" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="排序" prop="vendorSort">
            <ElInputNumber
              v-model="formData.vendorSort"
              :min="0"
              :step="10"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="描述该供应商的接口特点或适用场景"
        />
      </ElFormItem>

      <ElFormItem label="扩展元数据" prop="metadataText">
        <ElInput
          v-model="formData.metadataText"
          type="textarea"
          :rows="5"
          placeholder='请输入 JSON 对象，例如：{"region":"global"}'
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
  import { fetchCreateVendor, fetchGetVendorDetail, fetchUpdateVendor } from '@/api/ai-vendor'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { API_STYLE_OPTIONS } from '../constants'
  import type { FormModel, VendorListItem } from '../types'

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

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  const createDefaultFormData = (): FormModel => ({
    vendorCode: '',
    vendorName: '',
    apiStyle: 'openai-compatible',
    icon: '',
    description: '',
    baseUrl: '',
    docUrl: '',
    metadataText: '',
    vendorSort: 100,
    enabled: true,
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const rules: FormRules = {
    vendorCode: [
      { required: true, message: '请输入供应商编码', trigger: 'blur' },
      {
        pattern: /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,
        message: '编码仅支持字母、数字、下划线和中划线',
        trigger: 'blur'
      }
    ],
    vendorName: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
    apiStyle: [{ required: true, message: '请选择接口风格', trigger: 'change' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
  }

  const normalizeOptionalString = (value: string) => value.trim() || undefined

  const stringifyJson = (value: Record<string, unknown> | undefined) => {
    if (!value || Object.keys(value).length === 0) return ''
    return JSON.stringify(value, null, 2)
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

    const isEdit = props.type === 'edit' && props.vendorData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetVendorDetail(props.vendorData!.id!)
      Object.assign(formData, {
        vendorCode: detail.vendorCode,
        vendorName: detail.vendorName,
        apiStyle: detail.apiStyle,
        icon: detail.icon || '',
        description: detail.description || '',
        baseUrl: detail.baseUrl || '',
        docUrl: detail.docUrl || '',
        metadataText: stringifyJson(detail.metadata),
        vendorSort: detail.vendorSort,
        enabled: detail.enabled,
        remark: detail.remark || ''
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.vendorData?.id],
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
        vendorName: formData.vendorName.trim(),
        apiStyle: formData.apiStyle!,
        icon: normalizeOptionalString(formData.icon),
        description: normalizeOptionalString(formData.description),
        baseUrl: normalizeOptionalString(formData.baseUrl),
        docUrl: normalizeOptionalString(formData.docUrl),
        metadata: parseJsonObject(formData.metadataText, '扩展元数据'),
        vendorSort: formData.vendorSort,
        enabled: formData.enabled,
        remark: normalizeOptionalString(formData.remark)
      }

      if (dialogType.value === 'add') {
        await fetchCreateVendor({
          vendorCode: formData.vendorCode.trim(),
          ...basePayload
        })
      } else if (props.vendorData?.id) {
        await fetchUpdateVendor(props.vendorData.id, basePayload)
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
