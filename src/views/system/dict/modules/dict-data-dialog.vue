<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增字典数据' : '编辑字典数据'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="字典类型" prop="dictType">
        <ElInput v-model="formData.dictType" placeholder="字典类型" disabled />
      </ElFormItem>
      <ElFormItem label="字典标签" prop="dictLabel">
        <ElInput v-model="formData.dictLabel" placeholder="请输入字典标签" />
      </ElFormItem>
      <ElFormItem label="字典值" prop="dictValue">
        <ElInput v-model="formData.dictValue" placeholder="请输入字典值" />
      </ElFormItem>
      <ElFormItem label="排序" prop="dictSort">
        <ElInputNumber v-model="formData.dictSort" :min="0" :max="9999" />
      </ElFormItem>
      <ElFormItem label="样式类" prop="listClass">
        <ElSelect v-model="formData.listClass" placeholder="请选择样式类" clearable>
          <ElOption label="success（绿色）" value="success" />
          <ElOption label="warning（橙色）" value="warning" />
          <ElOption label="danger（红色）" value="danger" />
          <ElOption label="info（蓝色）" value="info" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="CSS类名" prop="cssClass">
        <ElInput v-model="formData.cssClass" placeholder="请输入CSS类名（可选）" />
      </ElFormItem>
      <ElFormItem label="是否默认" prop="isDefault">
        <ElSwitch v-model="formData.isDefault" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElSelect v-model="formData.status" placeholder="请选择状态">
          <ElOption
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="Number(item.value)"
          />
        </ElSelect>
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
  import { fetchCreateDictData, fetchUpdateDictData } from '@/api/dict-manage'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useDict } from '@/utils/dict'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    dictData?: Api.SystemManage.DictDataVo
    defaultDictType?: string
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { getDict } = useDict()

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const statusOptions = computed(() => getDict('sys_status'))

  const formData = reactive({
    dictType: '',
    dictLabel: '',
    dictValue: '',
    dictSort: 0,
    cssClass: '',
    listClass: '',
    isDefault: false,
    status: 1 as Api.SystemManage.DictStatus,
    remark: ''
  })

  const rules: FormRules = {
    dictType: [
      { required: true, message: '请输入字典类型编码', trigger: 'blur' },
      { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    dictLabel: [
      { required: true, message: '请输入字典标签', trigger: 'blur' },
      { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    dictValue: [
      { required: true, message: '请输入字典值', trigger: 'blur' },
      { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  watch(
    [() => props.modelValue, () => props.dictData],
    ([visible, data]: [boolean, Api.SystemManage.DictDataVo | undefined]) => {
      if (visible) {
        if (props.dialogType === 'edit' && data) {
          Object.assign(formData, {
            dictType: data.dictType,
            dictLabel: data.dictLabel,
            dictValue: data.dictValue,
            dictSort: data.dictSort,
            cssClass: data.cssClass,
            listClass: data.listClass,
            isDefault: data.isDefault,
            status: data.status,
            remark: data.remark
          })
        } else {
          Object.assign(formData, {
            dictType: props.defaultDictType || '',
            dictLabel: '',
            dictValue: '',
            dictSort: 0,
            cssClass: '',
            listClass: '',
            isDefault: false,
            status: 1,
            remark: ''
          })
        }
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitLoading.value = true
      try {
        if (props.dialogType === 'add') {
          await fetchCreateDictData({
            dictType: formData.dictType,
            dictLabel: formData.dictLabel,
            dictValue: formData.dictValue,
            dictSort: formData.dictSort,
            cssClass: formData.cssClass || undefined,
            listClass: formData.listClass || undefined,
            isDefault: formData.isDefault,
            status: formData.status,
            remark: formData.remark || undefined
          })
          ElMessage.success('创建成功')
        } else {
          const id = props.dictData?.id
          if (!id) return
          await fetchUpdateDictData(id, {
            dictLabel: formData.dictLabel,
            dictValue: formData.dictValue,
            dictSort: formData.dictSort,
            cssClass: formData.cssClass || undefined,
            listClass: formData.listClass || undefined,
            isDefault: formData.isDefault,
            status: formData.status,
            remark: formData.remark || undefined
          })
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        emit('success')
      } finally {
        submitLoading.value = false
      }
    })
  }
</script>
