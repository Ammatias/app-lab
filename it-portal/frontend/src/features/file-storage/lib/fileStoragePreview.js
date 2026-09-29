import { getFileExtension } from './fileStorage.js'

const OFFICE_PREVIEW_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx'])
const PDF_SIGNATURE = '%PDF-'

export const PREVIEW_ZOOM_MIN = 0.5
export const PREVIEW_ZOOM_MAX = 2.5
export const PREVIEW_ZOOM_STEP = 0.25

function isOfficePreview(fileName) {
  return OFFICE_PREVIEW_EXTENSIONS.has(getFileExtension(fileName))
}

export function getInitialPreviewProgress(fileName) {
  return isOfficePreview(fileName)
    ? { percent: 20, label: 'Конвертируем в PDF' }
    : { percent: 5, label: 'Загружаем PDF' }
}

function getDownloadProgress(fileName, loadedBytes, totalBytes) {
  const startPercent = isOfficePreview(fileName) ? 70 : 10
  if (!Number.isFinite(totalBytes) || totalBytes <= 0) return startPercent
  const fraction = Math.min(1, Math.max(0, loadedBytes / totalBytes))
  return Math.round(startPercent + fraction * (94 - startPercent))
}

export function getPageRenderProgress(renderedPages, totalPages) {
  if (!Number.isFinite(totalPages) || totalPages <= 0) return 96
  const fraction = Math.min(1, Math.max(0, renderedPages / totalPages))
  return Math.min(100, Math.floor(96 + fraction * 4))
}

export function clampPreviewZoom(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return 1
  const roundedValue = Math.round(numericValue * 100) / 100
  return Math.min(PREVIEW_ZOOM_MAX, Math.max(PREVIEW_ZOOM_MIN, roundedValue))
}

export function stepPreviewZoom(currentZoom, direction, step = PREVIEW_ZOOM_STEP) {
  const normalizedDirection = Number(direction) < 0 ? -1 : 1
  return clampPreviewZoom(clampPreviewZoom(currentZoom) + normalizedDirection * step)
}

export function getPreviewZoomForShortcut(event, currentZoom) {
  if (!event?.ctrlKey && !event?.metaKey) return null
  if (event.key === '+' || event.key === '=') return stepPreviewZoom(currentZoom, 1)
  if (event.key === '-' || event.key === '_') return stepPreviewZoom(currentZoom, -1)
  if (event.key === '0') return 1
  return null
}

export function nextPreviewRotation(currentRotation) {
  const normalizedRotation = Number.isFinite(Number(currentRotation))
    ? Math.round(Number(currentRotation) / 90) * 90
    : 0
  return ((normalizedRotation + 90) % 360 + 360) % 360
}

export async function readPdfResponseWithProgress(response, { fileName = '', onProgress } = {}) {
  const contentType = response.headers.get('Content-Type')?.toLowerCase() || ''
  if (!contentType.startsWith('application/pdf')) {
    throw new Error('Сервис предпросмотра вернул неподдерживаемый формат')
  }

  const rawContentLength = Number(response.headers.get('Content-Length'))
  const totalBytes = Number.isFinite(rawContentLength) && rawContentLength > 0
    ? rawContentLength
    : 0
  const reader = response.body?.getReader()
  const chunks = []
  let loadedBytes = 0

  onProgress?.({
    percent: getDownloadProgress(fileName, loadedBytes, totalBytes),
    label: 'Загружаем PDF',
    loadedBytes,
    totalBytes
  })

  if (reader) {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      loadedBytes += value.byteLength
      onProgress?.({
        percent: getDownloadProgress(fileName, loadedBytes, totalBytes),
        label: 'Загружаем PDF',
        loadedBytes,
        totalBytes
      })
    }
  } else {
    const bytes = new Uint8Array(await response.arrayBuffer())
    chunks.push(bytes)
    loadedBytes = bytes.byteLength
  }

  const blob = new Blob(chunks, { type: 'application/pdf' })
  const signature = new TextDecoder().decode(await blob.slice(0, PDF_SIGNATURE.length).arrayBuffer())
  if (signature !== PDF_SIGNATURE) {
    throw new Error('Сервис предпросмотра вернул некорректный PDF')
  }

  onProgress?.({
    percent: 94,
    label: 'Проверяем PDF',
    loadedBytes,
    totalBytes: totalBytes || loadedBytes
  })
  return blob
}
