export interface SelectOption<T = string | number> {
  label: string
  value: T
}

export const CHANNEL_TYPE_OPTIONS: SelectOption<Api.AiManage.ChannelType>[] = [
  { label: 'OpenAI', value: 1 },
  { label: 'Anthropic', value: 2 },
  { label: 'Azure', value: 3 },
  { label: 'Baidu', value: 4 },
  { label: 'Ali', value: 5 },
  { label: 'Gemini', value: 6 },
  { label: 'Ollama', value: 7 }
]

export const CHANNEL_STATUS_OPTIONS: SelectOption<Api.AiManage.ChannelStatus>[] = [
  { label: '启用', value: 1 },
  { label: '手动禁用', value: 2 },
  { label: '自动禁用', value: 3 },
  { label: '归档', value: 4 }
]

export const CHANNEL_HEALTH_STATUS_OPTIONS: SelectOption<Api.AiManage.ChannelLastHealthStatus>[] = [
  { label: '未知', value: 0 },
  { label: '健康', value: 1 },
  { label: '警告', value: 2 },
  { label: '异常', value: 3 }
]

export const COMMON_ENDPOINT_SCOPE_OPTIONS: SelectOption<string>[] = [
  { label: 'chat', value: 'chat' },
  { label: 'responses', value: 'responses' },
  { label: 'embeddings', value: 'embeddings' },
  { label: 'images', value: 'images' },
  { label: 'audio', value: 'audio' },
  { label: 'moderations', value: 'moderations' },
  { label: 'rerank', value: 'rerank' }
]

export const COMMON_CAPABILITY_OPTIONS: SelectOption<string>[] = [
  { label: 'vision', value: 'vision' },
  { label: 'tool_call', value: 'tool_call' },
  { label: 'reasoning', value: 'reasoning' },
  { label: 'streaming', value: 'streaming' },
  { label: 'json_schema', value: 'json_schema' }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getChannelTypeLabel = (value: Api.AiManage.ChannelType) =>
  getOptionLabel(CHANNEL_TYPE_OPTIONS, value)

export const getChannelStatusLabel = (value: Api.AiManage.ChannelStatus) =>
  getOptionLabel(CHANNEL_STATUS_OPTIONS, value)

export const getChannelHealthStatusLabel = (value: Api.AiManage.ChannelLastHealthStatus) =>
  getOptionLabel(CHANNEL_HEALTH_STATUS_OPTIONS, value)

export const getChannelStatusTagType = (value: Api.AiManage.ChannelStatus) => {
  switch (value) {
    case 1:
      return 'success'
    case 2:
      return 'info'
    case 3:
      return 'warning'
    case 4:
      return 'danger'
    default:
      return 'info'
  }
}

export const getChannelHealthTagType = (value: Api.AiManage.ChannelLastHealthStatus) => {
  switch (value) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
}
