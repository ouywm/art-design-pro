import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildJsonFieldPresetMap,
  formatJsonEditorValue,
  parseJsonEditorValue,
  validateJsonEditorValue
} from '../json-fields'

test('buildJsonFieldPresetMap returns expected default templates', () => {
  const presetMap = buildJsonFieldPresetMap()

  assert.equal(presetMap.models.template, '[\n  "gpt-4o-mini"\n]')
  assert.equal(presetMap.modelMapping.template, '{\n  "gpt-4.1-mini": "gpt-4o-mini"\n}')
  assert.equal(presetMap.capabilities.template, '{\n  "stream": true,\n  "vision": false\n}')
  assert.equal(presetMap.config.template, '{\n  "timeoutMs": 30000\n}')
})

test('parseJsonEditorValue returns fallback for blank text', () => {
  assert.deepEqual(parseJsonEditorValue('   ', []), [])
})

test('parseJsonEditorValue parses valid JSON text', () => {
  assert.deepEqual(parseJsonEditorValue('{"timeoutMs":30000}', null), {
    timeoutMs: 30000
  })
})

test('formatJsonEditorValue pretty prints objects and arrays', () => {
  assert.equal(formatJsonEditorValue({ region: 'global' }), '{\n  "region": "global"\n}')
  assert.equal(formatJsonEditorValue(['gpt-4o-mini']), '[\n  "gpt-4o-mini"\n]')
})

test('validateJsonEditorValue rejects invalid json', () => {
  assert.equal(validateJsonEditorValue('Models JSON', '{'), 'Models JSON 必须是合法 JSON')
})

test('validateJsonEditorValue allows blank optional field', () => {
  assert.equal(validateJsonEditorValue('配置 JSON', '   '), '')
})

test('validateJsonEditorValue rejects blank required field', () => {
  assert.equal(validateJsonEditorValue('Models JSON', '   ', true), '请输入Models JSON')
})
