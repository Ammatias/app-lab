import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildAccountableSummary,
  getAccountableWriteoffStatus,
  getSelectableWriteoffAssets
} from './accountablePresentation.js'

const assets = [
  { id: 1, is_written_off: false, writeoff_status: 'active', location_text: '101', locations: [] },
  { id: 2, is_written_off: false, writeoff_status: 'pending', location_text: '', locations: [] },
  { id: 3, is_written_off: true, writeoff_status: 'active', location_text: '102', locations: [] }
]

test('keeps imported writeoff rows visible while excluding them from template writeoff', () => {
  assert.deepEqual(getSelectableWriteoffAssets(assets).map((asset) => asset.id), [1])
  assert.equal(getAccountableWriteoffStatus(assets[2]).label, 'Списано в XLSX')
  assert.equal(getAccountableWriteoffStatus(assets[2]).mode, 'written_off')
})

test('reports imported and completed writeoffs as separate business states', () => {
  assert.deepEqual(buildAccountableSummary(assets, [{ id: 20 }, { id: 21 }]), {
    total: 3,
    pending: 1,
    completed: 2,
    importedWrittenOff: 1,
    withoutLocation: 1
  })
})
