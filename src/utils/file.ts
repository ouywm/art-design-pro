/**
 * 文件操作工具函数
 */

/** 可预览的图片扩展名 */
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']

/** 浏览器可直接预览的文件扩展名（新标签页打开） */
const BROWSER_PREVIEW_EXTENSIONS = [
  '.pdf',
  '.txt',
  '.html',
  '.xml',
  '.json',
  '.mp4',
  '.mp3',
  '.webm'
]

/** 归一化后缀名：确保以 . 开头 */
function normalizeSuffix(suffix: string): string {
  const s = suffix.toLowerCase().trim()
  return s.startsWith('.') ? s : '.' + s
}

/** 判断文件扩展名是否为图片 */
export function isImageFile(suffix: string): boolean {
  if (!suffix) return false
  return IMAGE_EXTENSIONS.includes(normalizeSuffix(suffix))
}

/** 判断文件扩展名是否可在浏览器新标签页预览 */
export function canBrowserPreview(suffix: string): boolean {
  if (!suffix) return false
  const normalized = normalizeSuffix(suffix)
  return IMAGE_EXTENSIONS.includes(normalized) || BROWSER_PREVIEW_EXTENSIONS.includes(normalized)
}

/**
 * 通过 URL 下载文件（fetch + blob + <a download>，强制触发浏览器下载）
 * @param url 文件的访问 URL
 * @param filename 下载保存的文件名，不传则从 URL 路径中提取
 */
export async function downloadFileByUrl(url: string, filename?: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`下载失败: HTTP ${res.status}`)
  }

  const blob = await res.blob()

  // 推断文件名
  const resolvedFilename =
    filename || decodeURIComponent(new URL(url).pathname.split('/').pop() || 'download')

  triggerBlobDownload(blob, resolvedFilename)
}

/**
 * 通过 Blob 触发浏览器下载
 * @param blob 文件 Blob 数据
 * @param filename 下载保存的文件名
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 从 Content-Disposition 响应头解析文件名
 * @param disposition Content-Disposition 头的值
 * @param fallback 解析失败时的回退文件名
 */
export function parseFilenameFromDisposition(disposition: string, fallback = ''): string {
  // 优先 RFC 5987 编码：filename*=UTF-8''xxx
  const utf8Match = disposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/)
  if (utf8Match) return decodeURIComponent(utf8Match[1])

  // 回退 ASCII：filename="xxx"
  const asciiMatch = disposition.match(/filename="(.+?)"/)
  if (asciiMatch) return asciiMatch[1]

  return fallback
}
