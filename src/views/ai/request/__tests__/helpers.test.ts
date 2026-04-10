import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildRequestModelMeta,
  formatJsonValue,
  formatLatencyMs,
  formatRequestTime,
  getExecutionStatusMeta,
  getRequestStatusMeta
} from '../helpers'

test('getRequestStatusMeta returns success label for succeeded request', () => {
  assert.deepEqual(getRequestStatusMeta(3), {
    text: '成功',
    type: 'success'
  })
})

test('getExecutionStatusMeta returns warning label for running execution', () => {
  assert.deepEqual(getExecutionStatusMeta(2), {
    text: '执行中',
    type: 'warning'
  })
})

test('formatJsonValue pretty prints objects', () => {
  assert.equal(formatJsonValue({ traceId: 123 }), '{\n  "traceId": 123\n}')
})

test('formatLatencyMs formats non-negative latency values', () => {
  assert.equal(formatLatencyMs(120), '120 ms')
})

test('formatLatencyMs hides negative latency values', () => {
  assert.equal(formatLatencyMs(-1), '-')
})

test('buildRequestModelMeta collapses duplicate requested and upstream models', () => {
  assert.deepEqual(buildRequestModelMeta('gpt-5.4', 'gpt-5.4'), {
    primary: 'gpt-5.4',
    secondary: ''
  })
})

test('formatRequestTime converts iso string to compact local display', () => {
  assert.equal(formatRequestTime('2026-04-09T18:08:54.814650Z'), '2026-04-10 02:08:54')
})
