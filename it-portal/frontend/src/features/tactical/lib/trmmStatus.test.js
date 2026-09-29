import test from 'node:test'
import assert from 'node:assert/strict'

import { buildTrmmAttentionSummary, getTrmmStatusMeta } from './trmmStatus.js'
import { getTrmmActionDialogConfig } from './trmmAction.js'

test('TRMM status keeps online, overdue, offline and missing-agent distinct', () => {
  assert.equal(getTrmmStatusMeta({ tactical_agent_id: 'a', tactical_agent_status: 'online' }).key, 'online')
  assert.equal(getTrmmStatusMeta({ tactical_agent_id: 'b', tactical_agent_status: 'overdue' }).key, 'overdue')
  assert.equal(getTrmmStatusMeta({ tactical_agent_id: 'c', tactical_agent_status: 'offline' }).key, 'offline')
  assert.equal(getTrmmStatusMeta({ tactical_agent_status: '' }).key, 'missing')
  assert.equal(getTrmmStatusMeta({ tactical_agent_id: 'd', tactical_agent_status: 'unknown' }).key, 'overdue')
})

test('attention summary excludes online contacts and prioritizes offline computers', () => {
  const summary = buildTrmmAttentionSummary([
    { id: 1, name: 'Online', tactical_agent_id: 'a', tactical_agent_status: 'online' },
    { id: 2, name: 'Overdue', tactical_agent_id: 'b', tactical_agent_status: 'overdue' },
    { id: 3, name: 'Offline', tactical_agent_id: 'c', tactical_agent_status: 'offline' },
    { id: 4, name: 'Missing', tactical_agent_status: '' }
  ])

  assert.deepEqual(summary.counts, { offline: 1, overdue: 1, missing: 1, total: 3 })
  assert.deepEqual(summary.items.map((item) => item.id), [3, 2, 4])
})

test('all important TRMM actions require a confirmation dialog', () => {
  const reboot = getTrmmActionDialogConfig('reboot')
  const wol = getTrmmActionDialogConfig('wol')

  assert.equal(reboot.requiresConfirmation, true)
  assert.equal(reboot.requiresReason, true)
  assert.equal(wol.requiresConfirmation, true)
  assert.equal(wol.requiresReason, false)
})
