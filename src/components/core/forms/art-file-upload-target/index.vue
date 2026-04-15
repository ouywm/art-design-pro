<!-- 目录文件上传组件（支持通过 query 传 folderId/preservePath） -->
<template>
  <div class="art-file-upload-target">
    <ElUpload
      ref="uploadRef"
      v-model:file-list="fileList"
      v-bind="{
        ...$attrs,
        ...props,
        action: '#',
        httpRequest: handleUpload,
        accept: accept || undefined,
        limit: maxCount || undefined,
        beforeUpload: handleBeforeUpload,
        onSuccess: handleSuccess,
        onError: handleError,
        onExceed: handleExceed,
        onRemove: handleRemove,
        onPreview: handlePreview
      }"
    >
      <template v-if="drag">
        <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </template>
      <template v-else>
        <slot>
          <ElButton type="primary" :disabled="disabled" v-ripple>{{ buttonText }}</ElButton>
        </slot>
      </template>

      <template #tip>
        <slot name="tip">
          <div v-if="tipText" class="el-upload__tip">{{ tipText }}</div>
        </slot>
      </template>
    </ElUpload>

    <div v-if="!autoUpload && hasPendingFiles" class="art-file-upload-target__actions">
      <ElButton type="primary" @click="submit" v-ripple>开始上传</ElButton>
      <ElButton @click="clear" v-ripple>清空</ElButton>
    </div>

    <!-- 图片预览 -->
    <ElImageViewer
      v-if="previewVisible"
      :url-list="previewUrls"
      :initial-index="previewIndex"
      teleported
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import type {
    UploadFile,
    UploadInstance,
    UploadRawFile,
    UploadRequestOptions
  } from 'element-plus'
  import { fetchUploadFile } from '@/api/file-upload'
  import { formatFileSize } from '@/utils/format'

  defineOptions({ name: 'ArtFileUploadTarget' })

  interface ArtFileUploadTargetProps {
    multiple?: boolean
    accept?: string
    maxSize?: number
    maxCount?: number
    drag?: boolean
    autoUpload?: boolean
    disabled?: boolean
    listType?: 'text' | 'picture' | 'picture-card'
    showFileList?: boolean
    buttonText?: string
    tip?: string
    /** multipart 上传 query 参数（如 folderId / preservePath） */
    uploadQuery?: Api.FileUpload.FileUploadQueryDto
  }

  const props = withDefaults(defineProps<ArtFileUploadTargetProps>(), {
    multiple: false,
    accept: '',
    maxSize: 0,
    maxCount: 0,
    drag: false,
    autoUpload: true,
    disabled: false,
    listType: 'text',
    showFileList: true,
    buttonText: '选择文件',
    tip: '',
    uploadQuery: () => ({})
  })

  const emit = defineEmits<{
    (e: 'upload-success', file: Api.FileUpload.FileUploadVo, rawFile: File): void
    (e: 'upload-error', error: Error, rawFile: File): void
    (e: 'exceed', files: File[], limit: number): void
    (e: 'all-done'): void
  }>()

  const modelValue = defineModel<Api.FileUpload.FileUploadVo[]>({ default: () => [] })

  const uploadRef = ref<UploadInstance>()
  const fileList = ref<UploadFile[]>([])
  const previewVisible = ref(false)
  const previewIndex = ref(0)
  let doneEmitted = false

  const hasPendingFiles = computed(() => fileList.value.some((f) => f.status === 'ready'))
  const isBusy = computed(() =>
    fileList.value.some((f) => f.status === 'ready' || f.status === 'uploading')
  )

  const tipText = computed(() => {
    if (props.tip) return props.tip
    const parts: string[] = []
    if (props.accept) parts.push(`支持 ${props.accept} 格式`)
    if (props.maxSize) parts.push(`单个文件不超过 ${formatFileSize(props.maxSize)}`)
    if (props.maxCount) parts.push(`最多 ${props.maxCount} 个文件`)
    return parts.join('，')
  })

  const previewUrls = computed(() =>
    fileList.value.filter((f) => f.url || f.raw).map((f) => f.url || URL.createObjectURL(f.raw!))
  )

  const createUploadFile = (file: Api.FileUpload.FileUploadVo): UploadFile => ({
    name: file.originalName,
    url: file.url,
    status: 'success',
    uid: file.fileId,
    response: file
  })

  watch(
    modelValue,
    (files) => {
      if (isBusy.value) return
      fileList.value = files.map(createUploadFile)
    },
    { immediate: true, deep: true }
  )

  watch(isBusy, (busy) => {
    if (busy) return
    fileList.value = modelValue.value.map(createUploadFile)
  })

  function handlePreview(uploadFile: UploadFile) {
    const idx = fileList.value.findIndex((f) => f.uid === uploadFile.uid)
    previewIndex.value = Math.max(idx, 0)
    previewVisible.value = true
  }

  function handleBeforeUpload(rawFile: UploadRawFile): boolean {
    doneEmitted = false
    if (props.maxSize && rawFile.size > props.maxSize) {
      ElMessage.warning(
        `文件 "${rawFile.name}" 超出大小限制（最大 ${formatFileSize(props.maxSize)}）`
      )
      return false
    }
    return true
  }

  async function handleUpload(options: UploadRequestOptions) {
    return await fetchUploadFile(options.file, props.uploadQuery || {})
  }

  async function maybeEmitAllDone() {
    if (doneEmitted) return
    await nextTick()
    const pending = fileList.value.some((f) => f.status === 'ready' || f.status === 'uploading')
    if (!pending && fileList.value.length > 0) {
      doneEmitted = true
      emit('all-done')
    }
  }

  function handleSuccess(response: any, uploadFile: UploadFile) {
    const result = response as Api.FileUpload.FileUploadVo
    modelValue.value = props.maxCount === 1 ? [result] : [...modelValue.value, result]
    emit('upload-success', result, uploadFile.raw!)
    maybeEmitAllDone()
  }

  function handleError(err: Error, uploadFile: UploadFile) {
    emit('upload-error', err, uploadFile.raw!)
    maybeEmitAllDone()
  }

  function handleExceed(files: File[]) {
    if (props.maxCount === 1) {
      modelValue.value = []
      uploadRef.value?.clearFiles()
      const rawFile = files[0] as UploadRawFile
      rawFile.uid = Date.now()
      uploadRef.value?.handleStart(rawFile)
      if (props.autoUpload) {
        nextTick(() => {
          uploadRef.value?.submit()
        })
      }
      return
    }
    ElMessage.warning(`最多只能上传 ${props.maxCount} 个文件`)
    emit('exceed', files, props.maxCount)
  }

  function handleRemove(uploadFile: UploadFile) {
    const response = uploadFile.response as Api.FileUpload.FileUploadVo | undefined
    const fileId = response?.fileId ?? Number(uploadFile.uid)
    const fileUrl = response?.url ?? uploadFile.url

    modelValue.value = modelValue.value.filter((file) => {
      if (Number.isFinite(fileId) && file.fileId === fileId) {
        return false
      }
      if (fileUrl && file.url === fileUrl) {
        return false
      }
      return true
    })
    maybeEmitAllDone()
  }

  function submit() {
    uploadRef.value?.submit()
  }

  function clear() {
    doneEmitted = false
    uploadRef.value?.clearFiles()
    fileList.value = []
    modelValue.value = []
  }

  defineExpose({ submit, clear, uploadRef })
</script>

<style lang="scss" scoped>
  .art-file-upload-target {
    &__actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
  }
</style>
