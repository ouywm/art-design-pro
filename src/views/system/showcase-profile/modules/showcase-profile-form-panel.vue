<template>
  <ElDrawer
    v-model="visible"
    :title="panelMode === 'add' ? '新增展示档案' : '编辑展示档案'"
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
          <ElFormItem label="展示编码" prop="showcaseCode">
            <ElInput
              v-model="form.showcaseCode"
              v-bind="{
                placeholder: '请输入展示编码'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="标题" prop="title">
            <ElInput
              v-model="form.title"
              v-bind="{
                placeholder: '请输入标题'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="头像" prop="avatar">
            <div class="w-full flex flex-col gap-3">
              <ElImage
                v-if="form.avatar || defaultAvatar"
                class="size-20 rounded-md border border-[var(--el-border-color-light)]"
                :src="form.avatar || defaultAvatar"
                fit="cover"
                :preview-src-list="form.avatar ? [form.avatar] : undefined"
                preview-teleported
              />
              <div class="flex items-center gap-3">
                <ArtFileUpload
                  ref="avatarUploadRef"
                  v-model="avatarUploadFiles"
                  v-bind="{
                    accept: 'image/*',
                    maxCount: 1,
                    showFileList: false,
                    buttonText: '上传头像'
                  }"
                  @upload-success="handleAvatarUploadSuccess"
                />
                <ElButton v-if="form.avatar" type="danger" link @click="clearAvatarUpload">
                  清除头像
                </ElButton>
              </div>
            </div>
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="封面图片" prop="coverImage">
            <div class="w-full flex flex-col gap-3">
              <ElImage
                v-if="form.coverImage"
                class="size-20 rounded-md border border-[var(--el-border-color-light)]"
                :src="form.coverImage"
                fit="cover"
                :preview-src-list="form.coverImage ? [form.coverImage] : undefined"
                preview-teleported
              />
              <div class="flex items-center gap-3">
                <ArtFileUpload
                  ref="coverImageUploadRef"
                  v-model="coverImageUploadFiles"
                  v-bind="{
                    accept: 'image/*',
                    maxCount: 1,
                    showFileList: false,
                    buttonText: '上传图片'
                  }"
                  @upload-success="handleCoverImageUploadSuccess"
                />
                <ElButton v-if="form.coverImage" type="danger" link @click="clearCoverImageUpload">
                  清除封面图片
                </ElButton>
              </div>
            </div>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="联系人" prop="contactName">
            <ElInput
              v-model="form.contactName"
              v-bind="{
                placeholder: '请输入联系人'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="联系人性别" prop="contactGender">
            <ElSelect
              v-model="form.contactGender"
              v-bind="{
                placeholder: '请选择联系人性别',
                clearable: true
              }"
            >
              <ElOption
                v-for="item in getDict('showcase_gender').map((item) => ({
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
          <ElFormItem label="联系电话" prop="contactPhone">
            <ElInput
              v-model="form.contactPhone"
              v-bind="{
                placeholder: '请输入联系电话'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="联系邮箱" prop="contactEmail">
            <ElInput
              v-model="form.contactEmail"
              v-bind="{
                placeholder: '请输入联系邮箱'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="官网链接" prop="officialUrl">
            <ElInput
              v-model="form.officialUrl"
              v-bind="{
                placeholder: '请输入官网链接'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElSelect
              v-model="form.status"
              v-bind="{
                placeholder: '请选择状态',
                clearable: true
              }"
            >
              <ElOption
                v-for="item in getDict('showcase_status').map((item) => ({
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
          <ElFormItem label="推荐" prop="featured">
            <ElSwitch v-model="form.featured" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="优先级" prop="priority">
            <ElInputNumber
              v-model="form.priority"
              v-bind="{
                controls: false,
                style: { width: '100%' },
                placeholder: '请输入优先级'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="评分" prop="score">
            <ElInput
              v-model="form.score"
              v-bind="{
                placeholder: '请输入评分'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="发布日期" prop="publishDate">
            <ElDatePicker
              v-model="form.publishDate"
              v-bind="{
                type: 'date',
                valueFormat: 'YYYY-MM-DD',
                placeholder: '请选择发布日期',
                style: { width: '100%' }
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="上线时间" prop="launchAt">
            <ElDatePicker
              v-model="form.launchAt"
              v-bind="{
                type: 'datetime',
                valueFormat: 'YYYY-MM-DDTHH:mm:ss',
                placeholder: '请选择上线时间',
                style: { width: '100%' }
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="服务时间" prop="serviceTime">
            <ElTimePicker
              v-model="form.serviceTime"
              v-bind="{
                valueFormat: 'HH:mm:ss',
                placeholder: '请选择服务时间',
                style: { width: '100%' }
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="附件" prop="attachmentUrl">
            <div class="w-full flex flex-col gap-3">
              <ElLink
                v-if="form.attachmentUrl"
                :href="form.attachmentUrl"
                target="_blank"
                type="primary"
              >
                {{ form.attachmentUrl }}
              </ElLink>
              <div class="flex items-center gap-3">
                <ArtFileUpload
                  ref="attachmentUrlUploadRef"
                  v-model="attachmentUrlUploadFiles"
                  v-bind="{
                    maxCount: 1,
                    showFileList: false,
                    buttonText: '上传文件'
                  }"
                  @upload-success="handleAttachmentUrlUploadSuccess"
                />
                <ElButton
                  v-if="form.attachmentUrl"
                  type="danger"
                  link
                  @click="clearAttachmentUrlUpload"
                >
                  清除附件
                </ElButton>
              </div>
            </div>
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="描述" prop="description">
            <ElInput
              v-model="form.description"
              v-bind="{
                type: 'textarea',
                rows: 3,
                placeholder: '请输入描述'
              }"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="备注" prop="extraNotes">
            <ElInput
              v-model="form.extraNotes"
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
  import {
    fetchCreateShowcaseProfile,
    fetchGetShowcaseProfileDetail,
    fetchUpdateShowcaseProfile
  } from '@/api/showcase-profile'
  import type { ShowcaseProfileListItem, ShowcaseProfileListItemDetail, FormModel } from '../types'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { useDict } from '@/utils/dict'
  import ArtFileUpload from '@/components/core/forms/art-file-upload/index.vue'
  import defaultAvatar from '@imgs/user/avatar.webp'

  interface Props {
    modelValue: boolean
    panelMode: 'add' | 'edit'
    showcaseProfileData?: ShowcaseProfileListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  type PanelWatchState = [boolean, Props['panelMode'], ShowcaseProfileListItem['id'] | null]

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    panelMode: 'add',
    showcaseProfileData: undefined
  })

  const emit = defineEmits<Emits>()

  const { getDict } = useDict()
  const avatarUploadRef = ref()
  const avatarUploadFiles = ref<Api.FileUpload.FileUploadVo[]>([])
  const coverImageUploadRef = ref()
  const coverImageUploadFiles = ref<Api.FileUpload.FileUploadVo[]>([])
  const attachmentUrlUploadRef = ref()
  const attachmentUrlUploadFiles = ref<Api.FileUpload.FileUploadVo[]>([])
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const createDefaultForm = (): FormModel => ({
    showcaseCode: '',
    title: '',
    avatar: '',
    coverImage: '',
    contactName: '',
    contactGender: undefined,
    contactPhone: '',
    contactEmail: '',
    officialUrl: '',
    status: undefined,
    featured: false,
    priority: undefined,
    score: '',
    publishDate: undefined,
    launchAt: undefined,
    serviceTime: undefined,
    attachmentUrl: '',
    description: '',
    extraNotes: ''
  })

  const form = reactive<FormModel>(createDefaultForm())

  const rules = reactive<FormRules>({
    showcaseCode: [{ required: true, message: '请输入展示编码', trigger: 'blur' }],
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
  })

  const normalizeDateTimeValue = (value?: string | null) => {
    if (!value) return undefined
    return value.includes('T') ? value : value.replace(' ', 'T')
  }
  const resetUploadState = () => {
    avatarUploadFiles.value = []
    avatarUploadRef.value?.clear?.()
    coverImageUploadFiles.value = []
    coverImageUploadRef.value?.clear?.()
    attachmentUrlUploadFiles.value = []
    attachmentUrlUploadRef.value?.clear?.()
  }

  const handleAvatarUploadSuccess = (file: Api.FileUpload.FileUploadVo) => {
    form.avatar = file.url
    avatarUploadFiles.value = [file]
  }

  const clearAvatarUpload = () => {
    form.avatar = ''
    avatarUploadFiles.value = []
    avatarUploadRef.value?.clear?.()
  }
  const handleCoverImageUploadSuccess = (file: Api.FileUpload.FileUploadVo) => {
    form.coverImage = file.url
    coverImageUploadFiles.value = [file]
  }

  const clearCoverImageUpload = () => {
    form.coverImage = ''
    coverImageUploadFiles.value = []
    coverImageUploadRef.value?.clear?.()
  }
  const handleAttachmentUrlUploadSuccess = (file: Api.FileUpload.FileUploadVo) => {
    form.attachmentUrl = file.url
    attachmentUrlUploadFiles.value = [file]
  }

  const clearAttachmentUrlUpload = () => {
    form.attachmentUrl = ''
    attachmentUrlUploadFiles.value = []
    attachmentUrlUploadRef.value?.clear?.()
  }
  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    resetUploadState()
    formRef.value?.clearValidate()
  }

  const initForm = async () => {
    if (props.panelMode === 'edit' && props.showcaseProfileData) {
      resetUploadState()
      Object.assign(form, {
        showcaseCode: props.showcaseProfileData?.showcaseCode ?? '',
        title: props.showcaseProfileData?.title ?? '',
        avatar: props.showcaseProfileData?.avatar ?? '',
        coverImage: props.showcaseProfileData?.coverImage ?? '',
        contactName: props.showcaseProfileData?.contactName ?? '',
        contactGender: props.showcaseProfileData?.contactGender ?? undefined,
        contactPhone: props.showcaseProfileData?.contactPhone ?? '',
        contactEmail: props.showcaseProfileData?.contactEmail ?? '',
        officialUrl: props.showcaseProfileData?.officialUrl ?? '',
        status: props.showcaseProfileData?.status ?? undefined,
        featured: props.showcaseProfileData?.featured ?? false,
        priority: props.showcaseProfileData?.priority ?? undefined,
        score: props.showcaseProfileData?.score ?? '',
        publishDate: props.showcaseProfileData?.publishDate ?? undefined,
        launchAt: normalizeDateTimeValue(props.showcaseProfileData?.launchAt) ?? undefined,
        serviceTime: props.showcaseProfileData?.serviceTime ?? undefined,
        attachmentUrl: props.showcaseProfileData?.attachmentUrl ?? '',
        description: props.showcaseProfileData?.description ?? '',
        extraNotes: props.showcaseProfileData?.extraNotes ?? ''
      })
      const id = props.showcaseProfileData?.id
      if (id != null) {
        detailLoading.value = true
        try {
          const detail: ShowcaseProfileListItemDetail = await fetchGetShowcaseProfileDetail(id)
          Object.assign(form, {
            showcaseCode: detail.showcaseCode ?? form.showcaseCode,
            title: detail.title ?? form.title,
            avatar: detail.avatar ?? form.avatar,
            coverImage: detail.coverImage ?? form.coverImage,
            contactName: detail.contactName ?? form.contactName,
            contactGender: detail.contactGender ?? form.contactGender,
            contactPhone: detail.contactPhone ?? form.contactPhone,
            contactEmail: detail.contactEmail ?? form.contactEmail,
            officialUrl: detail.officialUrl ?? form.officialUrl,
            status: detail.status ?? form.status,
            featured: detail.featured ?? form.featured,
            priority: detail.priority ?? form.priority,
            score: detail.score ?? form.score,
            publishDate: detail.publishDate ?? form.publishDate,
            launchAt: normalizeDateTimeValue(detail.launchAt) ?? form.launchAt,
            serviceTime: detail.serviceTime ?? form.serviceTime,
            attachmentUrl: detail.attachmentUrl ?? form.attachmentUrl,
            description: detail.description ?? form.description,
            extraNotes: detail.extraNotes ?? form.extraNotes
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
    (): PanelWatchState => [
      props.modelValue,
      props.panelMode,
      props.showcaseProfileData?.id ?? null
    ],
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
        const payload: Api.ShowcaseProfile.CreateShowcaseProfileParams = {
          showcaseCode: form.showcaseCode,
          title: form.title,
          avatar: form.avatar,
          coverImage: form.coverImage,
          contactName: form.contactName,
          contactGender: form.contactGender,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail,
          officialUrl: form.officialUrl,
          status: form.status,
          featured: form.featured,
          priority: form.priority,
          score: form.score,
          publishDate: form.publishDate,
          launchAt: form.launchAt,
          serviceTime: form.serviceTime,
          attachmentUrl: form.attachmentUrl,
          description: form.description,
          extraNotes: form.extraNotes
        }
        await fetchCreateShowcaseProfile(payload)
      } else {
        const id = props.showcaseProfileData?.id
        if (id == null) return

        const payload: Api.ShowcaseProfile.UpdateShowcaseProfileParams = {
          showcaseCode: form.showcaseCode,
          title: form.title,
          avatar: form.avatar,
          coverImage: form.coverImage,
          contactName: form.contactName,
          contactGender: form.contactGender,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail,
          officialUrl: form.officialUrl,
          status: form.status,
          featured: form.featured,
          priority: form.priority,
          score: form.score,
          publishDate: form.publishDate,
          launchAt: form.launchAt,
          serviceTime: form.serviceTime,
          attachmentUrl: form.attachmentUrl,
          description: form.description,
          extraNotes: form.extraNotes
        }
        await fetchUpdateShowcaseProfile(id, payload)
      }

      ElMessage.success(props.panelMode === 'add' ? '新增成功' : '更新成功')
      emit('success')
      handleClose()
    } finally {
      submitLoading.value = false
    }
  }
</script>
