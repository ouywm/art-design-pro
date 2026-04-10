import assert from 'node:assert/strict'
import test from 'node:test'

import { formatBackoffSeconds, formatRetryAttemptTime, getRetryAttemptStatusMeta } from '../helpers'

test('getRetryAttemptStatusMeta returns success label for succeeded retry', () => {
  assert.deepEqual(getRetryAttemptStatusMeta(2), {
    text: '成功',
    type: 'success'
  })
})

test('formatBackoffSeconds formats duration in seconds', () => {
  assert.equal(formatBackoffSeconds(30), '30 s')
})

test('formatBackoffSeconds hides negative values', () => {
  assert.equal(formatBackoffSeconds(-1), '-')
})

test('formatRetryAttemptTime converts iso string to compact local display', () => {
  assert.equal(formatRetryAttemptTime('2026-04-09T18:08:54.814650Z'), '2026-04-10 02:08:54')
})
