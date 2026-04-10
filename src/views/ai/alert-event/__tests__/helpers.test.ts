import assert from 'node:assert/strict'
import test from 'node:test'

import { formatAlertEventTime, getAlertEventStatusMeta, getAlertSeverityMeta } from '../helpers'

test('getAlertEventStatusMeta returns warning tag for open event', () => {
  assert.deepEqual(getAlertEventStatusMeta(1), {
    text: '打开',
    type: 'warning'
  })
})

test('getAlertSeverityMeta returns danger tag for severity 2', () => {
  assert.deepEqual(getAlertSeverityMeta(2), {
    text: 'P2',
    type: 'danger'
  })
})

test('formatAlertEventTime formats iso strings to local datetime', () => {
  assert.equal(formatAlertEventTime('2026-04-10T08:30:15Z'), '2026-04-10 16:30:15')
})
