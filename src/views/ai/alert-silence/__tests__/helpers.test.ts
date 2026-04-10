import assert from 'node:assert/strict'
import test from 'node:test'

import { formatAlertSilenceTime, getAlertSilenceStatusMeta } from '../helpers'

test('getAlertSilenceStatusMeta returns success tag for active silence', () => {
  assert.deepEqual(getAlertSilenceStatusMeta(1), {
    text: '生效中',
    type: 'success'
  })
})

test('formatAlertSilenceTime formats iso strings to local datetime', () => {
  assert.equal(formatAlertSilenceTime('2026-04-10T08:30:15Z'), '2026-04-10 16:30:15')
})
