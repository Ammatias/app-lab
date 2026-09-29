export const FILE_STORAGE_MAX_FILE_SIZE = 50 * 1024 * 1024
export const FILE_STORAGE_MAX_FILES = 50

export function normalizeFileStorageSection(value) {
  return ['ttx', 'instructions', 'backups'].includes(value) ? value : 'ttx'
}

export function getFileExtension(fileName) {
  const match = String(fileName || '').trim().toLowerCase().match(/\.([^.]+)$/)
  return match?.[1] || ''
}

export function canPreviewFileStorageFile(fileName) {
  return ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(getFileExtension(fileName))
}

export function formatFileSize(value) {
  const bytes = Number(value) || 0
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export function getFileStorageValidationError({ title, description = '', files = [], requireFiles = true }) {
  if (!String(title || '').trim()) return 'Укажите название блока'
  if (String(title).trim().length > 160) return 'Название должно быть не длиннее 160 символов'
  if (String(description).trim().length > 600) return 'Описание должно быть не длиннее 600 символов'
  if (requireFiles && !files.length) return 'Добавьте хотя бы один файл'
  if (files.length > FILE_STORAGE_MAX_FILES) return 'В одном блоке можно загрузить не более 50 файлов'
  for (const file of files) {
    if ((Number(file?.size) || 0) > FILE_STORAGE_MAX_FILE_SIZE) {
      return `Файл «${file.name}» больше 50 МБ`
    }
  }

  return ''
}

export function mergeSelectedFiles(currentFiles, incomingFiles) {
  const merged = [...currentFiles]
  for (const file of incomingFiles) {
    const duplicate = merged.some((item) => (
      item.name === file.name
      && item.size === file.size
      && item.lastModified === file.lastModified
    ))
    if (!duplicate) merged.push(file)
  }
  return merged
}

export function listFileStorageReplacements(replacements = {}) {
  return Object.entries(replacements).flatMap(([rawFileId, file]) => {
    const fileId = Number(rawFileId)
    if (!Number.isInteger(fileId) || fileId <= 0 || !file) return []
    return [{ fileId, file }]
  })
}

export function getFileStorageFileList(files = [], expanded = false) {
  const normalizedFiles = Array.isArray(files) ? files : []
  if (expanded || normalizedFiles.length <= 2) {
    return { visibleFiles: normalizedFiles, hiddenCount: 0 }
  }
  return {
    visibleFiles: normalizedFiles.slice(0, 2),
    hiddenCount: normalizedFiles.length - 2
  }
}
