export interface SelectOption<T = string | number | boolean> {
  label: string
  value: T
}

export const OPENAI_CHANNEL_TYPE: Api.AiManage.ChannelType = 1
export const OAUTH_CREDENTIAL_TYPE = 'oauth'
export const DEFAULT_CREDENTIALS_TEMPLATE = '{\n  "api_key": ""\n}'

export const CHANNEL_ACCOUNT_STATUS_OPTIONS: SelectOption<Api.AiManage.ChannelAccountStatus>[] = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 },
  { label: '额度耗尽', value: 3 },
  { label: '已过期', value: 4 },
  { label: '冷却中', value: 5 }
]

export const COMMON_CREDENTIAL_TYPE_OPTIONS: SelectOption<string>[] = [
  { label: 'API Key', value: 'api_key' },
  { label: 'OAuth', value: 'oauth' },
  { label: 'Cookie', value: 'cookie' },
  { label: 'Session', value: 'session' },
  { label: 'Token', value: 'token' }
]

const getOptionLabel = <T>(options: SelectOption<T>[], value: T, fallback = '-') => {
  return options.find((item) => item.value === value)?.label ?? fallback
}

export const getChannelAccountStatusLabel = (value: Api.AiManage.ChannelAccountStatus) =>
  getOptionLabel(CHANNEL_ACCOUNT_STATUS_OPTIONS, value)

export const getCredentialTypeLabel = (value: string) =>
  getOptionLabel(COMMON_CREDENTIAL_TYPE_OPTIONS, value, value || '-')

export const getCredentialTemplate = (value: string) => {
  switch (value.trim().toLowerCase()) {
    case 'api_key':
      return '{\n  "api_key": ""\n}'
    case 'cookie':
      return '{\n  "cookie": ""\n}'
    case 'session':
      return '{\n  "session": ""\n}'
    case 'token':
      return '{\n  "token": ""\n}'
    case 'oauth':
      return '{}'
    default:
      return '{\n  "value": ""\n}'
  }
}

export const getCredentialPlaceholder = (value: string) => {
  switch (value.trim().toLowerCase()) {
    case 'api_key':
      return '请输入 JSON，例如：{"api_key":"sk-xxx"} 或 {"api_keys":["sk-1","sk-2"]}'
    case 'cookie':
      return '请输入 JSON，例如：{"cookie":"key=value; key2=value2"}'
    case 'session':
      return '请输入 JSON，例如：{"session":"sess-xxx"}'
    case 'token':
      return '请输入 JSON，例如：{"token":"tk-xxx"}'
    default:
      return '请输入 JSON，例如：{"value":"..."}'
  }
}

export const getChannelAccountStatusTagType = (value: Api.AiManage.ChannelAccountStatus) => {
  switch (value) {
    case 1:
      return 'success'
    case 2:
      return 'info'
    case 3:
      return 'warning'
    case 4:
      return 'danger'
    case 5:
      return 'warning'
    default:
      return 'info'
  }
}

export const getSchedulableLabel = (value: boolean) => (value ? '可调度' : '暂停调度')

export const getSchedulableTagType = (value: boolean) => (value ? 'success' : 'info')
