import test from 'node:test'
import assert from 'node:assert/strict'

import {
  canPreviewFileStorageFile,
  FILE_STORAGE_MAX_FILE_SIZE,
  FILE_STORAGE_MAX_FILES,
  getFileStorageFileList,
  getFileStorageValidationError,
  listFileStorageReplacements,
  normalizeFileStorageSection
} from './fileStorage.js'

const makeFile = (name, type, size = 1024) => ({ name, type, size })

test('file storage previews PDF and common Office documents only', () => {
  for (const fileName of ['manual.pdf', 'letter.doc', 'letter.DOCX', 'table.xls', 'table.XLSX']) {
    assert.equal(canPreviewFileStorageFile(fileName), true, fileName)
  }
  for (const fileName of ['archive.zip', 'installer.exe', 'notes.txt', 'document']) {
    assert.equal(canPreviewFileStorageFile(fileName), false, fileName)
  }
})

test('file storage keeps the three supported sections', () => {
  assert.equal(normalizeFileStorageSection('ttx'), 'ttx')
  assert.equal(normalizeFileStorageSection('instructions'), 'instructions')
  assert.equal(normalizeFileStorageSection('backups'), 'backups')
  assert.equal(normalizeFileStorageSection('unknown'), 'ttx')
})

test('file storage accepts every non-empty file type', () => {
  const files = [
    makeFile('installer.exe', 'application/x-msdownload'),
    makeFile('design.psd', 'image/vnd.adobe.photoshop'),
    makeFile('database', 'application/octet-stream'),
    makeFile('custom.unknown', 'application/x-custom')
  ]

  assert.equal(getFileStorageValidationError({ title: 'Экран', files }), '')
  assert.equal(FILE_STORAGE_MAX_FILE_SIZE, 50 * 1024 * 1024)
  assert.equal(
    getFileStorageValidationError({
      title: 'Большой документ',
      files: [makeFile('manual.pdf', 'application/pdf', 40 * 1024 * 1024)]
    }),
    ''
  )
})

test('file storage accepts arbitrary formats in every section', () => {
  const archives = [
    makeFile('backup.zip', 'application/zip'),
    makeFile('backup.rar', 'application/vnd.rar'),
    makeFile('backup.7z', 'application/x-7z-compressed'),
    makeFile('backup.tar.gz', 'application/gzip'),
    makeFile('backup.tgz', 'application/gzip'),
    makeFile('backup.tar.bz2', 'application/x-bzip2'),
    makeFile('backup.tar.xz', 'application/x-xz')
  ]

  for (const section of ['ttx', 'instructions', 'backups']) {
    assert.equal(getFileStorageValidationError({ title: section, files: archives }), '')
  }
})

test('file storage requires files and limits each block to 50 files', () => {
  assert.equal(
    getFileStorageValidationError({ title: '', files: [makeFile('manual.pdf', 'application/pdf')] }),
    'Укажите название блока'
  )
  assert.equal(
    getFileStorageValidationError({ title: 'Инструкция', files: [] }),
    'Добавьте хотя бы один файл'
  )
  assert.equal(
    getFileStorageValidationError({
      title: 'Комплект инструкций',
      files: Array.from({ length: FILE_STORAGE_MAX_FILES }, (_, index) => makeFile(`${index}.bin`, 'application/octet-stream'))
    }),
    ''
  )
  assert.equal(
    getFileStorageValidationError({
      title: 'Слишком много файлов',
      files: Array.from({ length: FILE_STORAGE_MAX_FILES + 1 }, (_, index) => makeFile(`${index}.bin`, 'application/octet-stream'))
    }),
    'В одном блоке можно загрузить не более 50 файлов'
  )
  assert.equal(
    getFileStorageValidationError({
      title: 'Большой файл',
      files: [makeFile('manual.pdf', 'application/pdf', FILE_STORAGE_MAX_FILE_SIZE + 1)]
    }),
    'Файл «manual.pdf» больше 50 МБ'
  )
})

test('document list shows two files until its block is expanded', () => {
  const files = Array.from({ length: 5 }, (_, index) => ({ id: index + 1 }))

  assert.deepEqual(getFileStorageFileList(files, false), {
    visibleFiles: files.slice(0, 2),
    hiddenCount: 3
  })
  assert.deepEqual(getFileStorageFileList(files, true), {
    visibleFiles: files,
    hiddenCount: 0
  })
})

test('editing block metadata does not require uploading the files again', () => {
  assert.equal(
    getFileStorageValidationError({
      title: 'Обновлённые характеристики экрана',
      description: 'Файлы остаются в блоке без изменений',
      files: [],
      requireFiles: false
    }),
    ''
  )
})

test('editing sends only valid selected document replacements', () => {
  const replacement = makeFile('updated-spec.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

  assert.deepEqual(
    listFileStorageReplacements({ 12: replacement, invalid: replacement, 15: null }),
    [{ fileId: 12, file: replacement }]
  )
  assert.equal(
    getFileStorageValidationError({ title: 'Экран', files: [replacement], requireFiles: false }),
    ''
  )
})
