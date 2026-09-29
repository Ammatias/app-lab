import test from 'node:test'
import assert from 'node:assert/strict'

import { groupInventoryModels } from './inventoryGrouping.js'

test('groups only models that already share one canonical cartridge type', () => {
  const groups = groupInventoryModels([
    {
      id: 1,
      name: '106R03623',
      cartridge_type_name: 'RTC 106R03623',
      refilled_count: 7,
      new_count: 0,
      printer_count: 2
    },
    {
      id: 2,
      name: 'RTC 106R03623',
      cartridge_type_name: 'RTC 106R03623',
      refilled_count: 1,
      new_count: 0,
      printer_count: 2
    }
  ])

  assert.equal(groups.length, 1)
  assert.equal(groups[0].name, 'RTC 106R03623')
  assert.equal(groups[0].total_refilled, 8)
  assert.equal(groups[0].printer_count, 2)
})

test('does not hide a missing backend alias with a model-specific UI hack', () => {
  const groups = groupInventoryModels([
    {
      id: 1,
      name: '106R03623',
      cartridge_type_name: '106R03623',
      refilled_count: 7,
      new_count: 0,
      printer_count: 0
    },
    {
      id: 2,
      name: 'RTC 106R03623',
      cartridge_type_name: 'RTC 106R03623',
      refilled_count: 1,
      new_count: 0,
      printer_count: 2
    }
  ])

  assert.deepEqual(groups.map((group) => group.name), ['106R03623', 'RTC 106R03623'])
})
