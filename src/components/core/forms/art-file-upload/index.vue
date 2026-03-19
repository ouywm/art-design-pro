<!-- 通用文件上传组件 -->
<!-- 支持单文件/多文件上传、拖拽上传、文件类型/大小校验、自动/手动上传 -->
<template>
  <div class="art-file-upload">
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

    <div v-if="!autoUpload && hasPendingFiles" class="art-file-upload__actions">
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

  defineOptions({ name: 'ArtFileUpload' })

  // ==================== Props ====================
  interface ArtFileUploadProps {
    /** 是否支持多选 */
    multiple?: boolean
    /** 接受的文件类型，如 '.jpg,.png,.pdf' */
    accept?: string
    /** 单个文件最大大小（字节），0 表示不限 */
    maxSize?: number
    /** 最大文件数量，0 表示不限 */
    maxCount?: number
    /** 是否启用拖拽上传 */
    drag?: boolean
    /** 选择文件后自动上传 */
    autoUpload?: boolean
    /** 禁用状态 */
    disabled?: boolean
    /** 文件列表展示类型 */
    listType?: 'text' | 'picture' | 'picture-card'
    /** 是否显示文件列表 */
    showFileList?: boolean
    /** 按钮文字 */
    buttonText?: string
    /** 提示文字（为空则自动生成） */
    tip?: string
  }

  const props = withDefaults(defineProps<ArtFileUploadProps>(), {
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
    tip: ''
  })

  // ==================== Emits ====================
  interface ArtFileUploadEmits {
    /** 单个文件上传成功 */
    'upload-success': [file: Api.FileUpload.FileUploadVo, rawFile: File]
    /** 单个文件上传失败 */
    'upload-error': [error: Error, rawFile: File]
    /** 文件超出数量限制 */
    exceed: [files: File[], limit: number]
  }

  const emit = defineEmits<ArtFileUploadEmits>()

  // ==================== Model ====================
  /** 已上传成功的文件列表（双向绑定） */
  const modelValue = defineModel<Api.FileUpload.FileUploadVo[]>({ default: () => [] })

  // ==================== State ====================
  const uploadRef = ref<UploadInstance>()
  const fileList = ref<UploadFile[]>([])
  const previewVisible = ref(false)
  const previewIndex = ref(0)

  const hasPendingFiles = computed(() => fileList.value.some((f) => f.status === 'ready'))

  const tipText = computed(() => {
    if (props.tip) return props.tip
    const parts: string[] = []
    if (props.accept) parts.push(`支持 ${props.accept} 格式`)
    if (props.maxSize) parts.push(`单个文件不超过 ${formatFileSize(props.maxSize)}`)
    if (props.maxCount) parts.push(`最多 ${props.maxCount} 个文件`)
    return parts.join('，')
  })

  // ==================== 事件处理 ====================

  /** 可预览的图片 URL 列表 */
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
      fileList.value = files.map(createUploadFile)
    },
    { immediate: true, deep: true }
  )

  function handlePreview(uploadFile: UploadFile) {
    const idx = fileList.value.findIndex((f) => f.uid === uploadFile.uid)
    previewIndex.value = Math.max(idx, 0)
    previewVisible.value = true
  }

  function handleBeforeUpload(rawFile: UploadRawFile): boolean {
    if (props.maxSize && rawFile.size > props.maxSize) {
      ElMessage.warning(
        `文件 "${rawFile.name}" 超出大小限制（最大 ${formatFileSize(props.maxSize)}）`
      )
      return false
    }
    return true
  }

  async function handleUpload(options: UploadRequestOptions) {
    return await fetchUploadFile(options.file)
  }

  function handleSuccess(response: any, uploadFile: UploadFile) {
    const result = response as Api.FileUpload.FileUploadVo
    modelValue.value = props.maxCount === 1 ? [result] : [...modelValue.value, result]
    emit('upload-success', result, uploadFile.raw!)
  }

  function handleError(err: Error, uploadFile: UploadFile) {
    emit('upload-error', err, uploadFile.raw!)
  }

  function handleExceed(files: File[]) {
    // 单文件模式：自动替换旧文件
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
  }

  // ==================== 公开方法 ====================

  /** 手动触发上传（autoUpload=false 时使用） */
  function submit() {
    uploadRef.value?.submit()
  }

  /** 清空文件列表 */
  function clear() {
    uploadRef.value?.clearFiles()
    fileList.value = []
    modelValue.value = []
  }

  /** 中止上传 */
  function abort(file?: UploadFile) {
    if (file) {
      uploadRef.value?.abort(file)
    }
  }

  defineExpose({
    /** 手动触发上传 */
    submit,
    /** 清空文件列表 */
    clear,
    /** 中止上传 */
    abort,
    /** ElUpload 实例引用 */
    uploadRef
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
