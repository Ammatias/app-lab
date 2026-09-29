import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const apiSource = await readFile(new URL('../../../entities/file-storage/api.js', import.meta.url), 'utf8')
const pageSource = await readFile(new URL('../components/FileStoragePage.jsx', import.meta.url), 'utf8')
const modalSource = await readFile(new URL('../components/FileStorageCreateModal.jsx', import.meta.url), 'utf8')
const previewModalSource = await readFile(new URL('../components/FileStoragePreviewModal.jsx', import.meta.url), 'utf8')
const stylesSource = await readFile(new URL('../components/fileStorage.css', import.meta.url), 'utf8')

test('file storage exposes an authenticated metadata update action in the UI contract', () => {
  assert.match(apiSource, /export async function updateFileStorageBlock/)
  assert.match(apiSource, /method:\s*'PATCH'/)
  assert.match(pageSource, /file-storage-block-actions/)
  assert.match(pageSource, /Pencil/)
})

test('editing can move a block to any file storage section', () => {
  assert.match(apiSource, /formData\.append\('section', section\)/)
  assert.match(modalSource, />Раздел</)
  assert.match(modalSource, /value="backups"/)
  assert.match(pageSource, /label:\s*'Бэкапы'/)
  assert.match(pageSource, /setSection\(updated\.section\)/)
})

test('file picker accepts every type and communicates the 50-file limit', () => {
  assert.doesNotMatch(modalSource, /accept=/)
  assert.match(modalSource, /Любые типы файлов/)
  assert.match(modalSource, /до 50 файлов/)
})

test('block actions stay in normal flow and wrap instead of overlapping file downloads', () => {
  assert.match(stylesSource, /\.file-storage-block-actions\s*{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap/s)
  assert.doesNotMatch(stylesSource, /\.file-storage-delete\s*{[^}]*position:\s*absolute/s)
})

test('edit modal replaces individual documents only when the form is saved', () => {
  assert.match(apiSource, /replacement_\$\{fileId\}/)
  assert.match(modalSource, /Заменить/)
  assert.match(modalSource, /listFileStorageReplacements/)
})

test('edit modal actions keep a visible gap between cancel and save', () => {
  assert.match(stylesSource, /\.file-storage-modal-actions\s*{[^}]*gap:\s*(?:10|12)px/s)
})

test('file picker communicates the 50 MB per-document limit', () => {
  assert.match(modalSource, /до 50 МБ каждый/)
})

test('each document block has a direct expand and collapse control', () => {
  assert.match(pageSource, /Показать ещё/)
  assert.match(pageSource, /Свернуть/)
  assert.match(pageSource, /aria-expanded/)
})

test('previewable documents open in a dedicated modal with fullscreen and download fallbacks', () => {
  assert.match(apiSource, /fetchFileStoragePreview/)
  assert.match(apiSource, /\/preview/)
  assert.match(pageSource, /canPreviewFileStorageFile/)
  assert.match(pageSource, /FileStoragePreviewModal/)
  assert.match(pageSource, />\s*Открыть\s*</)
  assert.match(previewModalSource, /requestFullscreen/)
  assert.match(previewModalSource, /from 'react-pdf'/)
  assert.match(previewModalSource, /role="progressbar"/)
  assert.match(apiSource, /readPdfResponseWithProgress/)
  assert.match(previewModalSource, /Не удалось сформировать предпросмотр/)
  assert.match(previewModalSource, /Скачать оригинал/)
  assert.match(stylesSource, /\.file-storage-preview-modal/)
  assert.match(stylesSource, /\.file-storage-preview-progress/)
  assert.match(stylesSource, /100dvh/)
})

test('document preview exposes zoom, rotate, fit-width and selectable text controls', () => {
  assert.match(previewModalSource, /Уменьшить масштаб/)
  assert.match(previewModalSource, /Увеличить масштаб/)
  assert.match(previewModalSource, /Вписать страницу по ширине/)
  assert.match(previewModalSource, /Повернуть по часовой стрелке/)
  assert.match(previewModalSource, /getPreviewZoomForShortcut/)
  assert.match(previewModalSource, /passive:\s*false/)
  assert.match(previewModalSource, /renderTextLayer/)
  assert.match(previewModalSource, /scale=\{zoom\}/)
  assert.match(stylesSource, /\.file-storage-preview-controls/)
  assert.match(stylesSource, /user-select:\s*text/)
})
