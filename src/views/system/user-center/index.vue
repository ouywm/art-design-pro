<!-- 个人中心页面 -->
<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="relative flex-b mt-2.5 max-md:block max-md:mt-1">
      <div class="w-112 mr-5 max-md:w-full max-md:mr-0">
        <div class="art-card-sm relative p-9 pb-6 overflow-hidden text-center">
          <img class="absolute top-0 left-0 w-full h-50 object-cover" src="@imgs/user/bg.webp" />

          <!-- 头像区域：点击上传 -->
          <div
            class="relative z-10 mt-30 mx-auto w-20 h-20 group cursor-pointer"
            @click="triggerAvatarUpload"
          >
            <img
              class="w-20 h-20 object-cover border-2 border-white rounded-full"
              :src="avatarUrl"
              alt="用户头像"
            />
            <div
              class="absolute inset-0 flex-c justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ArtSvgIcon icon="ri:camera-line" class="text-white text-xl" />
            </div>
            <input
              ref="avatarInputRef"
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              class="hidden"
              @change="handleAvatarChange"
            />
          </div>
          <ElProgress
            v-if="avatarUploading"
            :percentage="100"
            :indeterminate="true"
            :show-text="false"
            :stroke-width="3"
            class="w-20 mx-auto mt-1"
          />

          <h2 class="mt-5 text-xl font-normal">{{ userInfo.userName }}</h2>
          <p class="mt-5 text-sm">{{ form.des || '暂无个人介绍' }}</p>

          <div class="w-75 mx-auto mt-7.5 text-left">
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:mail-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ userInfo.email || '暂无邮箱' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:user-3-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ userInfo.userName }}</span>
            </div>
            <div v-if="form.phone" class="mt-2.5">
              <ArtSvgIcon icon="ri:phone-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ form.phone }}</span>
            </div>
          </div>

          <div class="mt-10">
            <h3 class="text-sm font-medium">标签</h3>
            <div class="flex flex-wrap justify-center mt-3.5">
              <div
                v-for="item in lableList"
                :key="item"
                class="py-1 px-1.5 mr-2.5 mb-2.5 text-xs border border-g-300 rounded"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <div class="mt-8">
            <ElButton type="primary" plain @click="router.push('/system/my-login-log')" v-ripple>
              <ArtSvgIcon icon="ri:file-list-3-line" class="mr-1" />
              查看登录日志
            </ElButton>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden max-md:w-full max-md:mt-3.5">
        <div class="art-card-sm">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">基本设置</h1>

          <ElForm
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem label="昵称" prop="nickName">
                <ElInput v-model="form.nickName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="性别" prop="gender" class="ml-5">
                <ElSelect v-model="form.gender" placeholder="请选择" :disabled="!isEdit">
                  <ElOption
                    v-for="item in genderOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="邮箱" prop="email">
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="手机" prop="phone" class="ml-5">
                <ElInput v-model="form.phone" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElFormItem label="个人介绍" prop="des" class="h-32">
              <ElInput type="textarea" :rows="4" v-model="form.des" :disabled="!isEdit" />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton
                type="primary"
                class="w-22.5"
                v-ripple
                @click="handleEdit"
                :loading="saving"
              >
                {{ isEdit ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="art-card-sm my-5">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">更改密码</h1>

          <ElForm
            :model="pwdForm"
            :rules="pwdRules"
            ref="pwdFormRef"
            class="box-border p-5"
            label-width="86px"
            label-position="top"
          >
            <ElFormItem label="当前密码" prop="oldPassword">
              <ElInput
                v-model="pwdForm.oldPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="新密码" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="确认新密码" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton
                type="primary"
                class="w-22.5"
                v-ripple
                @click="handleEditPwd"
                :loading="savingPwd"
              >
                {{ isEditPwd ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { fetchUploadFile } from '@/api/file-upload'
  import { fetchUpdateProfile, fetchChangePassword } from '@/api/user-profile'
  import defaultAvatar from '@imgs/user/avatar.webp'

  defineOptions({ name: 'UserCenter' })

  const router = useRouter()
  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  // ==================== 头像上传 ====================
  const avatarInputRef = ref<HTMLInputElement>()
  const avatarUploading = ref(false)
  /** 已上传的头像 URL（本次会话中修改的） */
  const uploadedAvatarUrl = ref('')

  /** 显示的头像：优先本次上传的 > store 里的 > 默认 */
  const avatarUrl = computed(() => {
    return uploadedAvatarUrl.value || userInfo.value.avatar || defaultAvatar
  })

  function triggerAvatarUpload() {
    avatarInputRef.value?.click()
  }

  async function handleAvatarChange(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    // 校验大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning('头像文件不能超过 5MB')
      return
    }

    avatarUploading.value = true
    try {
      const result = await fetchUploadFile(file)
      uploadedAvatarUrl.value = result.url
      // 立即更新后端
      await fetchUpdateProfile({ avatar: result.url })
      // 同步更新 store
      userStore.setUserInfo({ ...userInfo.value, avatar: result.url } as Api.Auth.UserInfo)
      ElMessage.success('头像更新成功')
    } catch {
      // ignore
    } finally {
      avatarUploading.value = false
      // 重置 input，允许再次选择同一文件
      input.value = ''
    }
  }

  // ==================== 基本设置 ====================
  const isEdit = ref(false)
  const saving = ref(false)
  const ruleFormRef = ref<FormInstance>()

  const form = reactive({
    nickName: '',
    email: '',
    phone: '',
    gender: undefined as Api.SystemManage.Gender | undefined,
    des: ''
  })

  /** 从 store 初始化表单 */
  function initFormFromStore() {
    const info = userInfo.value
    form.nickName = info.userName || ''
    form.email = info.email || ''
    form.phone = ''
    form.gender = undefined
    form.des = ''
  }

  const genderOptions = [
    { value: 1, label: '男' },
    { value: 2, label: '女' }
  ]

  const rules = reactive<FormRules>({
    nickName: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
  })

  async function handleEdit() {
    if (!isEdit.value) {
      isEdit.value = true
      return
    }

    // 保存
    const valid = await ruleFormRef.value?.validate().catch(() => false)
    if (!valid) return

    saving.value = true
    try {
      const params: Api.UserProfile.UpdateProfileParams = {
        nickName: form.nickName,
        email: form.email,
        phone: form.phone || undefined,
        gender: form.gender,
        avatar: uploadedAvatarUrl.value || undefined
      }
      await fetchUpdateProfile(params)
      ElMessage.success('个人信息更新成功')
      isEdit.value = false
    } catch {
      // ignore
    } finally {
      saving.value = false
    }
  }

  // ==================== 更改密码 ====================
  const isEditPwd = ref(false)
  const savingPwd = ref(false)
  const pwdFormRef = ref<FormInstance>()

  const pwdForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const pwdRules = reactive<FormRules>({
    oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, max: 50, message: '密码长度 6-50 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          if (value !== pwdForm.newPassword) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  })

  async function handleEditPwd() {
    if (!isEditPwd.value) {
      isEditPwd.value = true
      return
    }

    const valid = await pwdFormRef.value?.validate().catch(() => false)
    if (!valid) return

    savingPwd.value = true
    try {
      await fetchChangePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      })
      ElMessage.success('密码修改成功')
      isEditPwd.value = false
      pwdForm.oldPassword = ''
      pwdForm.newPassword = ''
      pwdForm.confirmPassword = ''
    } catch {
      // ignore
    } finally {
      savingPwd.value = false
    }
  }

  // ==================== 标签 ====================
  const lableList: Array<string> = ['专注设计', '很有想法', '辣~', '大长腿', '川妹子', '海纳百川']

  // ==================== 初始化 ====================
  onMounted(() => {
    initFormFromStore()
  })
</script>
