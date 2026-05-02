export interface SelectOption<T = string | number | boolean> {
  label: string
  value: T
}

export const API_STYLE_OPTIONS: SelectOption<Api.AiManage.ApiStyle>[] = [
  { label: 'OpenAI Compatible', value: 'OpenAiCompatible' },
  { label: 'Anthropic Native', value: 'AnthropicNative' },
  { label: 'Gemini Native', value: 'GeminiNative' },
  { label: 'Ollama Native', value: 'OllamaNative' }
]

export const ENABLED_OPTIONS: SelectOption<boolean>[] = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getApiStyleLabel = (value: Api.AiManage.ApiStyle) =>
  getOptionLabel(API_STYLE_OPTIONS, value)

export const getEnabledLabel = (value: boolean) => getOptionLabel(ENABLED_OPTIONS, value)

export const getApiStyleTagType = (value: Api.AiManage.ApiStyle) => {
  switch (value) {
    case 'OpenAiCompatible':
      return 'success'
    case 'AnthropicNative':
      return 'warning'
    case 'GeminiNative':
      return 'info'
    case 'OllamaNative':
      return 'danger'
    default:
      return 'info'
  }
}

export const getEnabledTagType = (value: boolean) => (value ? 'success' : 'info')
