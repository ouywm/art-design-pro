import axios from 'axios'
import request from '@/utils/http'
import { useUserStore } from '@/store/modules/user'

// ─── 服务端代理上传 ─────────────────────────────────────────────────────────

/** 单文件上传（multipart/form-data） */
export function fetchUploadFile(file: File, query: Api.FileUpload.FileUploadQueryDto = {}) {
  const form = new FormData()
  const relativePath = (file as any)?.__relativePath ?? (file as any)?.webkitRelativePath
  if (query.preservePath && typeof relativePath === 'string' && relativePath.trim()) {
    form.append('file', file, relativePath)
  } else {
    form.append('file', file)
  }
  return request.post<Api.FileUpload.FileUploadVo>({
    url: '/api/file/upload',
    data: form,
    params: query
  })
}

/** 批量文件上传（multipart/form-data） */
export function fetchUploadFiles(files: File[], query: Api.FileUpload.FileUploadQueryDto = {}) {
  const form = new FormData()
  for (const file of files) {
    const relativePath = (file as any)?.__relativePath ?? (file as any)?.webkitRelativePath
    if (query.preservePath && typeof relativePath === 'string' && relativePath.trim()) {
      form.append('files', file, relativePath)
    } else {
      form.append('files', file)
    }
  }
  return request.post<Api.FileUpload.BatchUploadVo>({
    url: '/api/file/upload/batch',
    data: form,
    params: query
  })
}

// ─── Presigned URL ──────────────────────────────────────────────────────────

/** 获取预签名上传 URL */
export function fetchPresignUpload(params: Api.FileUpload.PresignUploadParams) {
  return request.post<Api.FileUpload.PresignedUploadVo>({
    url: '/api/file/presign/upload',
    data: params
  })
}

/** 预签名上传回调确认 */
export function fetchPresignUploadCallback(params: Api.FileUpload.PresignUploadCallbackParams) {
  return request.post<Api.FileUpload.FileUploadVo>({
    url: '/api/file/presign/upload/callback',
    data: params
  })
}

/** 获取预签名下载 URL */
export async function fetchPresignDownload(
  fileId: number
): Promise<Api.FileUpload.PresignedDownloadVo> {
  return request.get<Api.FileUpload.PresignedDownloadVo>({
    url: `/api/file/${fileId}/presign/download`
  })
}

/**
 * PUT 整个文件到预签名 URL（直传 RustFS，不走后端拦截器）
 * 使用 axios 原始实例，支持上传进度回调
 */
export async function fetchPutFileToPresignedUrl(
  url: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  await axios.put(url, file, {
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    onUploadProgress: onProgress
      ? (e) => {
          if (e.total) onProgress(Math.round((e.loaded / e.total) * 100))
        }
      : undefined
  })
}

