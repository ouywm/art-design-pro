<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
      v-loading="detailLoading"
    >
      <ElFormItem label="用户名" prop="userName">
        <ElInput v-model="formData.userName" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem label="昵称" prop="nickName">
        <ElInput v-model="formData.nickName" placeholder="请输入昵称" />
      </ElFormItem>
      <ElFormItem label="性别" prop="gender">
        <ElSelect v-model="formData.gender" placeholder="请选择性别">
          <ElOption label="男" :value="1" />
          <ElOption label="女" :value="2" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="formData.phone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="邮箱" prop="email">
        <ElInput v-model="formData.email" placeholder="请输入邮箱" />
      </ElFormItem>
      <ElFormItem v-if="dialogType === 'edit'" label="状态" prop="status">
        <ElSelect v-model="formData.status" placeholder="请选择状态">
          <ElOption label="在线" :value="1" />
          <ElOption label="离线" :value="2" />
          <ElOption label="异常" :value="3" />
          <ElOption label="注销" :value="4" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="角色" prop="role">
        <ElSelect
          v-model="formData.role"
          multiple
          :loading="roleListLoading"
          placeholder="请选择角色"
        >
          <ElOption
            v-for="role in roleList"
            :key="role.roleId"
            :value="role.roleId"
            :label="role.roleName + (role.enabled ? '' : '（已禁用）')"
            :disabled="!role.enabled"
          />
        </ElSelect>
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
    fetchCreateUser,
    fetchUpdateUser,
    fetchGetUserDetail,
    fetchGetRoleList
  } from '@/api/system-manage'
  import type { FormInstance, FormRules } from 'element-plus'
  import { DialogType } from '@/types'

  interface Props {
    visible: boolean
    type: DialogType
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', type: DialogType): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 角色列表数据
  const roleList = ref<Api.SystemManage.RoleVo[]>([])
  const roleListLoading = ref(false)

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)

  // 表单数据
  const formData = reactive({
    userName: '',
    nickName: '',
    phone: '',
    email: '',
    gender: undefined as Api.SystemManage.Gender | undefined,
    status: undefined as Api.SystemManage.UserStatus | undefined,
    role: [] as number[]
  })

  // 表单验证规则
  const rules: FormRules = {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    nickName: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    role: [
      { required: true, message: '请选择角色', trigger: 'change' },
      { type: 'array', min: 1, message: '至少选择一个角色', trigger: 'change' }
    ]
  }

  /**
   * 性别字符串转数字
   */
  const genderTextToNumber = (
    text: string | number | undefined
  ): Api.SystemManage.Gender | undefined => {
    if (typeof text === 'number') return text as Api.SystemManage.Gender
    if (text === '男') return 1
    if (text === '女') return 2
    return undefined
  }

  /**
   * 加载角色列表
   */
  const loadRoleList = async () => {
    roleListLoading.value = true
    try {
      const res = await fetchGetRoleList({ current: 1, size: 100 })
      // 显示所有角色，包括禁用的角色
      roleList.value = res.records
    } catch (error) {
      console.error('加载角色列表失败:', error)
      ElMessage.error('加载角色列表失败')
    } finally {
      roleListLoading.value = false
    }
  }

  /**
   * 初始化表单数据
   */
  const initFormData = async () => {
    const isEdit = props.type === 'edit' && props.userData?.id

    if (isEdit) {
      // 编辑模式：调用详情接口获取完整数据
      detailLoading.value = true
      try {
        const data = await fetchGetUserDetail(props.userData!.id!)
        Object.assign(formData, {
          userName: data.userName || '',
          nickName: data.nickName || '',
          phone: data.userPhone || '',
          email: data.userEmail || '',
          gender: genderTextToNumber(data.userGender),
          status: data.status,
          role: data.roles?.map((r) => r.roleId) || []
        })
      } finally {
        detailLoading.value = false
      }
    } else {
      // 新增模式：清空表单
      Object.assign(formData, {
        userName: '',
        nickName: '',
        phone: '',
        email: '',
        gender: undefined,
        status: undefined,
        role: []
      })
    }
  }

  watch(
    () => [props.visible, props.type, props.userData],
    async ([visible]) => {
      if (visible) {
        await Promise.all([loadRoleList(), initFormData()])
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      submitLoading.value = true
      try {
        if (dialogType.value === 'add') {
          await fetchCreateUser({
            userName: formData.userName,
            nickName: formData.nickName,
            gender: formData.gender,
            phone: formData.phone,
            email: formData.email || undefined,
            roleIds: formData.role.length > 0 ? formData.role : undefined
          })
        } else {
          const id = props.userData?.id
          if (!id) return
          await fetchUpdateUser(id, {
            nickName: formData.nickName,
            gender: formData.gender,
            phone: formData.phone,
            email: formData.email || undefined,
            status: formData.status,
            roleIds: formData.role.length > 0 ? formData.role : undefined
          })
        }

        ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
        dialogVisible.value = false
        emit('submit', dialogType.value)
      } catch {
        // 错误已由 http 拦截器处理
      } finally {
        submitLoading.value = false
      }
    })
  }
</script>
