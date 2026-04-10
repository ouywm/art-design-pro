import { buildJsonEditorPreset, type JsonEditorPreset } from '../json-editor'

export interface JsonFieldPresetMap {
  models: JsonEditorPreset
  modelMapping: JsonEditorPreset
  capabilities: JsonEditorPreset
  config: JsonEditorPreset
}

const JSON_FIELD_PRESET_MAP: JsonFieldPresetMap = {
  models: buildJsonEditorPreset({
    description: '填写渠道支持的上游模型列表。',
    emptyHint: '不能为空，必须是 JSON 数组。',
    templateData: ['gpt-4o-mini']
  }),
  modelMapping: buildJsonEditorPreset({
    description: '用于将请求模型映射到真实上游模型。',
    emptyHint: '可留空，留空时会提交空对象。',
    templateData: {
      'gpt-4.1-mini': 'gpt-4o-mini'
    }
  }),
  capabilities: buildJsonEditorPreset({
    description: '用于标记渠道能力，例如流式、视觉、函数调用。',
    emptyHint: '可留空，留空时会提交空对象。',
    templateData: {
      stream: true,
      vision: false
    }
  }),
  config: buildJsonEditorPreset({
    description: '高级扩展配置，例如超时、组织、区域、请求头等。',
    emptyHint: '新增时可留空；编辑时留空表示不更新当前配置。',
    templateData: {
      timeoutMs: 30000
    }
  })
}

export const buildJsonFieldPresetMap = (): JsonFieldPresetMap => JSON_FIELD_PRESET_MAP
export {
  formatJsonEditorValue,
  parseJsonEditorValue,
  validateJsonEditorValue
} from '../json-editor'
