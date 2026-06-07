import type { FeedbackContext, FeedbackContextSource } from './types'

const UNKNOWN_TEXT = '未知'

const getCurrentNavigator = () => {
  if (typeof navigator === 'undefined') return undefined
  return navigator
}

const getCurrentWindow = () => {
  if (typeof window === 'undefined') return undefined
  return window
}

const normalizeText = (value: unknown, fallback = UNKNOWN_TEXT) => {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

export const detectBrowser = (userAgent = '') => {
  const ua = userAgent.toLowerCase()

  if (ua.includes('edg/')) return 'Edge'
  if (ua.includes('firefox/')) return 'Firefox'
  if (ua.includes('opr/') || ua.includes('opera/')) return 'Opera'
  if (ua.includes('chrome/') || ua.includes('crios/')) return 'Chrome'
  if (ua.includes('safari/')) return 'Safari'

  return UNKNOWN_TEXT
}

export const detectOs = (userAgent = '', platform = '') => {
  const ua = userAgent.toLowerCase()
  const lowerPlatform = platform.toLowerCase()

  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS'
  if (lowerPlatform.includes('mac')) return 'macOS'
  if (lowerPlatform.includes('win')) return 'Windows'
  if (ua.includes('android')) return 'Android'
  if (lowerPlatform.includes('linux')) return 'Linux'

  return UNKNOWN_TEXT
}

export const detectDevice = (userAgent = '', width = 0) => {
  const ua = userAgent.toLowerCase()

  if (ua.includes('ipad') || ua.includes('tablet')) return 'tablet'
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) return 'mobile'
  if (width > 0 && width <= 768) return 'mobile'
  if (width > 768 && width <= 1024) return 'tablet'

  return 'pc'
}

export const formatViewport = (width = 0, height = 0) => {
  if (width <= 0 || height <= 0) return UNKNOWN_TEXT
  return `${Math.round(width)} x ${Math.round(height)}`
}

export const createFeedbackContext = (source: FeedbackContextSource = {}): FeedbackContext => {
  const currentNavigator = getCurrentNavigator()
  const currentWindow = getCurrentWindow()
  const userAgent = source.userAgent ?? currentNavigator?.userAgent ?? ''
  const platform = source.platform ?? currentNavigator?.platform ?? ''
  const width = source.width ?? currentWindow?.innerWidth ?? 0
  const height = source.height ?? currentWindow?.innerHeight ?? 0

  return {
    pageTitle: normalizeText(source.routeTitle),
    path: normalizeText(source.routePath),
    browser: detectBrowser(userAgent),
    os: detectOs(userAgent, platform),
    device: detectDevice(userAgent, width),
    viewport: formatViewport(width, height)
  }
}
