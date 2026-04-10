import assert from 'node:assert/strict'
import test from 'node:test'

import { buildPriceConfigSummary, parseJsonText, stringifyJsonValue } from '../helpers'

test('parseJsonText returns undefined for blank input', () => {
  assert.equal(parseJsonText('   '), undefined)
})

test('parseJsonText parses valid json input', () => {
  assert.deepEqual(parseJsonText('{"input":0.15,"output":0.6}'), {
    input: 0.15,
    output: 0.6
  })
})

test('stringifyJsonValue formats object with indentation', () => {
  assert.equal(stringifyJsonValue({ input: 0.15 }), '{\n  "input": 0.15\n}')
})

test('buildPriceConfigSummary prefers common price keys', () => {
  assert.equal(
    buildPriceConfigSummary({ input: 0.15, output: 0.6, cacheRead: 0.01 }),
    'input: 0.15 / output: 0.6 / cacheRead: 0.01'
  )
})

test('buildPriceConfigSummary falls back to key count for complex payloads', () => {
  assert.equal(buildPriceConfigSummary({ one: 1, two: 2, three: 3, four: 4 }), '4 pricing items')
})
