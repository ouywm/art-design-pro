import { OPENAI_CHANNEL_TYPE, OAUTH_CREDENTIAL_TYPE } from './constants'
import type {
  OpenAiOAuthCallbackParams,
  OpenAiOAuthDialogMode,
  OpenAiOAuthPendingPayload
} from './types'

const OPENAI_OAUTH_PENDING_STORAGE_KEY = 'ai.channel-account.openai-oauth.pending'
const OPENAI_OAUTH_PENDING_TTL_MS = 30 * 60 * 1000
const OPENAI_OAUTH_CALLBACK_HASH = '#/ai/channel-account'

export const isOpenAiChannelType = (value: Api.AiManage.ChannelType) =>
  value === OPENAI_CHANNEL_TYPE

export const isOAuthCredentialType = (value?: string | null) =>
  value?.trim().toLowerCase() === OAUTH_CREDENTIAL_TYPE

export const buildDefaultOpenAiOAuthRedirectUri = () => {
  const url = new URL(window.location.href)
  clearOAuthQueryParams(url.searchParams)
  return `${url.origin}${url.pathname}${url.search}${OPENAI_OAUTH_CALLBACK_HASH}`
}

export const getOpenAiOAuthCallbackParams = (): OpenAiOAuthCallbackParams => {
  const url = new URL(window.location.href)
  const params = url.searchParams

  return {
    code: params.get('code') || undefined,
    state: params.get('state') || undefined,
    error: params.get('error') || undefined,
    errorDescription: params.get('error_description') || undefined
  }
}

export const clearOpenAiOAuthCallbackParamsFromUrl = () => {
  const url = new URL(window.location.href)
  clearOAuthQueryParams(url.searchParams)
  const nextUrl = `${url.origin}${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, document.title, nextUrl)
}

export const readOpenAiOAuthPendingPayload = () => {
  const raw = localStorage.getItem(OPENAI_OAUTH_PENDING_STORAGE_KEY)
  if (!raw) return undefined

  try {
    const parsed = JSON.parse(raw) as OpenAiOAuthPendingPayload
    if (isOpenAiOAuthPendingExpired(parsed)) {
      clearOpenAiOAuthPendingPayload()
      return undefined
    }
    return parsed
  } catch {
    clearOpenAiOAuthPendingPayload()
    return undefined
  }
}

export const saveOpenAiOAuthPendingPayload = (payload: OpenAiOAuthPendingPayload) => {
  localStorage.setItem(OPENAI_OAUTH_PENDING_STORAGE_KEY, JSON.stringify(payload))
}

export const clearOpenAiOAuthPendingPayload = () => {
  localStorage.removeItem(OPENAI_OAUTH_PENDING_STORAGE_KEY)
}

export const buildOpenAiOAuthPendingPayload = (
  mode: OpenAiOAuthDialogMode,
  payload: Omit<OpenAiOAuthPendingPayload, 'mode' | 'createdAt'>
): OpenAiOAuthPendingPayload => ({
  mode,
  createdAt: Date.now(),
  ...payload
})

const clearOAuthQueryParams = (params: URLSearchParams) => {
  params.delete('code')
  params.delete('state')
  params.delete('error')
  params.delete('error_description')
}

const isOpenAiOAuthPendingExpired = (payload: OpenAiOAuthPendingPayload) => {
  return Date.now() - payload.createdAt > OPENAI_OAUTH_PENDING_TTL_MS
}
