import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildJsonEditorPreset,
  formatJsonEditorValue,
  parseJsonEditorValue,
  validateJsonEditorValue
} from '../json-editor'

test('buildJsonEditorPreset stringifies object templates', () => {
  const preset = buildJsonEditorPreset({
    description: 'desc',
    emptyHint: 'hint',
    templateData: { timeoutMs: 30000 }
  })

  assert.equal(preset.template, '{\n  "timeoutMs": 30000\n}')
})

test('parseJsonEditorValue returns undefined fallback for blank text', () => {
  assert.equal(parseJsonEditorValue('   ', undefined), undefined)
})

test('formatJsonEditorValue returns fallback for nullish values', () => {
  assert.equal(formatJsonEditorValue(null, ''), '')
})

test('validateJsonEditorValue rejects malformed json text', () => {
  assert.equal(validateJsonEditorValue('Metadata JSON', '{'), 'Metadata JSON 必须是合法 JSON')
})
