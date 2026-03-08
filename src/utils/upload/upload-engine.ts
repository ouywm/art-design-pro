import { DEFAULT_CONCURRENCY, DEFAULT_MAX_RETRIES, DEFAULT_RETRY_DELAY } from './constants'
import { computeFileMd5 } from './md5'
import {
  fetchMultipartInit,
  fetchMultipartParts,
  fetchMultipartComplete,
  fetchMultipartAbort,
  fetchPutChunkToPresignedUrl
} from '@/api/file-upload'

type UploadStatus = Api.FileUpload.UploadStatus
type UploadProgress = Api.FileUpload.UploadProgress
type UploadEngineCallbacks = Api.FileUpload.UploadEngineCallbacks

/** 运行时状态检查（绕过 TS 控制流过度收窄） */
function statusIs(current: UploadStatus, expected: UploadStatus): boolean {
  return current === expected
}

function statusIsNot(current: UploadStatus, expected: UploadStatus): boolean {
  return current !== expected
}

interface PartUploadState {
  partNumber: number
  uploadUrl: string
  start: number
  end: number
  size: number
}

interface ActiveUpload {
  abort: () => void
  partNumber: number
  loaded: number
}

export class UploadEngine {
  private config: Required<Api.FileUpload.UploadEngineConfig>
  private callbacks: UploadEngineCallbacks

  // 状态
  private status: UploadStatus = 'idle'
  private file: File | null = null
  private md5: string = ''

  // 分片上传元数据（来自后端）
  private uploadId: string = ''
  private filePath: string = ''
  private chunkSize: number = 0
  private totalParts: number = 0

  // 并发控制
  private pendingParts: PartUploadState[] = []
  private completedParts: { partNumber: number; eTag: string }[] = []
  private activeUploads: Map<number, ActiveUpload> = new Map()
  private completedBytes: number = 0

  // MD5 取消句柄
  private cancelMd5: (() => void) | null = null

  // 秒传标志
  private fastUploaded: boolean = false

  // 速度计算
  private speedStartTime: number = 0
  private speedStartBytes: number = 0

  // 耗时追踪
  private md5StartTime: number = 0
  private md5Duration: number = 0
  private uploadStartTime: number = 0
  private uploadDuration: number = 0

  constructor(config?: Api.FileUpload.UploadEngineConfig, callbacks?: UploadEngineCallbacks) {
    this.config = {
      concurrency: config?.concurrency ?? DEFAULT_CONCURRENCY,
      maxRetries: config?.maxRetries ?? DEFAULT_MAX_RETRIES,
      retryDelay: config?.retryDelay ?? DEFAULT_RETRY_DELAY
    }
    this.callbacks = callbacks ?? {}
  }

  /** 获取当前状态 */
  getStatus(): UploadStatus {
    return this.status
  }

  /** 获取当前进度 */
  getProgress(): UploadProgress {
    return this.buildProgress()
  }

  /** 开始上传 */
  async start(file: File): Promise<void> {
    if (this.status !== 'idle' && this.status !== 'error') {
      throw new Error(`Cannot start upload in status: ${this.status}`)
    }

    this.reset()
    this.file = file
    this.setStatus('computing_md5')

    try {
      // Step 1: 计算 MD5
      this.md5StartTime = Date.now()
      const { promise, cancel } = computeFileMd5(file, {
        onProgress: (percent) => {
          this.emitProgress({ md5Percent: percent })
        }
      })
      this.cancelMd5 = cancel
      this.md5 = await promise
      this.cancelMd5 = null
      this.md5Duration = Date.now() - this.md5StartTime

      if (statusIsNot(this.status, 'computing_md5')) return // 被取消了

      // Step 2: 初始化分片上传（后端决定 chunkSize）
      this.setStatus('uploading')
      this.uploadStartTime = Date.now()
      const initResult = await fetchMultipartInit({
        fileName: file.name,
        fileSize: file.size,
        fileMd5: this.md5
      })

      // 秒传命中
      if (initResult.fastUploaded && initResult.file) {
        this.completedBytes = file.size
        this.fastUploaded = true
        this.uploadDuration = Date.now() - this.uploadStartTime
        this.emitProgress({ md5Percent: 100, percent: 100, fastUploaded: true })
        this.setStatus('completed')
        this.callbacks.onComplete?.(initResult.file)
        return
      }

      // 保存元数据
      this.uploadId = initResult.uploadId!
      this.filePath = initResult.filePath!
      this.chunkSize = initResult.chunkSize!
      this.totalParts = initResult.totalParts!

      // 构建待上传分片队列
      this.pendingParts = initResult.partUrls!.map((p) => {
        const start = (p.partNumber - 1) * this.chunkSize
        const end = Math.min(start + this.chunkSize, file.size)
        return {
          partNumber: p.partNumber,
          uploadUrl: p.uploadUrl,
          start,
          end,
          size: end - start
        }
      })

      // Step 3: 并发上传分片
      this.speedStartTime = Date.now()
      this.speedStartBytes = 0
      await this.uploadAllParts()

      if (statusIsNot(this.status, 'uploading')) return // 被暂停或取消了

      // Step 4: 合并分片
      await this.completeMerge()
    } catch (err: any) {
      if (statusIs(this.status, 'paused') || statusIs(this.status, 'idle')) return
      this.setStatus('error')
      this.callbacks.onError?.(err)
    }
  }

