import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AI_CHANNEL_ACCOUNT_STATUS_OPTIONS,
  AI_CHANNEL_STATUS_OPTIONS,
  buildNumericDictOptions,
  getNumericEnumMeta
} from '../enum-options'

test('getNumericEnumMeta falls back to predefined channel status labels', () => {
  assert.deepEqual(getNumericEnumMeta(undefined, AI_CHANNEL_STATUS_OPTIONS, 1), {
    label: '启用',
    value: 1,
    listClass: 'success'
  })
})

test('buildNumericDictOptions converts string dict values to numbers', () => {
  assert.deepEqual(
    buildNumericDictOptions([{ label: '冷却中', value: '5', listClass: 'warning' }], []),
    [{ label: '冷却中', value: 5, listClass: 'warning' }]
  )
})

test('getNumericEnumMeta resolves channel account status from dict items', () => {
  assert.deepEqual(
    getNumericEnumMeta(
      [{ label: '额度耗尽', value: '3', listClass: 'danger' }],
      AI_CHANNEL_ACCOUNT_STATUS_OPTIONS,
      3
    ),
    {
      label: '额度耗尽',
      value: 3,
      listClass: 'danger'
    }
  )
})
