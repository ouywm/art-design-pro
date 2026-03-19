<template>
  <ElDrawer
    v-model="visible"
    :title="panelMode === 'add' ? '新增配置分组' : '编辑配置分组'"
    size="560px"
    destroy-on-close
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="96px">
      <ElFormItem label="分组名称" prop="groupName">
        <ElInput v-model="form.groupName" placeholder="请输入分组名称" />
      </ElFormItem>

      <ElFormItem label="分组编码" prop="groupCode">
        <ElInput
          v-model="form.groupCode"
          :disabled="props.panelMode === 'edit'"
          placeholder="请输入分组编码"
        />
      </ElFormItem>

      <ElFormItem label="分组排序" prop="groupSort">
        <ElInputNumber
          v-model="form.groupSort"
          :min="0"
          placeholder="请输入分组排序"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="是否启用" prop="enabled">
        <ElSwitch v-model="form.enabled" />
      </ElFormItem>

      <ElFormItem label="系统内置" prop="isSystem">
        <ElSwitch v-model="form.isSystem" />
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { fetchCreateConfigGroup, fetchUpdateConfigGroup } from '@/api/config'
  import type { ConfigGroupFormModel } from '../types'

  interface Props {
    modelValue: boolean
    panelMode: 'add' | 'edit'
    groupData?: Api.ConfigGroup.ConfigGroupVo
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    panelMode: 'add',
    groupData: undefined
  })

  const emit = defineEmits<Emits>()
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const createDefaultForm = (): ConfigGroupFormModel => ({
    groupName: '',
    groupCode: '',
    groupSort: undefined,
    enabled: true,
    isSystem: false,
    remark: ''
  })

  const form = reactive<ConfigGroupFormModel>(createDefaultForm())

  const rules = reactive<FormRules<ConfigGroupFormModel>>({
    groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
    groupCode: [{ required: true, message: '请输入分组编码', trigger: 'blur' }]
  })

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.clearValidate()
  }

  const initForm = () => {
    resetForm()

    if (props.panelMode !== 'edit' || !props.groupData) {
      return
    }

    Object.assign(form, {
      groupName: props.groupData.groupName,
      groupCode: props.groupData.groupCode,
      groupSort: props.groupData.groupSort,
      enabled: props.groupData.enabled,
      isSystem: props.groupData.isSystem,
      remark: props.groupData.remark
    })
  }

  watch(
    () => [props.modelValue, props.panelMode, props.groupData?.id] as const,
    (drawerVisible) => {
      if (!drawerVisible[0]) {
        return
      }

      initForm()
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    },
    { immediate: true }
  )

  const handleClose = () => {
    visible.value = false
    resetForm()
  }

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
      const createPayload: Api.ConfigGroup.CreateConfigGroupParams = {
        groupName: form.groupName,
        groupCode: form.groupCode,
        groupSort: form.groupSort,
        enabled: form.enabled,
        isSystem: form.isSystem,
        remark: form.remark
      }

      if (props.panelMode === 'add') {
        await fetchCreateConfigGroup(createPayload)
      } else if (props.groupData) {
        await fetchUpdateConfigGroup(props.groupData.id, {
          groupName: form.groupName,
          groupSort: form.groupSort,
          enabled: form.enabled,
          isSystem: form.isSystem,
          remark: form.remark
        })
      }

      ElMessage.success(props.panelMode === 'add' ? '新增配置分组成功' : '更新配置分组成功')
      emit('success')
      handleClose()
    } finally {
      submitLoading.value = false
    }
  }
</script>