  /** 暂停上传 */
  pause(): void {
    if (statusIs(this.status, 'computing_md5')) {
      this.cancelMd5?.()
      this.cancelMd5 = null
      this.setStatus('paused')
      return
    }

    if (this.status !== 'uploading') return

    // 中止所有活跃请求
    for (const active of this.activeUploads.values()) {
      active.abort()
    }
    // 将活跃的分片放回待上传队列
    for (const [, active] of this.activeUploads) {
      const part = this.buildPartState(active.partNumber)
      if (part) {
        this.pendingParts.unshift(part)
      }
    }
    this.activeUploads.clear()
    this.setStatus('paused')
  }

  /** 恢复上传 */
  async resume(): Promise<void> {
    if (this.status !== 'paused' && this.status !== 'error') return
    if (!this.file) return

    // 如果 MD5 还没算完，重新开始
    if (!this.md5) {
      this.setStatus('idle')
      return this.start(this.file)
    }

    this.setStatus('uploading')

    try {
      // 查询后端已上传的分片
      const partsResult = await fetchMultipartParts({
        uploadId: this.uploadId,
        filePath: this.filePath,
        fileSize: this.file.size
      })

      // 更新已完成分片
      this.completedParts = partsResult.uploadedParts.map((p) => ({
        partNumber: p.partNumber,
        eTag: p.eTag
      }))
      this.completedBytes = partsResult.uploadedParts.reduce((sum, p) => sum + p.size, 0)

      // 更新待上传分片（使用后端返回的 chunkSize 计算分片边界）
      this.pendingParts = partsResult.pendingPartUrls.map((p) => {
        const start = (p.partNumber - 1) * this.chunkSize
        const end = Math.min(start + this.chunkSize, this.file!.size)
        return {
          partNumber: p.partNumber,
          uploadUrl: p.uploadUrl,
          start,
          end,
          size: end - start
        }
      })

      if (this.pendingParts.length === 0) {
        await this.completeMerge()
        return
      }

      this.speedStartTime = Date.now()
      this.speedStartBytes = this.completedBytes
      await this.uploadAllParts()

      if (statusIsNot(this.status, 'uploading')) return
      await this.completeMerge()
    } catch (err: any) {
      if (statusIs(this.status, 'paused') || statusIs(this.status, 'idle')) return
      this.setStatus('error')
      this.callbacks.onError?.(err)
    }
  }

  /** 取消上传 */
  async cancel(): Promise<void> {
    // 取消 MD5 计算
    this.cancelMd5?.()
    this.cancelMd5 = null

    // 中止所有活跃请求
    for (const active of this.activeUploads.values()) {
      active.abort()
    }
    this.activeUploads.clear()

    // 通知后端取消（仅在上传进行中时，已完成/空闲状态无需 abort）
    if (this.uploadId && this.status !== 'completed' && this.status !== 'idle') {
      try {
        await fetchMultipartAbort({
          uploadId: this.uploadId,
          filePath: this.filePath
        })
      } catch {
        // 忽略取消失败
      }
    }

    this.reset()
    this.setStatus('idle')
  }

  // ==================== 内部方法 ====================

  /** 并发上传所有分片 */
  private async uploadAllParts(): Promise<void> {
    return new Promise((resolve, reject) => {
      let settled = false

      const settle = (err?: Error) => {
        if (settled) return
        settled = true
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }

      const tryStartNext = () => {
        // 检查是否被暂停或取消
        if (this.status !== 'uploading') {
          if (this.activeUploads.size === 0) settle()
          return
        }

        // 所有分片完成
        if (this.pendingParts.length === 0 && this.activeUploads.size === 0) {
          settle()
          return
        }

        // 启动新的工作协程
        while (
          this.activeUploads.size < this.config.concurrency &&
          this.pendingParts.length > 0 &&
          this.status === 'uploading'
        ) {
          const part = this.pendingParts.shift()!
          this.uploadSinglePart(part)
            .then(() => {
              tryStartNext()
            })
            .catch((err) => {
              if (this.status === 'uploading') {
                settle(err)
              } else {
                tryStartNext()
              }
            })
        }
      }

      tryStartNext()
    })
  }

