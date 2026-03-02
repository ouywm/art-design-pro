<template>
  <ElDialog v-model="dialogVisible" title="重置密码" width="400px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名">
        <ElInput :model-value="userName" disabled />
      </ElFormItem>
      <ElFormItem label="新密码" prop="newPassword">
        <ElInput
          v-model="formData.newPassword"
          type="password"
          placeholder="请输入新密码（至少6位）"
          show-password
        />
      </ElFormItem>
      <ElFormItem label="确认密码" prop="confirmPassword">
        <ElInput
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    visible: boolean
    userId?: number
    userName?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', userId: number, newPassword: string): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    userId: 0,
    userName: ''
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const formData = reactive({
    newPassword: '',
    confirmPassword: ''
  })

  // 自定义验证：确认密码必须与新密码一致
  const validateConfirmPassword = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error('请再次输入密码'))
    } else if (value !== formData.newPassword) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }

  const rules: FormRules = {
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      { validator: validateConfirmPassword, trigger: 'blur' }
    ]
  }

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const handleCancel = () => {
    dialogVisible.value = false
    resetForm()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      emit('submit', props.userId!, formData.newPassword)
      resetForm()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const resetForm = () => {
    formData.newPassword = ''
    formData.confirmPassword = ''
    formRef.value?.clearValidate()
  }

  // 监听弹窗关闭，重置表单
  watch(
    () => props.visible,
    (newVal) => {
      if (!newVal) {
        resetForm()
      }
    }
  )
</script>
