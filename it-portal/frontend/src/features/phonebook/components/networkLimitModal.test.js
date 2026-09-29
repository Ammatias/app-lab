import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const tableSource = await readFile(new URL('./PhonebookTable.jsx', import.meta.url), 'utf8')
const modalSource = await readFile(new URL('./NetworkLimitModal.jsx', import.meta.url), 'utf8')
const themeCss = await readFile(new URL('../../../shared/styles/theme.css', import.meta.url), 'utf8')
const modalCss = await readFile(new URL('../styles/network-modals.css', import.meta.url), 'utf8')
const layoutCss = await readFile(new URL('../styles/phonebook-layout.css', import.meta.url), 'utf8')
const homeCss = await readFile(new URL('../../home/styles/home.css', import.meta.url), 'utf8')

test('TRMM uses one compact modal trigger instead of an inline limit form', () => {
  assert.doesNotMatch(tableSource, /NetworkLimitControl/)
  assert.match(tableSource, /className={`phonebook-network-limit-trigger/)
  assert.match(tableSource, /<NetworkLimitModal[\s\S]*contact={networkLimitContact}/)
  assert.match(homeCss, /\.phonebook-network-limit-trigger\s*{[^}]*min-width:\s*28px[^}]*height:\s*28px/s)
})

test('network limit modal supports presets, custom values, updates and removal', () => {
  assert.match(modalSource, /const LIMIT_PRESETS = \[1, 5, 10, 20, 50, 100\]/)
  assert.match(modalSource, /min="1"[\s\S]*max="1000"/)
  assert.match(modalSource, /await onApply\?\.\(contact, limit\)/)
  assert.match(modalSource, /await onClear\?\.\(contact\)/)
  assert.match(modalSource, /role="dialog"[\s\S]*aria-modal="true"/)
})

test('phonebook owns aligned network layout and modal styles', () => {
  assert.match(layoutCss, /\.phonebook-trmm-network-row\s*{[^}]*justify-content:\s*flex-start/s)
  assert.match(modalCss, /\.network-limit-modal-header\s*{[^}]*justify-items:\s*center/s)
  assert.match(modalSource, /import '\.\.\/styles\/network-modals.css'/)
  assert.match(modalCss, /max-height:\s*calc\(100dvh - 40px\)/)
})
test('phonebook keeps the room and edit columns inset from panel edges', () => {
  assert.match(tableSource, /const edgePadding = 'clamp\(16px, 1\.3vw, 24px\)'/)
  assert.match(tableSource, /paddingLeft: column\.key === 'room' \? edgePadding : undefined/)
  assert.match(tableSource, /paddingRight: column\.key === 'actions' \? edgePadding : undefined/)
  assert.match(tableSource, /paddingLeft: edgePadding, fontWeight: '500'/)
  assert.match(tableSource, /paddingRight: edgePadding, textAlign: 'right'/)
})
