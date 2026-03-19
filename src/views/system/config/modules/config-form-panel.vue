<template>
  <ElDrawer
    v-model="visible"
    :title="panelMode === 'add' ? '新增系统参数配置' : '编辑系统参数配置'"
    size="760px"
    destroy-on-close
    @close="handleClose"
  >
    <ElForm ref="formRef" v-loading="detailLoading" :model="form" :rules="rules" label-width="96px">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="配置名称" prop="configName">
            <ElInput v-model="form.configName" placeholder="请输入配置名称" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="配置键" prop="configKey">
            <ElInput v-model="form.configKey" placeholder="请输入配置键" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="值类型" prop="valueType">
            <ElSelect v-model="form.valueType" placeholder="请选择值类型">
              <ElOption
                v-for="item in valueTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="配置分组" prop="configGroupId">
            <ElSelect
              v-model="form.configGroupId"
              filterable
              :disabled="props.groupOptions.length === 0"
              :placeholder="props.groupOptions.length > 0 ? '请选择配置分组' : '请先新增配置分组'"
            >
              <ElOption
                v-for="item in props.groupOptions"
                :key="item.id"
                :label="`${item.groupName} (${item.groupCode})`"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol v-if="isSelectValueType" :span="12">
          <ElFormItem label="候选字典" prop="optionDictType">
            <ElSelect
              v-model="form.optionDictType"
              clearable
              filterable
              :placeholder="props.dictTypeOptions.length > 0 ? '请选择候选字典' : '暂无字典类型'"
            >
              <ElOption
                v-for="item in props.dictTypeOptions"
                :key="item.id"
                :label="`${item.dictName} (${item.dictType})`"
                :value="item.dictType"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="分组内排序" prop="configSort">
            <ElInputNumber
              v-model="form.configSort"
              :min="0"
              placeholder="请输入排序值"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="当前值" prop="configValue">
            <ConfigValueField
              v-model="form.configValue"
              :value-type="form.valueType"
              :option-dict-type="form.optionDictType"
              placeholder="请输入当前配置值"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="默认值" prop="defaultValue">
            <ConfigValueField
              v-model="form.defaultValue"
              :value-type="form.valueType"
              :option-dict-type="form.optionDictType"
              placeholder="请输入默认配置值"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="是否启用" prop="enabled">
            <ElSwitch v-model="form.enabled" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="系统内置" prop="isSystem">
            <ElSwitch v-model="form.isSystem" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="备注" prop="remark">
            <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { fetchCreateConfig, fetchGetConfigDetail, fetchUpdateConfig } from '@/api/config'
  import { useDict } from '@/utils/dict'
  import { CONFIG_VALUE_TYPE } from '../constants'
  import type { ConfigListItem, ConfigListItemDetail, FormModel } from '../types'
  import ConfigValueField from './config-value-field.vue'

  interface Props {
    modelValue: boolean
    panelMode: 'add' | 'edit'
    configData?: ConfigListItem
    groupOptions: Api.ConfigGroup.ConfigGroupVo[]
    dictTypeOptions: Api.SystemManage.DictTypeVo[]
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  type PanelWatchState = [boolean, Props['panelMode'], ConfigListItem['id'] | null]

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    panelMode: 'add',
    configData: undefined,
    groupOptions: () => [],
    dictTypeOptions: () => []
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

  const valueTypeOptions = computed(() => {
    return getDict('config_value_type').map((item) => ({
      label: item.label,
      value: Number(item.value) as FormModel['valueType']
    }))
  })

  const isSelectValueType = computed(() => form.valueType === CONFIG_VALUE_TYPE.SELECT)

  const createDefaultForm = (): FormModel => ({
    configName: '',
    configKey: '',
    configValue: '',
    defaultValue: '',
    valueType: CONFIG_VALUE_TYPE.TEXT,
    configGroupId: undefined,
    optionDictType: '',
    configSort: undefined,
    enabled: true,
    isSystem: false,
    remark: ''
  })

  const form = reactive<FormModel>(createDefaultForm())

  const rules = reactive<FormRules<FormModel>>({
    configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
    configKey: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
    valueType: [{ required: true, message: '请选择值类型', trigger: 'change' }],
    configGroupId: [{ required: true, message: '请选择配置分组', trigger: 'change' }],
    optionDictType: [
      {
        validator: (_rule, value: string, callback) => {
          if (isSelectValueType.value && !(value ?? '').trim()) {
            callback(new Error('请选择候选字典'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  })

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.clearValidate()
  }

  const applyDetailToForm = (detail: ConfigListItemDetail) => {
    Object.assign(form, {
      configName: detail.configName,
      configKey: detail.configKey,
      configValue: detail.configValue,
      defaultValue: detail.defaultValue,
      valueType: detail.valueType,
      configGroupId: detail.configGroupId,
      optionDictType: detail.optionDictType,
      configSort: detail.configSort,
      enabled: detail.enabled,
      isSystem: detail.isSystem,
      remark: detail.remark
    })
  }

  const initForm = async () => {
    resetForm()

    if (props.panelMode !== 'edit' || !props.configData) {
      return
    }

    Object.assign(form, {
      configName: props.configData.configName,
      configKey: props.configData.configKey,
      configValue: props.configData.configValue,
      defaultValue: props.configData.defaultValue,
      valueType: props.configData.valueType,
      configGroupId: props.configData.configGroupId,
      optionDictType: props.configData.optionDictType,
      configSort: props.configData.configSort,
      enabled: props.configData.enabled,
      isSystem: props.configData.isSystem,
      remark: props.configData.remark
    })

    detailLoading.value = true
    try {
      const detail = await fetchGetConfigDetail(props.configData.id)
      applyDetailToForm(detail)
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    (): PanelWatchState => [props.modelValue, props.panelMode, props.configData?.id ?? null],
    async ([drawerVisible]) => {
      if (!drawerVisible) {
        return
      }

      await initForm()
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    },
    { immediate: true }
  )

  watch(
    () => form.valueType,
    (value) => {
      if (value !== CONFIG_VALUE_TYPE.SELECT && form.optionDictType) {
        form.optionDictType = ''
      }

      if (value !== CONFIG_VALUE_TYPE.SELECT) {
        formRef.value?.clearValidate('optionDictType')
      }
    }
  )

  const handleClose = () => {
    visible.value = false
    resetForm()
  }

  const getRequiredConfigGroupId = (): number => {
    if (form.configGroupId == null) {
      throw new Error('请选择配置分组')
    }

    return form.configGroupId
  }

  const buildCreatePayload = (): Api.Config.CreateConfigParams => ({
    configName: form.configName,
    configKey: form.configKey,
    configValue: form.configValue,
    defaultValue: form.defaultValue,
    valueType: form.valueType,
    configGroupId: getRequiredConfigGroupId(),
    optionDictType: isSelectValueType.value ? form.optionDictType || undefined : undefined,
    configSort: form.configSort,
    enabled: form.enabled,
    isSystem: form.isSystem,
    remark: form.remark
  })

  const buildUpdatePayload = (): Api.Config.UpdateConfigParams => ({
    configName: form.configName,
    configKey: form.configKey,
    configValue: form.configValue,
    defaultValue: form.defaultValue,
    valueType: form.valueType,
    configGroupId: form.configGroupId,
    optionDictType: isSelectValueType.value ? form.optionDictType || undefined : undefined,
    configSort: form.configSort,
    enabled: form.enabled,
    isSystem: form.isSystem,
    remark: form.remark
  })

  const handleSubmit = async () => {
    if (!formRef.value) {
      return
    }

    try {
      await formRef.value.validate()
    } catch {
      return
    }

    submitLoading.value = true
    try {
      if (props.panelMode === 'add') {
        await fetchCreateConfig(buildCreatePayload())
      } else if (props.configData) {
        await fetchUpdateConfig(props.configData.id, buildUpdatePayload())
      }

      ElMessage.success(props.panelMode === 'add' ? '新增成功' : '更新成功')
      emit('success')
      handleClose()
    } finally {
      submitLoading.value = false
    }
  }
</script>
