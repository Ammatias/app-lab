import assert from 'node:assert/strict'
import test from 'node:test'
import { diagnosticRows } from './ecpDiagnostic.js'

test('administrator sees the failed stage and exact runtime without raw secrets', () => {
  const rows = diagnosticRows({
    id: 'job', hostname: 'pc', diagnostic: { stage: 'receive-package', code: 'TRANSFER_INVALID', pin: 'secret' },
    runtime_environment: { endpoint: { os_version: '6.1.7601', powershell: '2.0', transport: 'trmm', token: 'secret' } }
  })
  assert.ok(rows.some(([, value]) => value === 'Передача пакета через TRMM'))
  assert.ok(rows.some(([, value]) => value === '2.0'))
  assert.ok(!JSON.stringify(rows).includes('secret'))
  assert.deepEqual(diagnosticRows(null), [])
  assert.deepEqual(diagnosticRows({ diagnostic: null }), [])
})
