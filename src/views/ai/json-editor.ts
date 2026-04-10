export interface JsonEditorPreset {
  description: string
  emptyHint: string
  template: string
}

export const buildJsonEditorPreset = ({
  description,
  emptyHint,
  templateData
}: {
  description: string
  emptyHint: string
  templateData: unknown
}): JsonEditorPreset => ({
  description,
  emptyHint,
  template: JSON.stringify(templateData, null, 2)
})

export const parseJsonEditorValue = (value: string, ...fallbackArgs: [unknown?]) => {
  const text = value.trim()
  if (!text) {
    return fallbackArgs.length > 0 ? fallbackArgs[0] : null
  }
  return JSON.parse(text)
}

export const formatJsonEditorValue = (value: unknown, fallback: string = '') => {
  if (value == null) {
    return fallback
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return fallback
  }
}

export const validateJsonEditorValue = (
  label: string,
  value: string,
  required: boolean = false
) => {
  const text = value.trim()
  if (!text) {
    return required ? `请输入${label}` : ''
  }

  try {
    JSON.parse(text)
    return ''
  } catch {
    return `${label} 必须是合法 JSON`
  }
}
