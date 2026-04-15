declare namespace Api {
  /** 文件上传类型 */
  namespace FileUpload {
    // ============================================================
    // 上传状态（前端引擎专用）
    // ============================================================

    /** 上传状态枚举 */
    type UploadStatus = 'idle' | 'computing_md5' | 'uploading' | 'paused' | 'completed' | 'error'

    // ============================================================
    // 文件响应类型（对应后端 VO）
    // ============================================================

    /** 文件上传成功响应（后端 FileUploadVo） */
    interface FileUploadVo {
      fileId: number
      fileNo: string
      originalName: string
      /** 文件大小（字节） */
      size: number
      /** 文件访问 URL */
      url: string
      expiresAt?: string | null
    }

    // ============================================================
    // 单文件 / 批量上传
    // ============================================================

    /** multipart 上传接口 query 参数（对应后端 FileUploadQueryDto） */
    interface FileUploadQueryDto {
      /** 目标文件夹 ID，不传或为 0 表示根目录 */
      folderId?: number | null
      /** 是否解析 filename 中的相对路径并自动创建子文件夹 */
      preservePath?: boolean
    }

    /** 批量上传响应（对应后端 BatchUploadVo） */
    interface BatchUploadResult {
      success: FileUploadVo[]
      failed: UploadFailureVo[]
    }

    /** 批量上传响应（OpenAPI: BatchUploadVo） */
    type BatchUploadVo = BatchUploadResult

    /** 上传失败项（对应后端 UploadFailureVo） */
    interface UploadFailureVo {
      originalName: string
      reason: string
    }

    // ============================================================
    // Presigned 上传
    // ============================================================

    /** Presigned 上传请求参数（对应后端 PresignUploadDto） */
    interface PresignUploadParams {
      fileName: string
      fileSize: number
      /** 文件 MD5，传了触发秒传检查 */
      fileMd5?: string | null
    }

    /** Presigned 上传响应（后端 PresignedUploadVo） */
    interface PresignUploadResult {
      /** 是否秒传命中 */
      fastUploaded: boolean
      /** 秒传命中时返回文件信息 */
      file?: FileUploadVo | null
      /** 预签名上传 URL（秒传命中时为 null） */
      uploadUrl?: string | null
      /** object key（回调时需要，秒传命中时为 null） */
      objectKey?: string | null
      /** URL 有效期秒数（秒传命中时为 null） */
      expiresIn?: number | null
    }

    /** Presigned 上传响应（OpenAPI: PresignedUploadVo） */
    type PresignedUploadVo = PresignUploadResult

    /** Presigned 上传回调参数（后端 PresignUploadCallbackDto） */
    interface PresignUploadCallbackParams {
      objectKey: string
      originalName: string
      fileSize: number
      fileMd5?: string | null
    }

    /** Presigned 上传请求参数（OpenAPI: PresignUploadDto） */
    type PresignUploadDto = PresignUploadParams

    /** Presigned 上传回调参数（OpenAPI: PresignUploadCallbackDto） */
    type PresignUploadCallbackDto = PresignUploadCallbackParams

    /** Pre-signed 下载 URL 响应（后端 PresignedDownloadVo） */
    interface PresignedDownloadVo {
      /** 下载 URL */
      url: string
      /** 过期时间 */
      expiresAt?: string | null
      /** 有效期（秒） */
      expiresIn: number
    }

    // ============================================================
    // 分片上传
    // ============================================================

    /** 分片上传初始化参数（对应后端 MultipartInitDto） */
    interface MultipartInitParams {
      fileName: string
      fileSize: number
      fileMd5: string
    }

    /** 分片上传初始化响应（对应后端 MultipartInitVo） */
    interface MultipartInitResult {
      fastUploaded: boolean
      file?: FileUploadVo | null
      uploadId?: string | null
      objectKey?: string | null
      chunkSize?: number | null
      totalParts?: number | null
      partUrls?: PartUrl[] | null
      expiresIn?: number | null
    }

    /** 分片上传初始化响应（OpenAPI: MultipartInitVo） */
    type MultipartInitVo = MultipartInitResult

    /** 分片预签名 URL（对应后端 PartPresignedUrl） */
    interface PartUrl {
      partNumber: number
      uploadUrl: string
    }

    /** 查询已上传分片参数（对应后端 MultipartListPartsDto） */
    interface MultipartPartsParams {
      uploadId: string
      objectKey: string
      fileSize: number
    }

    /** 已上传分片信息（对应后端 UploadedPartVo） */
    interface UploadedPart {
      partNumber: number
      eTag: string
      size: number
    }

    /** 查询已上传分片响应（对应后端 MultipartListPartsVo） */
    interface MultipartPartsResult {
      uploadedParts: UploadedPart[]
      pendingPartUrls: PartUrl[]
      expiresIn: number
    }

    /** 查询已上传分片响应（OpenAPI: MultipartListPartsVo） */
    type MultipartListPartsVo = MultipartPartsResult

    /** 合并分片参数（对应后端 MultipartCompleteDto） */
    interface MultipartCompleteParams {
      uploadId: string
      objectKey: string
      originalName: string
      fileSize: number
      fileMd5?: string | null
    }

    /** 分片上传初始化参数（OpenAPI: MultipartInitDto） */
    type MultipartInitDto = MultipartInitParams

    /** 查询已上传分片参数（OpenAPI: MultipartListPartsDto） */
    type MultipartListPartsDto = MultipartPartsParams

    /** 合并分片参数（OpenAPI: MultipartCompleteDto） */
    type MultipartCompleteDto = MultipartCompleteParams

    /** 取消分片上传参数（对应后端 MultipartAbortDto） */
    interface MultipartAbortParams {
      uploadId: string
      objectKey: string
    }

    /** 取消分片上传参数（OpenAPI: MultipartAbortDto） */
    type MultipartAbortDto = MultipartAbortParams

    // ============================================================
    // 文件管理（目录/文件/分享链接）
    // ============================================================

    /** 文件可见性 */
    type FileVisibility = string

    /** 文件状态 */
    type FileStatus = string

    /** 文件分类 */
    type FileKind = string

    /** 存储提供方 */
    type FileProvider = string

    /** 文件创建人信息（对应后端 CreatorVo） */
    interface FileCreatorVo {
      id: number
      userName: string
      nickName: string
    }

    /** 文件夹简要信息（出现在文件列表的 folder 字段） */
    interface FileFolderSimpleVo {
      id: number
      parentId: number
      name: string
      slug: string
      visibility: FileVisibility
      sort: number
    }

    /** 文件记录（对应后端 FileVo） */
    interface FileVo {
      id: number
      fileNo: string
      provider: FileProvider
      bucket: string
      objectKey: string
      etag: string
      originalName: string
      displayName: string
      extension: string
      mimeType: string
      kind: FileKind
      size: number
      width?: number | null
      height?: number | null
      duration?: number | null
      pageCount?: number | null
      visibility: FileVisibility
      status: FileStatus
      /** 空字符串表示未开启分享 */
      publicToken: string
      publicUrlExpiresAt?: string | null
      tags: any
      remark: string
      metadata: any
      purgeStatus: string
      deletedAt?: string | null
      deletedBy?: number | null
      purgedAt?: string | null
      purgeError?: string | null
      folder?: FileFolderSimpleVo | null
      creator?: FileCreatorVo | null
      createdAt: string
      updatedAt: string
    }

    /** 文件详情（别名，便于旧代码兼容） */
    type FileDetailVo = FileVo

    /** 文件列表查询参数（对应后端 FileQueryDto） */
    interface FileQueryParams {
      bucket?: string | null
      creatorId?: number | null
      displayName?: string | null
      extension?: string | null
      fileNo?: string | null
      folderId?: number | null
      kind?: FileKind | null
      originalName?: string | null
      provider?: FileProvider | null
      status?: FileStatus | null
      visibility?: FileVisibility | null
      page?: number | null
      size?: number | null
    }

    /** 文件列表统计（对应后端 FileSummaryVo） */
    interface FileSummaryVo {
      total: number
      privateCount: number
      publicCount: number
    }

    /** 文件列表分页响应（对应后端 FilePageVo） */
    interface FilePageVo {
      current: number
      size: number
      total: number
      records: FileVo[]
      summary: FileSummaryVo
    }

    /** 文件列表（分页） */
    type FileList = FilePageVo

    /** 文件夹树节点（对应后端 FileFolderTreeVo） */
    interface FileFolderTreeVo {
      id: number
      parentId: number
      name: string
      slug: string
      visibility: FileVisibility
      sort: number
      fileCount: number
    }

    /** 文件夹详情/列表项（对应后端 FileFolderVo） */
    interface FileFolderVo {
      id: number
      parentId: number
      name: string
      slug: string
      visibility: FileVisibility
      sort: number
      fileCount: number
      createTime: string
      updateTime: string
    }

    /** 创建文件夹参数（对应后端 CreateFileFolderDto） */
    interface CreateFileFolderDto {
      name: string
      /** 父级文件夹ID（0表示根） */
      parentId?: number | null
      /** slug（同级唯一） */
      slug: string
      /** 排序 */
      sort?: number | null
      /** 可见性（如 PUBLIC/PRIVATE） */
      visibility?: FileVisibility | null
    }

    /** 更新文件夹参数（对应后端 UpdateFileFolderDto） */
    interface UpdateFileFolderDto {
      name?: string | null
      slug?: string | null
      sort?: number | null
      visibility?: FileVisibility | null
    }

    /** 移动文件参数（对应后端 MoveFileDto） */
    interface MoveFileDto {
      folderId?: number | null
    }

    /** 更新展示名称参数（对应后端 UpdateFileDisplayNameDto） */
    interface UpdateFileDisplayNameDto {
      displayName: string
    }

    /** 更新可见性参数（对应后端 UpdateFileVisibilityDto） */
    interface UpdateFileVisibilityDto {
      visibility: FileVisibility
    }

    /** 更新状态参数（对应后端 UpdateFileStatusDto） */
    interface UpdateFileStatusDto {
      status: FileStatus
    }

    /** 生成公开分享链接参数（对应后端 GeneratePublicLinkDto） */
    interface GeneratePublicLinkDto {
      /** 过期时间（秒），不传则永久/后端默认 */
      expiresIn?: number | null
    }

    /** 公开分享链接响应（对应后端 FilePublicLinkVo） */
    interface FilePublicLinkVo {
      token: string
      visibility: FileVisibility
      publicUrl: string
      expiresAt?: string | null
    }

    // ============================================================
    // Web Worker 消息类型
    // ============================================================

    /** Worker 请求消息 */
    type Md5WorkerRequest = { type: 'start'; file: File; chunkSize: number } | { type: 'cancel' }

    /** Worker 响应消息 */
    type Md5WorkerResponse =
      | { type: 'progress'; percent: number }
      | { type: 'complete'; md5: string }
      | { type: 'error'; message: string }
      | { type: 'cancelled' }

    // ============================================================
    // 上传引擎配置 & 回调（前端专用）
    // ============================================================

    /** 引擎配置 */
    interface UploadEngineConfig {
      /** 并发上传数，默认 3 */
      concurrency?: number
      /** 最大重试次数，默认 3 */
      maxRetries?: number
      /** 重试基础延迟（ms），默认 1000 */
      retryDelay?: number
    }

    /** 上传进度信息 */
    interface UploadProgress {
      /** 总进度百分比 0-100 */
      percent: number
      /** 已上传字节 */
      loaded: number
      /** 总字节 */
      total: number
      /** 上传速度（字节/秒） */
      speed: number
      /** MD5 计算进度百分比 0-100 */
      md5Percent: number
      /** 已完成分片数 */
      completedParts: number
      /** 总分片数 */
      totalParts: number
      /** 是否秒传命中 */
      fastUploaded: boolean
      /** MD5 计算耗时（毫秒） */
      md5Duration: number
      /** 上传耗时（毫秒），包含从开始上传到完成的总耗时 */
      uploadDuration: number
    }

    /** 引擎回调接口 */
    interface UploadEngineCallbacks {
      /** 进度更新 */
      onProgress?: (progress: UploadProgress) => void
      /** 上传完成 */
      onComplete?: (file: FileUploadVo) => void
      /** 上传出错 */
      onError?: (error: Error) => void
      /** 状态变更 */
      onStatusChange?: (status: UploadStatus) => void
    }
  }
}
