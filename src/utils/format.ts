/**
 * 通用格式化工具函数
 */

/** 格式化文件大小（字节 → 可读字符串） */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
  return (bytes / 1073741824).toFixed(2) + ' GB'
}

/** 格式化耗时（毫秒 → 可读字符串） */
export function formatDuration(ms: number): string {
  if (ms < 1000) return ms + ' ms'
  const seconds = ms / 1000
  if (seconds < 60) return seconds.toFixed(1) + ' 秒'
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = Math.round(seconds % 60)
  if (minutes < 60) return `${minutes} 分 ${remainSeconds} 秒`
  const hours = Math.floor(minutes / 60)
  const remainMinutes = minutes % 60
  return `${hours} 时 ${remainMinutes} 分 ${remainSeconds} 秒`
}

/** 格式化传输速度（字节/秒 → 可读字符串） */
export function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return bytesPerSecond + ' B/s'
  if (bytesPerSecond < 1048576) return (bytesPerSecond / 1024).toFixed(1) + ' KB/s'
  if (bytesPerSecond < 1073741824) return (bytesPerSecond / 1048576).toFixed(1) + ' MB/s'
  return (bytesPerSecond / 1073741824).toFixed(2) + ' GB/s'
}

/** 格式化运行时间（秒 → 可读字符串，如 "3 天 2 时 15 分"） */
export function formatUptime(seconds: number): string {
  if (seconds < 60) return seconds + ' 秒'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (days > 0) parts.push(`${days} 天`)
  if (hours > 0) parts.push(`${hours} 时`)
  if (minutes > 0) parts.push(`${minutes} 分`)
  return parts.join(' ') || '0 分'
}
