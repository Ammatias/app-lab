import test from 'node:test'
import assert from 'node:assert/strict'

import {
  clampPreviewZoom,
  getPreviewZoomForShortcut,
  getInitialPreviewProgress,
  getPageRenderProgress,
  nextPreviewRotation,
  PREVIEW_ZOOM_MAX,
  PREVIEW_ZOOM_MIN,
  readPdfResponseWithProgress
} from './fileStoragePreview.js'

test('Office preview starts with an honest conversion milestone', () => {
  assert.deepEqual(getInitialPreviewProgress('report.docx'), {
    percent: 20,
    label: 'Конвертируем в PDF'
  })
  assert.deepEqual(getInitialPreviewProgress('table.xlsx'), {
    percent: 20,
    label: 'Конвертируем в PDF'
  })
})

test('PDF preview skips the conversion milestone', () => {
  assert.deepEqual(getInitialPreviewProgress('manual.pdf'), {
    percent: 5,
    label: 'Загружаем PDF'
  })
})

test('preview download reports exact byte-based progress', async () => {
  const payload = new TextEncoder().encode('%PDF-preview-data')
  const firstChunk = payload.slice(0, 8)
  const secondChunk = payload.slice(8)
  const response = new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(firstChunk)
      controller.enqueue(secondChunk)
      controller.close()
    }
  }), {
    headers: {
      'Content-Length': String(payload.byteLength),
      'Content-Type': 'application/pdf'
    }
  })
  const updates = []

  const blob = await readPdfResponseWithProgress(response, {
    fileName: 'report.docx',
    onProgress: (progress) => updates.push(progress)
  })

  assert.equal(blob.type, 'application/pdf')
  assert.equal(await blob.text(), '%PDF-preview-data')
  assert.equal(updates.at(-1).percent, 94)
  assert.equal(updates.at(-1).loadedBytes, payload.byteLength)
  assert.equal(updates.at(-1).totalBytes, payload.byteLength)
  assert.ok(updates.some((progress) => progress.percent > 70 && progress.percent < 94))
})

test('preview download rejects a non-PDF payload even with a PDF content type', async () => {
  const response = new Response('not a pdf', {
    headers: { 'Content-Type': 'application/pdf' }
  })

  await assert.rejects(
    readPdfResponseWithProgress(response, { fileName: 'broken.xlsx' }),
    /некорректный PDF/
  )
})

test('render progress reaches 100 only after every PDF page is rendered', () => {
  assert.equal(getPageRenderProgress(0, 10), 96)
  assert.equal(getPageRenderProgress(5, 10), 98)
  assert.equal(getPageRenderProgress(9, 10), 99)
  assert.equal(getPageRenderProgress(10, 10), 100)
})

test('preview zoom stays between 50 and 250 percent', () => {
  assert.equal(clampPreviewZoom(0.1), PREVIEW_ZOOM_MIN)
  assert.equal(clampPreviewZoom(1.25), 1.25)
  assert.equal(clampPreviewZoom(8), PREVIEW_ZOOM_MAX)
})

test('preview keyboard shortcuts change and reset zoom only with a control modifier', () => {
  assert.equal(getPreviewZoomForShortcut({ ctrlKey: true, key: '+' }, 1), 1.25)
  assert.equal(getPreviewZoomForShortcut({ ctrlKey: true, key: '=' }, 1), 1.25)
  assert.equal(getPreviewZoomForShortcut({ metaKey: true, key: '-' }, 1), 0.75)
  assert.equal(getPreviewZoomForShortcut({ ctrlKey: true, key: '0' }, 1.75), 1)
  assert.equal(getPreviewZoomForShortcut({ key: '+' }, 1), null)
  assert.equal(getPreviewZoomForShortcut({ ctrlKey: true, key: 'c' }, 1), null)
})

test('preview rotation advances clockwise and wraps after a full turn', () => {
  assert.equal(nextPreviewRotation(0), 90)
  assert.equal(nextPreviewRotation(90), 180)
  assert.equal(nextPreviewRotation(270), 0)
})
