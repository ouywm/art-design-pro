<!-- 大文件分片上传组件 -->
<!-- 支持 MD5 秒传、分片并发上传、暂停/恢复/取消、断点续传 -->
<template>
  <div class="art-chunked-upload">
    <!-- 文件选择区域 -->
    <div class="art-chunked-upload__select">
      <ElUpload
        ref="uploadRef"
        v-bind="{
          ...$attrs,
          ...props,
          autoUpload: false,
          showFileList: false,
          limit: 1,
          accept: accept || undefined,
          disabled: disabled || !canStart,
          onChange: handleFileChange,
          onExceed: handleExceed
        }"
      >
        <template v-if="drag">
          <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
          <div class="el-upload__text">
            <template v-if="selectedFile">
              {{ selectedFile.name }}（{{ formatFileSize(selectedFile.size) }}）
            </template>
            <template v-else> 将文件拖到此处，或<em>点击选择</em> </template>
          </div>
        </template>
        <template v-else>
          <slot name="trigger">
            <ElButton :disabled="disabled || !canStart" v-ripple>
              <template v-if="selectedFile">
                {{ selectedFile.name }}（{{ formatFileSize(selectedFile.size) }}）
              </template>
              <template v-else> 选择文件 </template>
            </ElButton>
          </slot>
        </template>

        <template #tip>
          <slot name="tip">
            <div v-if="tipText" class="el-upload__tip">{{ tipText }}</div>
          </slot>
        </template>
      </ElUpload>
    </div>

    <!-- 控制按钮 -->
    <UploadControls
      v-if="selectedFile"
      :can-start="canStart && !!selectedFile && !disabled"
      :can-pause="canPause"
      :can-resume="canResume"
      :can-cancel="canCancel"
      @start="handleStart"
      @pause="pause"
      @resume="handleResume"
      @cancel="handleCancel"
    />

    <!-- 进度显示（非空闲或已完成时显示） -->
    <UploadProgress
      v-if="!isIdle || isCompleted"
      :status="status"
      :md5-percent="md5Percent"
      :percent="percent"
      :speed="speed"
      :completed-parts="completedParts"
      :total-parts="totalParts"
      :fast-uploaded="isFastUploaded"
      :show-speed="showSpeed"
      :show-md5-progress="showMd5Progress"
      :md5-duration="md5Duration"
      :upload-duration="uploadDuration"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import type { UploadFile, UploadInstance, UploadRawFile } from 'element-plus'
  import { useUpload } from '@/hooks/core/useUpload'
  import { formatFileSize } from '@/utils/format'
  import UploadControls from './widget/UploadControls.vue'
  import UploadProgress from './widget/UploadProgress.vue'

  defineOptions({ name: 'ArtChunkedUpload' })

  // ==================== Props ====================
  interface ArtChunkedUploadProps {
    /** 接受的文件类型，如 '.zip,.tar.gz' */
    accept?: string
    /** 文件最大大小（字节），0 表示不限 */
    maxSize?: number
    /** 并发上传数 */
    concurrency?: number
    /** 最大重试次数 */
    maxRetries?: number
    /** 重试基础延迟（ms） */
    retryDelay?: number
    /** 禁用状态 */
    disabled?: boolean
    /** 是否启用拖拽选择 */
    drag?: boolean
    /** 提示文字（为空则自动生成） */
    tip?: string
    /** 是否显示上传速度 */
    showSpeed?: boolean
    /** 是否显示 MD5 计算进度 */
    showMd5Progress?: boolean
  }

  const props = withDefaults(defineProps<ArtChunkedUploadProps>(), {
    accept: '',
    maxSize: 0,
    concurrency: 3,
    maxRetries: 3,
    retryDelay: 1000,
    disabled: false,
    drag: false,
    tip: '',
    showSpeed: true,
    showMd5Progress: true
  })

  // ==================== Emits ====================
  interface ArtChunkedUploadEmits {
    /** 上传成功 */
    'upload-success': [file: Api.FileUpload.FileUploadVo]
    /** 上传失败 */
    'upload-error': [error: Error]
    /** 状态变更 */
    'status-change': [status: Api.FileUpload.UploadStatus]
  }

  const emit = defineEmits<ArtChunkedUploadEmits>()

  // ==================== Model ====================
  /** 上传结果（双向绑定） */
  const modelValue = defineModel<Api.FileUpload.FileUploadVo | null>({ default: null })

  // ==================== State ====================
  const uploadRef = ref<UploadInstance>()
  const selectedFile = ref<File | null>(null)

  const {
    status,
    result,
    error,
    isIdle,
    isCompleted,
    isError,
    isFastUploaded,
    speed,
    percent,
    md5Percent,
    completedParts,
    totalParts,
    md5Duration,
    uploadDuration,
    canStart,
    canPause,
    canResume,
    canCancel,
    start,
    pause,
    resume,
    cancel,
    reset
  } = useUpload({
    concurrency: props.concurrency,
    maxRetries: props.maxRetries,
    retryDelay: props.retryDelay
  })

  // ==================== 计算属性 ====================
  const tipText = computed(() => {
    if (props.tip) return props.tip
    const parts: string[] = []
    if (props.accept) parts.push(`支持 ${props.accept} 格式`)
    if (props.maxSize) parts.push(`文件不超过 ${formatFileSize(props.maxSize)}`)
    parts.push('支持断点续传')
    return parts.join('，')
  })

  // ==================== 事件处理 ====================

  /** 校验并设置文件 */
  function setFile(file: File) {
    if (props.maxSize && file.size > props.maxSize) {
      ElMessage.warning(`文件大小超出限制（最大 ${formatFileSize(props.maxSize)}）`)
      selectedFile.value = null
      return
    }
    // 重置上一次上传状态
    if (isCompleted.value || isError.value) {
      reset()
      modelValue.value = null
    }
    selectedFile.value = file
  }

  /** 首次选择文件（limit 未满时触发） */
  function handleFileChange(uploadFile: UploadFile) {
    if (!uploadFile.raw) return
    setFile(uploadFile.raw)
  }

  /** 已有文件时再次选择（limit 已满时触发），替换旧文件 */
  function handleExceed(files: File[]) {
    uploadRef.value?.clearFiles()
    const rawFile = files[0] as UploadRawFile
    setFile(rawFile)
  }

  async function handleStart() {
    if (!selectedFile.value) {
      ElMessage.warning('请先选择文件')
      return
    }
    await start(selectedFile.value)
  }

  async function handleResume() {
    await resume()
  }

  async function handleCancel() {
    await cancel()
    selectedFile.value = null
  }

  // ==================== 状态监听 ====================
  watch(result, (val) => {
    if (val) {
      modelValue.value = val
      emit('upload-success', val)
    }
  })

  watch(error, (val) => {
    if (val) {
      emit('upload-error', val)
    }
  })

  watch(status, (val) => {
    emit('status-change', val)
  })

  // ==================== Expose ====================
  defineExpose({
    /** 开始上传 */
    start: handleStart,
    /** 暂停上传 */
    pause,
    /** 恢复上传 */
    resume: handleResume,
    /** 取消上传 */
    cancel: handleCancel,
    /** 当前上传状态 */
    status
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
