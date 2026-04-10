import assert from 'node:assert/strict'
import test from 'node:test'

import { formatCostTotal, formatStatsDate, formatTokenCount } from '../helpers'

test('formatCostTotal formats decimals to fixed 4 digits', () => {
  assert.equal(formatCostTotal(12.345678), '12.3457')
})

test('formatTokenCount adds locale separators', () => {
  assert.equal(formatTokenCount(1234567), '1,234,567')
})

test('formatStatsDate returns raw string for invalid value', () => {
  assert.equal(formatStatsDate('2026-04-10'), '2026-04-10')
})
