<template>
  <ElDrawer
    v-model="visible"
    :title="panelMode === 'add' ? '新增系统参数配置' : '编辑系统参数配置'"
    size="760px"
    destroy-on-close
    @close="handleClose"
  >
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      v-loading="detailLoading"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="配置名称" prop="configName">
            <ElInput
              v-model="form.configName"
              v-bind="{
                placeholder: '请输入配置名称'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="配置键" prop="configKey">
            <ElInput
              v-model="form.configKey"
              v-bind="{
                placeholder: '请输入配置键'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="当前配置值" prop="configValue">
            <ElInput
              v-model="form.configValue"
              v-bind="{
                type: 'textarea',
                placeholder: '请输入当前配置值',
                ...{ rows: 3 }
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="默认配置值" prop="defaultValue">
            <ElInput
              v-model="form.defaultValue"
              v-bind="{
                type: 'textarea',
                placeholder: '请输入默认配置值',
                ...{ rows: 3 }
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="值类型" prop="valueType">
            <ElSelect
              v-model="form.valueType"
              v-bind="{
                placeholder: '请选择值类型',
                clearable: true
              }"
            >
              <ElOption
                v-for="item in getDict('config_value_type').map((item) => ({
                  label: item.label,
                  value: Number(item.value)
                }))"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="配置分组编码" prop="configGroup">
            <ElInput
              v-model="form.configGroup"
              v-bind="{
                placeholder: '请输入配置分组编码'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="候选项字典类型编码" prop="optionDictType">
            <ElInput
              v-model="form.optionDictType"
              v-bind="{
                placeholder: '请输入候选项字典类型编码'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="是否启用" prop="enabled">
            <ElSwitch v-model="form.enabled" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="是否系统内置" prop="isSystem">
            <ElSwitch v-model="form.isSystem" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="备注" prop="remark">
            <ElInput
              v-model="form.remark"
              v-bind="{
                type: 'textarea',
                rows: 3,
                placeholder: '请输入备注'
              }"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { fetchCreateConfig, fetchGetConfigDetail, fetchUpdateConfig } from '@/api/config'
  import type { ConfigListItem, ConfigListItemDetail, FormModel } from '../types'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { useDict } from '@/utils/dict'

  interface Props {
    modelValue: boolean
    panelMode: 'add' | 'edit'
    configData?: ConfigListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  type PanelWatchState = [boolean, Props['panelMode'], ConfigListItem['id'] | null]

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    panelMode: 'add',
    configData: undefined
  })

  const emit = defineEmits<Emits>()

  const { getDict } = useDict()
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const createDefaultForm = (): FormModel => ({
    configName: '',
    configKey: '',
    configValue: '',
    defaultValue: '',
    valueType: undefined,
    configGroup: '',
    optionDictType: '',
    enabled: true,
    isSystem: false,
    remark: ''
  })

  const form = reactive<FormModel>(createDefaultForm())

  const rules = reactive<FormRules>({
    configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
    configKey: [{ required: true, message: '请输入配置键', trigger: 'blur' }]
  })

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.clearValidate()
  }

  const initForm = async () => {
    if (props.panelMode === 'edit' && props.configData) {
      Object.assign(form, {
        configName: props.configData?.configName ?? '',
        configKey: props.configData?.configKey ?? '',
        configValue: props.configData?.configValue ?? '',
        defaultValue: props.configData?.defaultValue ?? '',
        valueType: props.configData?.valueType ?? undefined,
        configGroup: props.configData?.configGroup ?? '',
        optionDictType: props.configData?.optionDictType ?? '',
        enabled: props.configData?.enabled ?? true,
        isSystem: props.configData?.isSystem ?? false,
        remark: props.configData?.remark ?? ''
      })
      const id = props.configData?.id
      if (id != null) {
        detailLoading.value = true
        try {
          const detail: ConfigListItemDetail = await fetchGetConfigDetail(id)
          Object.assign(form, {
            configName: detail.configName ?? form.configName,
            configKey: detail.configKey ?? form.configKey,
            configValue: detail.configValue ?? form.configValue,
            defaultValue: detail.defaultValue ?? form.defaultValue,
            valueType: detail.valueType ?? form.valueType,
            configGroup: detail.configGroup ?? form.configGroup,
            optionDictType: detail.optionDictType ?? form.optionDictType,
            enabled: detail.enabled ?? form.enabled,
            isSystem: detail.isSystem ?? form.isSystem,
            remark: detail.remark ?? form.remark
          })
        } finally {
          detailLoading.value = false
        }
      }
    } else {
      resetForm()
    }
  }

  watch(
    (): PanelWatchState => [props.modelValue, props.panelMode, props.configData?.id ?? null],
    async ([visible]: PanelWatchState) => {
      if (visible) {
        await initForm()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  const handleClose = () => {
    visible.value = false
    resetForm()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
    } catch {
      return
    }

    submitLoading.value = true
    try {
      if (props.panelMode === 'add') {
        const payload: Api.Config.CreateConfigParams = {
          configName: form.configName,
          configKey: form.configKey,
          configValue: form.configValue,
          defaultValue: form.defaultValue,
          valueType: form.valueType,
          configGroup: form.configGroup,
          optionDictType: form.optionDictType,
          enabled: form.enabled,
          isSystem: form.isSystem,
          remark: form.remark
        }
        await fetchCreateConfig(payload)
      } else {
        const id = props.configData?.id
        if (id == null) return

        const payload: Api.Config.UpdateConfigParams = {
          configName: form.configName,
          configKey: form.configKey,
          configValue: form.configValue,
          defaultValue: form.defaultValue,
          valueType: form.valueType,
          configGroup: form.configGroup,
          optionDictType: form.optionDictType,
          enabled: form.enabled,
          isSystem: form.isSystem,
          remark: form.remark
        }
        await fetchUpdateConfig(id, payload)
      }

      ElMessage.success(props.panelMode === 'add' ? '新增成功' : '更新成功')
      emit('success')
      handleClose()
    } finally {
      submitLoading.value = false
    }
  }
</script>
