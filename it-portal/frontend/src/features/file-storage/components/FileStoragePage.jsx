import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Download, Eye, FileText, FolderArchive, Pencil, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  createFileStorageBlock,
  deleteFileStorageBlock,
  downloadFileStorageFile,
  fetchFileStorageBlocks,
  updateFileStorageBlock
} from '../../../entities/file-storage/api'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { LoadingState } from '../../../shared/ui/LoadingState'
import { UtilityPageShell } from '../../../shared/ui/UtilityPageShell'
import { FileStorageBlockModal } from './FileStorageCreateModal'
import { FileStoragePreviewModal } from './FileStoragePreviewModal'
import { canPreviewFileStorageFile, formatFileSize, getFileExtension, getFileStorageFileList } from '../lib/fileStorage'
import './fileStorage.css'

const SECTION_META = {
  ttx: {
    label: 'ТТХ',
    empty: 'В разделе ТТХ пока нет документов.'
  },
  instructions: {
    label: 'Инструкции',
    empty: 'В разделе инструкций пока нет документов.'
  },
  backups: {
    label: 'Бэкапы',
    empty: 'В разделе бэкапов пока нет архивов.'
  }
}

const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function FileStoragePage() {
  const [section, setSection] = useState('ttx')
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [previewTarget, setPreviewTarget] = useState(null)
  const [expandedBlockIds, setExpandedBlockIds] = useState(() => new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchFileStorageBlocks()
      .then((data) => {
        if (!cancelled) setBlocks(Array.isArray(data) ? data : [])
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || 'Не удалось загрузить файлохранилище')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const visibleBlocks = useMemo(
    () => blocks.filter((block) => block.section === section),
    [blocks, section]
  )

  const handleCreate = async (payload) => {
    setSaving(true)
    try {
      const created = await createFileStorageBlock(payload)
      setBlocks((current) => [created, ...current])
      setCreateOpen(false)
      setError('')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteFileStorageBlock(deleteTarget.id)
      setBlocks((current) => current.filter((block) => block.id !== deleteTarget.id))
      setExpandedBlockIds((current) => {
        const next = new Set(current)
        next.delete(deleteTarget.id)
        return next
      })
      setDeleteTarget(null)
      setError('')
    } catch (deleteError) {
      setError(deleteError.message || 'Не удалось удалить блок')
    } finally {
      setDeleting(false)
    }
  }

  const handleUpdate = async (payload) => {
    if (!editTarget) return
    setSaving(true)
    try {
      const updated = await updateFileStorageBlock(editTarget.id, payload)
      setBlocks((current) => current.map((block) => (
        block.id === updated.id ? updated : block
      )))
      setSection(updated.section)
      setEditTarget(null)
      setError('')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async (file) => {
    try {
      await downloadFileStorageFile(file)
      setError('')
    } catch (downloadError) {
      setError(downloadError.message || 'Не удалось скачать файл')
    }
  }

  const toggleBlockFiles = (blockId) => {
    setExpandedBlockIds((current) => {
      const next = new Set(current)
      if (next.has(blockId)) next.delete(blockId)
      else next.add(blockId)
      return next
    })
  }

  return (
    <UtilityPageShell
      eyebrow="Документы"
      title="Файлохранилище"
      description="Технические характеристики, инструкции и резервные копии в одном месте."
      maxWidth="1320px"
      actions={(
        <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={18} /> Новый блок
        </button>
      )}
    >
      <section className="glass-panel file-storage-workspace">
        <div className="file-storage-tabs" role="tablist" aria-label="Разделы файлохранилища">
          {Object.entries(SECTION_META).map(([key, meta]) => {
            const blockCount = blocks.filter((block) => block.section === key).length
            return (
              <button
                type="button"
                role="tab"
                aria-selected={section === key}
                aria-label={`${meta.label}, блоков: ${blockCount}`}
                className={`file-storage-tab ${section === key ? 'is-active' : ''}`}
                key={key}
                onClick={() => setSection(key)}
              >
                {meta.label}
                <span aria-hidden="true">{blockCount}</span>
              </button>
            )
          })}
        </div>

        {error ? (
          <div className="file-storage-page-error" role="alert">{error}</div>
        ) : null}

        {loading ? (
          <LoadingState padding="70px" />
        ) : visibleBlocks.length ? (
          <motion.div
            className="file-storage-block-list"
            key={section}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {visibleBlocks.map((block) => {
              const expanded = expandedBlockIds.has(block.id)
              const { visibleFiles } = getFileStorageFileList(block.files, expanded)
              return (
                <article className="file-storage-block" key={block.id}>
                <div className="file-storage-block-copy">
                  <div className="file-storage-block-title-row">
                    <FolderArchive size={19} />
                    <h2>{block.title}</h2>
                  </div>
                  {block.description ? <p>{block.description}</p> : null}
                  <span className="file-storage-block-meta">
                    {block.files.length} файл{block.files.length === 1 ? '' : block.files.length < 5 ? 'а' : 'ов'}
                    {block.created_by ? ` · ${block.created_by}` : ''}
                    {block.created_at ? ` · ${formatDate(block.created_at)}` : ''}
                  </span>
                  <div className="file-storage-block-actions">
                    <button
                      type="button"
                      className="btn file-storage-edit"
                      onClick={() => setEditTarget(block)}
                    >
                      <Pencil size={16} /> Редактировать
                    </button>
                    <button
                      type="button"
                      className="btn file-storage-delete"
                      onClick={() => setDeleteTarget(block)}
                    >
                      <Trash2 size={16} /> Удалить
                    </button>
                  </div>
                </div>

                <div className="file-storage-files">
                  <div className="file-storage-file-items" id={`file-storage-files-${block.id}`}>
                    {visibleFiles.map((file) => (
                      <div className="file-storage-file" key={file.id}>
                        <span className="file-storage-file-icon"><FileText size={18} /></span>
                        <div className="file-storage-file-copy">
                          <strong>{file.file_name}</strong>
                          <span>{getFileExtension(file.file_name).toUpperCase()} · {formatFileSize(file.byte_size)}</span>
                        </div>
                        <div className="file-storage-file-actions">
                          {canPreviewFileStorageFile(file.file_name) ? (
                            <button type="button" className="btn" onClick={() => setPreviewTarget(file)}>
                              <Eye size={16} /> Открыть
                            </button>
                          ) : null}
                          <button type="button" className="btn" onClick={() => handleDownload(file)}>
                            <Download size={16} /> Скачать
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {block.files.length > 2 ? (
                    <button
                      type="button"
                      className="btn file-storage-files-toggle"
                      aria-expanded={expanded}
                      aria-controls={`file-storage-files-${block.id}`}
                      onClick={() => toggleBlockFiles(block.id)}
                    >
                      {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {expanded ? 'Свернуть' : `Показать ещё ${block.files.length - 2}`}
                    </button>
                  ) : null}
                </div>
              </article>
              )
            })}
          </motion.div>
        ) : (
          <EmptyState style={{ padding: '64px 20px' }}>{SECTION_META[section].empty}</EmptyState>
        )}
      </section>

      <FileStorageBlockModal
        open={createOpen || Boolean(editTarget)}
        section={editTarget?.section || section}
        block={editTarget}
        saving={saving}
        onClose={() => {
          setCreateOpen(false)
          setEditTarget(null)
        }}
        onSubmit={editTarget ? handleUpdate : handleCreate}
      />

      <FileStoragePreviewModal
        open={Boolean(previewTarget)}
        file={previewTarget}
        onClose={() => setPreviewTarget(null)}
        onDownload={handleDownload}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => { if (!deleting) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Удалить блок документов?"
        description={`Блок «${deleteTarget?.title || ''}» и все его файлы будут удалены без возможности восстановления.`}
        confirmDisabled={deleting}
        cancelDisabled={deleting}
        confirmLabel={deleting ? 'Удаление...' : 'Удалить'}
      />
    </UtilityPageShell>
  )
}