  /** 上传单个分片（含重试） */
  private async uploadSinglePart(part: PartUploadState): Promise<void> {
    const maxRetries = this.config.maxRetries
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (this.status !== 'uploading') return

      try {
        const chunk = this.file!.slice(part.start, part.end)
        const contentType = this.file!.type || 'application/octet-stream'

        const { promise, abort } = fetchPutChunkToPresignedUrl(
          part.uploadUrl,
          chunk,
          contentType,
          (loaded) => {
            const active = this.activeUploads.get(part.partNumber)
            if (active) {
              active.loaded = loaded
              this.emitProgress()
            }
          }
        )

        this.activeUploads.set(part.partNumber, {
          abort,
          partNumber: part.partNumber,
          loaded: 0
        })

        const eTag = await promise

        // 上传成功
        this.activeUploads.delete(part.partNumber)
        this.completedParts.push({ partNumber: part.partNumber, eTag })
        this.completedBytes += part.size
        this.emitProgress()
        return
      } catch (err: any) {
        this.activeUploads.delete(part.partNumber)
        lastError = err

        if (this.status !== 'uploading') return

        // 最后一次重试也失败了
        if (attempt >= maxRetries) break

        // 指数退避 + 随机抖动
        const delay = this.config.retryDelay * Math.pow(2, attempt) + Math.random() * 500
        await this.sleep(delay)
      }
    }

    throw lastError || new Error(`Part ${part.partNumber} upload failed`)
  }

  /** 合并分片（后端自行查询 RustFS 获取 parts 列表） */
  private async completeMerge(): Promise<void> {
    if (!this.file) return

    const result = await fetchMultipartComplete({
      uploadId: this.uploadId,
      filePath: this.filePath,
      originalName: this.file.name,
      fileSize: this.file.size,
      fileMd5: this.md5
    })

    this.uploadDuration = Date.now() - this.uploadStartTime
    this.setStatus('completed')
    this.callbacks.onComplete?.(result)
  }

  /** 根据分片号构建分片边界（暂停时用） */
  private buildPartState(partNumber: number): PartUploadState {
    const start = (partNumber - 1) * this.chunkSize
    const end = Math.min(start + this.chunkSize, this.file!.size)
    return { partNumber, uploadUrl: '', start, end, size: end - start }
  }

  private buildProgress(overrides?: Partial<UploadProgress>): UploadProgress {
    const total = this.file?.size ?? 0

    // 活跃分片已传输字节
    let activeLoaded = 0
    for (const active of this.activeUploads.values()) {
      activeLoaded += active.loaded
    }

    const loaded = this.completedBytes + activeLoaded
    const percent = total > 0 ? Math.round((loaded / total) * 100) : 0

    // 速度计算
    const elapsed = (Date.now() - this.speedStartTime) / 1000
    const speed = elapsed > 0 ? Math.round((loaded - this.speedStartBytes) / elapsed) : 0

    return {
      percent,
      loaded,
      total,
      speed,
      md5Percent: 0,
      completedParts: this.completedParts.length,
      totalParts: this.totalParts,
      fastUploaded: this.fastUploaded,
      md5Duration: this.md5Duration,
      uploadDuration:
        this.uploadDuration || (this.uploadStartTime > 0 ? Date.now() - this.uploadStartTime : 0),
      ...overrides
    }
  }

  private emitProgress(overrides?: Partial<UploadProgress>): void {
    this.callbacks.onProgress?.(this.buildProgress(overrides))
  }

  private setStatus(status: UploadStatus): void {
    this.status = status
    this.callbacks.onStatusChange?.(status)
  }

  private reset(): void {
    this.file = null
    this.md5 = ''
    this.uploadId = ''
    this.filePath = ''
    this.chunkSize = 0
    this.totalParts = 0
    this.pendingParts = []
    this.completedParts = []
    this.activeUploads.clear()
    this.completedBytes = 0
    this.cancelMd5 = null
    this.fastUploaded = false
    this.speedStartTime = 0
    this.speedStartBytes = 0
    this.md5StartTime = 0
    this.md5Duration = 0
    this.uploadStartTime = 0
    this.uploadDuration = 0
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
