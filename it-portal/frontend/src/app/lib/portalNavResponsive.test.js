import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const themeCss = await readFile(new URL('../../shared/styles/theme.css', import.meta.url), 'utf8')
const appShellSource = await readFile(new URL('../AppShell.jsx', import.meta.url), 'utf8')
const routesSource = await readFile(new URL('../routes.jsx', import.meta.url), 'utf8')
const navOrderSource = await readFile(new URL('../hooks/usePortalNavOrder.js', import.meta.url), 'utf8')

const sliceMediaBlock = (query, source = themeCss) => {
  const start = source.lastIndexOf(`@media (${query})`)
  assert.notEqual(start, -1, `Missing media query: ${query}`)
  return source.slice(start)
}

test('tablet navigation wraps instead of widening the page', () => {
  const tabletCss = sliceMediaBlock('max-width: 1180px')

  assert.match(tabletCss, /\.portal-nav\s*{[^}]*flex-wrap:\s*wrap/s)
  assert.match(tabletCss, /\.portal-nav\s*{[^}]*max-width:\s*100%/s)
})

test('phone navigation contains long labels inside its two-column grid', () => {
  const mobileCss = sliceMediaBlock('max-width: 720px')

  assert.match(mobileCss, /\.portal-header-row,[\s\S]*\.portal-user-action\s*{[^}]*min-width:\s*0/s)
  assert.match(mobileCss, /\.nav-btn,[\s\S]*\.icon-nav-btn\s*{[^}]*display:\s*grid/s)
  assert.match(mobileCss, /grid-template-columns:\s*34px\s+minmax\(0,\s*1fr\)/)
  assert.match(mobileCss, /overflow-wrap:\s*anywhere/)
})

test('file storage keeps the full desktop label and uses a compact phone label', () => {
  assert.match(appShellSource, /label:\s*'Файлохранилище'/)
  assert.match(appShellSource, /mobileLabel:\s*'Файлы'/)
  assert.match(appShellSource, /data-has-mobile-label/)
  assert.match(themeCss, /\.nav-btn-mobile-label\s*{[^}]*display:\s*none/s)
})

test('museum map is a lazy main navigation route at the far left', () => {
  assert.match(routesSource, /'museum-map':\s*\{[\s\S]*?path:\s*'\/museum-map'/)
  assert.match(routesSource, /'museum-map':\s*lazy\(\(\)\s*=>\s*import\('\.\.\/features\/museum-map\/components\/MuseumMapPage\.jsx'\)\)/)
  assert.match(appShellSource, /'museum-map':\s*\{[^}]*label:\s*'Карта'/)
  assert.match(navOrderSource, /DEFAULT_PORTAL_NAV_ORDER\s*=\s*\[\s*\n\s*'museum-map'/)
})
