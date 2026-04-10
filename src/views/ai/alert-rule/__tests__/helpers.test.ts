import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildAlertRuleJsonSummary,
  getAlertRuleSeverityMeta,
  getAlertRuleStatusMeta
} from '../helpers'

test('getAlertRuleStatusMeta returns success tag for enabled rules', () => {
  assert.deepEqual(getAlertRuleStatusMeta(1), {
    text: '启用',
    type: 'success'
  })
})

test('getAlertRuleSeverityMeta returns danger tag for severity 3', () => {
  assert.deepEqual(getAlertRuleSeverityMeta(3), {
    text: 'P3',
    type: 'danger'
  })
})

test('buildAlertRuleJsonSummary compacts object entries', () => {
  assert.equal(
    buildAlertRuleJsonSummary({ threshold: 5, window: '5m' }),
    'threshold: 5, window: 5m'
  )
})

test('buildAlertRuleJsonSummary falls back for empty objects', () => {
  assert.equal(buildAlertRuleJsonSummary({}), '-')
})
