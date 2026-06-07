<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="560px"
    align-center
    destroy-on-close
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="96px">
      <ElFormItem label="资源名称" prop="resourceName">
        <ElInput v-model="formData.resourceName" placeholder="请输入资源名称" maxlength="80" />
      </ElFormItem>

      <ElFormItem label="资源编码" prop="resourceCode">
        <ElInput
          v-model="formData.resourceCode"
          placeholder="请输入资源编码，如 system:resource:list"
          maxlength="120"
        />
      </ElFormItem>

      <ElFormItem label="请求方式" prop="method">
        <ElSelect v-model="formData.method" placeholder="请选择请求方式">
          <ElOption
            v-for="item in RESOURCE_METHOD_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="接口路径" prop="path">
        <ElInput v-model="formData.path" placeholder="/api/system/resource/{id}" maxlength="255" />
      </ElFormItem>

      <ElFormItem label="资源描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入资源说明"
          maxlength="255"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="状态" prop="enabled">
        <ElSwitch v-model="formData.enabled" active-text="启用" inactive-text="停用" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    fetchCreateResource,
    fetchUpdateResource,
    fetchGetResourceDetail
  } from '@/api/resource-permission'
  import { RESOURCE_METHOD_OPTIONS } from '../constants'
  import {
    createDefaultResourceForm,
    type ResourceFormMode,
    type ResourceFormModel,
    type ResourceListItem
  } from '../types'

  interface Props {
    visible: boolean
    mode: ResourceFormMode
    row?: Partial<ResourceListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success', mode: ResourceFormMode): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const formData = reactive<ResourceFormModel>(createDefaultResourceForm())

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value)
  })

  const dialogTitle = computed(() => (props.mode === 'add' ? '新增资源' : '编辑资源'))

  const rules: FormRules<ResourceFormModel> = {
    resourceName: [
      { required: true, message: '请输入资源名称', trigger: 'blur' },
      { min: 2, max: 80, message: '长度在 2 到 80 个字符', trigger: 'blur' }
    ],
    resourceCode: [
      { required: true, message: '请输入资源编码', trigger: 'blur' },
      { min: 2, max: 120, message: '长度在 2 到 120 个字符', trigger: 'blur' }
    ],
    method: [{ required: true, message: '请选择请求方式', trigger: 'change' }],
    path: [
      { required: true, message: '请输入接口路径', trigger: 'blur' },
      { min: 1, max: 255, message: '长度在 1 到 255 个字符', trigger: 'blur' }
    ]
  }

  const fillForm = (detail?: Partial<ResourceListItem>) => {
    Object.assign(formData, createDefaultResourceForm(), {
      resourceName: detail?.resourceName ?? '',
      resourceCode: detail?.resourceCode ?? '',
      method: detail?.method ?? 'GET',
      path: detail?.path ?? '',
      description: detail?.description ?? '',
      enabled: detail?.enabled ?? true
    })
  }

  const loadDetail = async () => {
    if (props.mode === 'edit' && props.row?.id) {
      const detail = await fetchGetResourceDetail(Number(props.row.id))
      fillForm(detail)
      return
    }

    fillForm()
  }

  watch(
    () => props.visible,
    async (visible) => {
      if (!visible) return
      await loadDetail()
      await nextTick()
      formRef.value?.clearValidate()
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    submitLoading.value = true
    try {
      if (props.mode === 'add') {
        await fetchCreateResource({ ...formData })
      } else if (props.row?.id) {
        await fetchUpdateResource(Number(props.row.id), { ...formData })
      }

      ElMessage.success(props.mode === 'add' ? '新增成功' : '更新成功')
      dialogVisible.value = false
      emit('success', props.mode)
    } finally {
      submitLoading.value = false
    }
  }
</script>
