/**
 * useUpload - 大文件分片上传状态管理
 *
 * 封装 UploadEngine，提供响应式状态和方法。
 * 支持 MD5 计算、分片上传、暂停/恢复/取消、秒传检测。
 *
 * @module useUpload
 */

import { ref, computed, onBeforeUnmount } from 'vue'
import { UploadEngine } from '@/utils/upload'

const DEFAULT_PROGRESS: Api.FileUpload.UploadProgress = {
  percent: 0,
  loaded: 0,
  total: 0,
  speed: 0,
  md5Percent: 0,
  completedParts: 0,
  totalParts: 0,
  fastUploaded: false,
  md5Duration: 0,
  uploadDuration: 0
}

export function useUpload(config?: Api.FileUpload.UploadEngineConfig) {
  // ==================== 响应式状态 ====================
  const status = ref<Api.FileUpload.UploadStatus>('idle')
  const progress = ref<Api.FileUpload.UploadProgress>({ ...DEFAULT_PROGRESS })
  const result = ref<Api.FileUpload.FileUploadVo | null>(null)
  const error = ref<Error | null>(null)

  let engine: UploadEngine | null = null

  // ==================== 状态计算属性 ====================
  const isIdle = computed(() => status.value === 'idle')
  const isComputingMd5 = computed(() => status.value === 'computing_md5')
  const isUploading = computed(() => status.value === 'uploading')
  const isPaused = computed(() => status.value === 'paused')
  const isCompleted = computed(() => status.value === 'completed')
  const isError = computed(() => status.value === 'error')
  const isFastUploaded = computed(() => progress.value.fastUploaded)

  // ==================== 进度计算属性 ====================
  const speed = computed(() => progress.value.speed)
  const percent = computed(() => progress.value.percent)
  const md5Percent = computed(() => progress.value.md5Percent)
  const completedParts = computed(() => progress.value.completedParts)
  const totalParts = computed(() => progress.value.totalParts)
  const md5Duration = computed(() => progress.value.md5Duration)
  const uploadDuration = computed(() => progress.value.uploadDuration)

  // ==================== 控制标志 ====================
  const canStart = computed(() => isIdle.value || isError.value || isCompleted.value)
  const canPause = computed(() => isUploading.value || isComputingMd5.value)
  const canResume = computed(() => isPaused.value || isError.value)
  const canCancel = computed(() => !isIdle.value && !isCompleted.value)

  // ==================== 内部方法 ====================
  function createEngine() {
    engine = new UploadEngine(config, {
      onProgress(p) {
        progress.value = p
      },
      onStatusChange(s) {
        status.value = s
      },
      onComplete(file) {
        result.value = file
        progress.value = { ...progress.value, percent: 100 }
      },
      onError(err) {
        error.value = err
      }
    })
    return engine
  }

  // ==================== 公开方法 ====================

  /** 开始上传 */
  async function start(file: File) {
    error.value = null
    result.value = null
    progress.value = { ...DEFAULT_PROGRESS }
    const eng = createEngine()
    await eng.start(file)
  }

  /** 暂停上传 */
  function pause() {
    engine?.pause()
  }

  /** 恢复上传 */
  async function resume() {
    await engine?.resume()
  }

  /** 取消上传 */
  async function cancel() {
    await engine?.cancel()
    progress.value = { ...DEFAULT_PROGRESS }
    engine = null
  }

  /** 重置状态 */
  function reset() {
    cancel()
    result.value = null
    error.value = null
  }

  // 组件卸载时取消上传
  onBeforeUnmount(() => {
    engine?.cancel()
  })

  return {
    // 状态
    status,
    progress,
    result,
    error,
    // 状态计算属性
    isIdle,
    isComputingMd5,
    isUploading,
    isPaused,
    isCompleted,
    isError,
    isFastUploaded,
    // 进度计算属性
    speed,
    percent,
    md5Percent,
    completedParts,
    totalParts,
    md5Duration,
    uploadDuration,
    // 控制标志
    canStart,
    canPause,
    canResume,
    canCancel,
    // 方法
    start,
    pause,
    resume,
    cancel,
    reset
  }
}
