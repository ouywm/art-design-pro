<template>
  <ElDrawer
    v-model="visible"
    :title="panelMode === 'add' ? '新增系统公告' : '编辑系统公告'"
    :size="drawerSize"
    destroy-on-close
    @close="handleClose"
  >
    <ElForm ref="formRef" v-loading="formLoading" :model="form" :rules="rules" label-width="96px">
      <ElRow :gutter="16">
        <ElCol :span="16">
          <ElFormItem label="公告标题" prop="noticeTitle">
            <ElInput v-model="form.noticeTitle" maxlength="200" placeholder="请输入公告标题" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="公告级别" prop="noticeLevel">
            <ElSelect v-model="form.noticeLevel" placeholder="请选择公告级别">
              <ElOption
                v-for="item in levelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="公告范围" prop="noticeScope">
            <ElSelect v-model="form.noticeScope" placeholder="请选择公告范围">
              <ElOption
                v-for="item in scopeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="过期时间" prop="expireTime">
            <ElDatePicker
              v-model="form.expireTime"
              clearable
              style="width: 100%"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              placeholder="请选择过期时间"
            />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.noticeScope === NOTICE_SCOPE_ROLE" :span="24">
          <ElFormItem label="指定角色" prop="targetRoleIds">
            <ElSelect
              v-model="form.targetRoleIds"
              clearable
              collapse-tags
              collapse-tags-tooltip
              filterable
              multiple
              :loading="roleLoading"
              placeholder="请选择目标角色"
            >
              <ElOption
                v-for="item in roleOptions"
                :key="item.roleId"
                :label="`${item.roleName} (${item.roleCode})${item.enabled ? '' : '（已禁用）'}`"
                :value="item.roleId"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.noticeScope === NOTICE_SCOPE_USER" :span="24">
          <ElFormItem label="指定用户" prop="targetUserIds">
            <ElSelect
              v-model="form.targetUserIds"
              clearable
              collapse-tags
              collapse-tags-tooltip
              filterable
              multiple
              :loading="userLoading"
              placeholder="请选择目标用户"
            >
              <ElOption
                v-for="item in userOptions"
                :key="item.id"
                :label="`${item.nickName || item.userName} (${item.userName})`"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="是否置顶" prop="pinned">
            <ElSwitch v-model="form.pinned" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="是否启用" prop="enabled">
            <ElSwitch v-model="form.enabled" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="8">
          <ElFormItem label="排序" prop="sort">
            <ElInputNumber
              v-model="form.sort"
              :min="0"
              placeholder="请输入排序值"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="公告正文" prop="noticeContent">
            <ArtWangEditor
              v-model="form.noticeContent"
              height="360px"
              placeholder="请输入公告正文"
            />
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
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { fetchCreateNotice, fetchGetNoticeDetail, fetchUpdateNotice } from '@/api/notice'
  import { fetchGetRoleList, fetchGetUserList } from '@/api/system-manage'
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
  import { useDict } from '@/utils/dict'
  import type { NoticeFormModel, NoticeListItem } from '../types'

  interface Props {
    modelValue: boolean
    panelMode: 'add' | 'edit'
    noticeData?: NoticeListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    panelMode: 'add',
    noticeData: undefined
  })

  const emit = defineEmits<Emits>()

  const { width } = useWindowSize()
  const { getDict } = useDict()

  const DEFAULT_NOTICE_LEVEL: Api.Notice.NoticeLevel = 1
  const DEFAULT_NOTICE_SCOPE: Api.Notice.NoticeScope = 1
  const NOTICE_SCOPE_ROLE: Api.Notice.NoticeScope = 2
  const NOTICE_SCOPE_USER: Api.Notice.NoticeScope = 3
  const DATETIME_SPACE_SEPARATOR = ' '
  const DATETIME_T_SEPARATOR = 'T'

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const formLoading = ref(false)
  const roleLoading = ref(false)
  const userLoading = ref(false)
  const roleOptions = ref<Api.SystemManage.RoleVo[]>([])
  const userOptions = ref<Api.SystemManage.UserListItem[]>([])
  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const drawerSize = computed(() => (width.value < 1024 ? '100%' : '960px'))

  const levelOptions = computed(() => {
    return getDict('notice_level').map((item) => ({
      label: item.label,
      value: Number(item.value) as NoticeFormModel['noticeLevel']
    }))
  })

  const scopeOptions = computed(() => {
    return getDict('notice_scope').map((item) => ({
      label: item.label,
      value: Number(item.value) as NoticeFormModel['noticeScope']
    }))
  })

  const createDefaultForm = (): NoticeFormModel => ({
    noticeTitle: '',
    noticeContent: '',
    noticeLevel: DEFAULT_NOTICE_LEVEL,
    noticeScope: DEFAULT_NOTICE_SCOPE,
    targetRoleIds: [],
    targetUserIds: [],
    pinned: false,
    enabled: true,
    sort: undefined,
    expireTime: null,
    remark: ''
  })

  const form = reactive<NoticeFormModel>(createDefaultForm())

  const isRichTextEmpty = (value: string) => {
    if (/<(img|video|audio|iframe|embed|object)\b/i.test(value)) {
      return false
    }

    return (
      value
        .replace(/&nbsp;/gi, '')
        .replace(/<br\s*\/?>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim() === ''
    )
  }

  const rules = reactive<FormRules<NoticeFormModel>>({
    noticeTitle: [
      { required: true, message: '请输入公告标题', trigger: 'blur' },
      { min: 1, max: 200, message: '公告标题长度必须在 1 到 200 个字符之间', trigger: 'blur' }
    ],
    noticeContent: [
      {
        validator: (_rule, value: string, callback) => {
          if (!value || isRichTextEmpty(value)) {
            callback(new Error('请输入公告正文'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ],
    noticeScope: [{ required: true, message: '请选择公告范围', trigger: 'change' }],
    targetRoleIds: [
      {
        validator: (_rule, value: number[], callback) => {
          if (form.noticeScope === NOTICE_SCOPE_ROLE && value.length === 0) {
            callback(new Error('请选择目标角色'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ],
    targetUserIds: [
      {
        validator: (_rule, value: number[], callback) => {
          if (form.noticeScope === NOTICE_SCOPE_USER && value.length === 0) {
            callback(new Error('请选择目标用户'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ],
    remark: [{ max: 500, message: '备注长度不能超过 500 个字符', trigger: 'blur' }]
  })

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.clearValidate()
  }

  const loadRoleOptions = async () => {
    roleLoading.value = true
    try {
      const response = await fetchGetRoleList({ page: 1, size: 1000 })
      roleOptions.value = response.content
    } finally {
      roleLoading.value = false
    }
  }

  const loadUserOptions = async () => {
    userLoading.value = true
    try {
      const response = await fetchGetUserList({ page: 1, size: 1000 })
      userOptions.value = response.content
    } finally {
      userLoading.value = false
    }
  }

  const normalizeDateTimeValue = (value: string | null | undefined): string | null => {
    if (!value) {
      return null
    }

    return value.includes(DATETIME_SPACE_SEPARATOR)
      ? value.replace(DATETIME_SPACE_SEPARATOR, DATETIME_T_SEPARATOR)
      : value
  }

  const applyDetailToForm = (detail: Api.Notice.NoticeDetailVo) => {
    Object.assign(form, {
      noticeTitle: detail.noticeTitle,
      noticeContent: detail.noticeContent,
      noticeLevel: detail.noticeLevel,
      noticeScope: detail.noticeScope,
      targetRoleIds: detail.targetRoleIds,
      targetUserIds: detail.targetUserIds,
      pinned: detail.pinned,
      enabled: detail.enabled,
      sort: detail.sort,
      expireTime: normalizeDateTimeValue(detail.expireTime),
      remark: detail.remark
    })
  }

  const initForm = async () => {
    resetForm()

    formLoading.value = true
    try {
      await Promise.all([loadRoleOptions(), loadUserOptions()])

      if (props.panelMode === 'edit' && props.noticeData) {
        const detail = await fetchGetNoticeDetail(props.noticeData.id)
        applyDetailToForm(detail)
      }
    } finally {
      formLoading.value = false
    }
  }

  watch(
    () => [props.modelValue, props.panelMode, props.noticeData?.id] as const,
    async ([drawerVisible, panelMode, noticeId], previousState) => {
      if (!drawerVisible) {
        return
      }

      const [previousVisible, previousMode, previousNoticeId] = previousState ?? [
        false,
        panelMode,
        undefined
      ]
      const openedNow = !previousVisible
      const modeChanged = panelMode !== previousMode
      const editTargetChanged = panelMode === 'edit' && noticeId !== previousNoticeId

      if (!openedNow && !modeChanged && !editTargetChanged) {
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
    () => form.noticeScope,
    (value) => {
      if (value !== NOTICE_SCOPE_ROLE && form.targetRoleIds.length > 0) {
        form.targetRoleIds = []
      }

      if (value !== NOTICE_SCOPE_USER && form.targetUserIds.length > 0) {
        form.targetUserIds = []
      }

      formRef.value?.clearValidate(['targetRoleIds', 'targetUserIds'])
    }
  )

  const handleClose = () => {
    visible.value = false
    resetForm()
  }

  const buildCreatePayload = (): Api.Notice.CreateNoticeParams => ({
    noticeTitle: form.noticeTitle.trim(),
    noticeContent: form.noticeContent,
    noticeLevel: form.noticeLevel,
    noticeScope: form.noticeScope,
    targetRoleIds:
      form.noticeScope === NOTICE_SCOPE_ROLE && form.targetRoleIds.length > 0
        ? form.targetRoleIds
        : undefined,
    targetUserIds:
      form.noticeScope === NOTICE_SCOPE_USER && form.targetUserIds.length > 0
        ? form.targetUserIds
        : undefined,
    pinned: form.pinned,
    enabled: form.enabled,
    sort: form.sort,
    expireTime: normalizeDateTimeValue(form.expireTime) || undefined,
    remark: form.remark || undefined
  })

  const buildUpdatePayload = (): Api.Notice.UpdateNoticeParams => ({
    noticeTitle: form.noticeTitle.trim(),
    noticeContent: form.noticeContent,
    noticeLevel: form.noticeLevel,
    noticeScope: form.noticeScope,
    targetRoleIds:
      form.noticeScope === NOTICE_SCOPE_ROLE && form.targetRoleIds.length > 0
        ? form.targetRoleIds
        : undefined,
    targetUserIds:
      form.noticeScope === NOTICE_SCOPE_USER && form.targetUserIds.length > 0
        ? form.targetUserIds
        : undefined,
    pinned: form.pinned,
    enabled: form.enabled,
    sort: form.sort,
    expireTime: normalizeDateTimeValue(form.expireTime),
    remark: form.remark || undefined
  })

  const handleSubmit = async () => {
    if (!formRef.value) {
      return
    }

    const isValid = await formRef.value.validate().then(
      () => true,
      () => false
    )
    if (!isValid) {
      return
    }

    submitLoading.value = true
    try {
      if (props.panelMode === 'add') {
        await fetchCreateNotice(buildCreatePayload())
      } else if (props.noticeData) {
        await fetchUpdateNotice(props.noticeData.id, buildUpdatePayload())
      }

      ElMessage.success(props.panelMode === 'add' ? '新增成功' : '更新成功')
      emit('success')
      handleClose()
    } finally {
      submitLoading.value = false
    }
  }
</script>
