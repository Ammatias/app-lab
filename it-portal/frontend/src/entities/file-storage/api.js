export async function fetchFileStorageBlocks() {
  const response = await fetch('/api/file-storage/blocks')
  if (!response.ok) throw new Error(await response.text() || 'Не удалось загрузить файлохранилище')
  return response.json()
}

export async function createFileStorageBlock({ section, title, description, files }) {
  const formData = new FormData()
  formData.append('section', section)
  formData.append('title', title)
  formData.append('description', description)
  files.forEach((file) => formData.append('files', file, file.name))

  const response = await fetch('/api/file-storage/blocks', {
    method: 'POST',
    body: formData
  })
  if (!response.ok) throw new Error(await response.text() || 'Не удалось создать блок')
  return response.json()
}

export async function updateFileStorageBlock(blockId, { section, title, description, replacements = [] }) {
  const formData = new FormData()
  formData.append('section', section)
  formData.append('title', title)
  formData.append('description', description)
  replacements.forEach(({ fileId, file }) => {
    formData.append(`replacement_${fileId}`, file, file.name)
  })

  const response = await fetch(`/api/file-storage/blocks/${blockId}`, {
    method: 'PATCH',
    body: formData
  })
  if (!response.ok) throw new Error(await response.text() || 'Не удалось сохранить блок')
  return response.json()
}

export async function deleteFileStorageBlock(blockId) {
  const response = await fetch(`/api/file-storage/blocks/${blockId}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await response.text() || 'Не удалось удалить блок')
}

export async function downloadFileStorageFile(file) {
  const response = await fetch(`/api/file-storage/files/${file.id}/download`)
  if (!response.ok) throw new Error(await response.text() || 'Не удалось скачать файл')

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = file.file_name || 'document'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}

export async function fetchFileStoragePreview(file, { signal, onProgress } = {}) {
  const response = await fetch(`/api/file-storage/files/${file.id}/preview`, {
    headers: { Accept: 'application/pdf' },
    signal
  })
  if (!response.ok) {
    throw new Error(await response.text() || 'Не удалось сформировать предпросмотр')
  }

  return readPdfResponseWithProgress(response, {
    fileName: file.file_name,
    onProgress
  })
}
import { readPdfResponseWithProgress } from '../../features/file-storage/lib/fileStoragePreview'