/** Proxy 下载文件（流式，带 Token） */
export async function fetchProxyDownload(fileId: number) {
  const { accessToken } = useUserStore()
  const res = await fetch(`/api/file/${fileId}/download`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Download failed: ${res.status} ${text}`)
  }
  return res
}

// ─── 分片上传 ────────────────────────────────────────────────────────────────

/** 初始化分片上传（含秒传检查） */
export function fetchMultipartInit(params: Api.FileUpload.MultipartInitParams) {
  return request.post<Api.FileUpload.MultipartInitVo>({
    url: '/api/file/multipart/init',
    data: params
  })
}

/** 查询已上传分片（断点续传） */
export function fetchMultipartParts(params: Api.FileUpload.MultipartPartsParams) {
  const query = new URLSearchParams({
    uploadId: params.uploadId,
    objectKey: params.objectKey,
    fileSize: String(params.fileSize)
  })
  return request.get<Api.FileUpload.MultipartListPartsVo>({
    url: `/api/file/multipart/parts?${query}`
  })
}

/** 完成分片上传 */
export function fetchMultipartComplete(params: Api.FileUpload.MultipartCompleteParams) {
  return request.post<Api.FileUpload.FileUploadVo>({
    url: '/api/file/multipart/complete',
    data: params
  })
}

/** 取消分片上传 */
export function fetchMultipartAbort(params: Api.FileUpload.MultipartAbortParams) {
  return request.post<null>({
    url: '/api/file/multipart/abort',
    data: params
  })
}

/**
 * PUT 分片到预签名 URL（直接请求 RustFS，不走后端拦截器）
 * 使用 axios 原始实例，支持上传进度和取消
 */
export function fetchPutChunkToPresignedUrl(
  url: string,
  chunk: Blob,
  contentType: string,
  onProgress?: (loaded: number, total: number) => void
): { promise: Promise<string>; abort: () => void } {
  const controller = new AbortController()

  const promise = axios
    .put(url, chunk, {
      headers: { 'Content-Type': contentType },
      signal: controller.signal,
      onUploadProgress: onProgress
        ? (e) => {
            if (e.total) onProgress(e.loaded, e.total)
          }
        : undefined
    })
    .then((res) => {
      const eTag = (res.headers['etag'] as string) || ''
      return eTag.replace(/"/g, '')
    })

  return {
    promise,
    abort: () => controller.abort()
  }
}

// ─── 文件管理 ────────────────────────────────────────────────────────────────

/** 获取文件列表（分页） */
export function fetchGetFileList(params: Api.FileUpload.FileQueryParams) {
  return request.get<Api.FileUpload.FileList>({
    url: '/api/file/list',
    params
  })
}

/** 获取文件详情 */
export function fetchGetFileDetail(id: number) {
  return request.get<Api.FileUpload.FileDetailVo>({
    url: `/api/file/${id}`
  })
}

/** 删除文件 */
export function fetchDeleteFile(id: number) {
  return request.del<null>({
    url: `/api/file/${id}`
  })
}

/** 获取文件夹树 */
export function fetchGetFolderTree() {
  return request.get<Api.FileUpload.FileFolderTreeVo[]>({
    url: '/api/file/folder/tree'
  })
}

/** 创建文件夹 */
export function fetchCreateFolder(params: Api.FileUpload.CreateFileFolderDto) {
  return request.post<Api.FileUpload.FileFolderVo>({
    url: '/api/file/folder',
    data: params
  })
}

/** 更新文件夹 */
export function fetchUpdateFolder(id: number, params: Api.FileUpload.UpdateFileFolderDto) {
  return request.put<Api.FileUpload.FileFolderVo>({
    url: `/api/file/folder/${id}`,
    data: params
  })
}

/** 删除文件夹 */
export function fetchDeleteFolder(id: number) {
  return request.del<null>({
    url: `/api/file/folder/${id}`
  })
}

/** 更新展示名称 */
export function fetchUpdateFileDisplayName(
  id: number,
  params: Api.FileUpload.UpdateFileDisplayNameDto
) {
  return request.put<null>({
    url: `/api/file/${id}/display-name`,
    data: params
  })
}

/** 移动文件到文件夹 */
export function fetchMoveFile(id: number, params: Api.FileUpload.MoveFileDto) {
  return request.put<null>({
    url: `/api/file/${id}/move`,
    data: params
  })
}

/** 更新文件可见性 */
export function fetchUpdateFileVisibility(
  id: number,
  params: Api.FileUpload.UpdateFileVisibilityDto
) {
  return request.put<null>({
    url: `/api/file/${id}/visibility`,
    data: params
  })
}

/** 更新文件状态 */
export function fetchUpdateFileStatus(id: number, params: Api.FileUpload.UpdateFileStatusDto) {
  return request.put<null>({
    url: `/api/file/${id}/status`,
    data: params
  })
}

/** 生成公开分享链接 */
export function fetchGeneratePublicLink(
  id: number,
  params: Api.FileUpload.GeneratePublicLinkDto = {}
) {
  return request.post<Api.FileUpload.FilePublicLinkVo>({
    url: `/api/file/${id}/public-link`,
    data: params
  })
}

/** 撤销公开分享链接 */
export function fetchRevokePublicLink(id: number) {
  return request.del<null>({
    url: `/api/file/${id}/public-link`
  })
}
