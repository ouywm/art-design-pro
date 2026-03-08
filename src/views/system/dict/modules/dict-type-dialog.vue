<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增字典类型' : '编辑字典类型'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="字典名称" prop="dictName">
        <ElInput v-model="formData.dictName" placeholder="请输入字典名称" />
      </ElFormItem>
      <ElFormItem label="字典类型" prop="dictType">
        <ElInput
          v-model="formData.dictType"
          placeholder="请输入字典类型编码"
          :disabled="dialogType === 'edit'"
        />
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
  import { fetchCreateDictType, fetchUpdateDictType } from '@/api/dict-manage'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useDict } from '@/utils/dict'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    dictTypeData?: Api.SystemManage.DictTypeVo
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
    dictName: '',
    dictType: '',
    status: 1 as Api.SystemManage.DictStatus,
    remark: ''
  })

  const rules: FormRules = {
    dictName: [
      { required: true, message: '请输入字典名称', trigger: 'blur' },
      { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    dictType: [
      { required: true, message: '请输入字典类型编码', trigger: 'blur' },
      { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' },
      {
        pattern: /^[a-z_]+$/,
        message: '只能包含小写字母和下划线',
        trigger: 'blur'
      }
    ],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  watch(
    [() => props.modelValue, () => props.dictTypeData],
    ([visible, data]: [boolean, Api.SystemManage.DictTypeVo | undefined]) => {
      if (visible) {
        if (props.dialogType === 'edit' && data) {
          Object.assign(formData, {
            dictName: data.dictName,
            dictType: data.dictType,
            status: data.status,
            remark: data.remark
          })
        } else {
          Object.assign(formData, {
            dictName: '',
            dictType: '',
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
          await fetchCreateDictType({
            dictName: formData.dictName,
            dictType: formData.dictType,
            status: formData.status,
            remark: formData.remark || undefined
          })
          ElMessage.success('创建成功')
        } else {
          const id = props.dictTypeData?.id
          if (!id) return
          await fetchUpdateDictType(id, {
            dictName: formData.dictName,
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
