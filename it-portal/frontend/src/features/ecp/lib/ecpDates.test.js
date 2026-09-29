import assert from 'node:assert/strict'
import test from 'node:test'

import { getEcpEffectiveValidUntil } from './ecpDates.js'

test('uses the private key date when it expires earlier', () => {
  assert.equal(getEcpEffectiveValidUntil('12.08.2027', '20.05.2026'), '20.05.2026')
})

test('uses the public key date when it expires earlier', () => {
  assert.equal(getEcpEffectiveValidUntil('28.07.2027', '30.07.2027'), '28.07.2027')
})

test('falls back to whichever valid date is available', () => {
  assert.equal(getEcpEffectiveValidUntil('', '22.09.2027'), '22.09.2027')
  assert.equal(getEcpEffectiveValidUntil('31.10.2027', 'not-a-date'), '31.10.2027')
})

test('returns an empty value when neither date is valid', () => {
  assert.equal(getEcpEffectiveValidUntil('', null), '')
})
