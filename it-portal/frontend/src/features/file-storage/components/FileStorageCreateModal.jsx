import { useEffect, useRef, useState } from 'react'
import { FilePlus2, FileText, Pencil, RefreshCw, Save, Upload, X } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'
import {
  formatFileSize,
  getFileStorageValidationError,
  listFileStorageReplacements,
  mergeSelectedFiles
} from '../lib/fileStorage'

const SECTION_LABELS = {
  ttx: 'ТТХ',
  instructions: 'Инструкции',
  backups: 'Бэкапы'
}

const createEmptyDraft = (section) => ({ section, title: '', description: '', files: [], replacements: {} })

export function FileStorageBlockModal({ open, section, block, saving, onClose, onSubmit }) {
  const [draft, setDraft] = useState(() => createEmptyDraft(section))
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)
  const isEditing = Boolean(block)

  useEffect(() => {
    if (!open) return
    setDraft(block
      ? {
          section: block.section || section,
          title: block.title || '',
          description: block.description || '',
          files: [],
          replacements: {}
        }
      : createEmptyDraft(section))
    setError('')
    setDragActive(false)
  }, [block, open, section])

  const addFiles = (incomingFiles) => {
    setDraft((current) => {
      const files = mergeSelectedFiles(current.files, Array.from(incomingFiles || []))
      setError('')
      return { ...current, files }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const replacements = listFileStorageReplacements(draft.replacements)
    const filesToValidate = isEditing ? replacements.map(({ file }) => file) : draft.files
    const validationError = getFileStorageValidationError({
      ...draft,
      files: filesToValidate,
      requireFiles: !isEditing
    })
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    try {
      await onSubmit({ ...draft, replacements })
    } catch (submitError) {
      setError(submitError.message || (isEditing ? 'Не удалось сохранить блок' : 'Не удалось создать блок'))
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={saving ? () => {} : onClose}
      panelClassName="glass-panel file-storage-create-modal"
    >
      <form onSubmit={handleSubmit}>
        <div className="file-storage-modal-heading">
          <span className="file-storage-modal-icon">
            {isEditing ? <Pencil size={21} /> : <FilePlus2 size={22} />}
          </span>
          <div>
            <div className="portal-profile-modal-eyebrow">
              {SECTION_LABELS[draft.section] || SECTION_LABELS.ttx}
            </div>
            <h2>{isEditing ? 'Редактирование блока' : 'Новый блок документов'}</h2>
          </div>
          <button type="button" className="btn icon-btn" aria-label="Закрыть" onClick={onClose} disabled={saving}>
            <X size={18} />
          </button>
        </div>

        <div className="file-storage-form-grid">
          {isEditing ? (
            <label className="file-storage-field">
              <span>Раздел</span>
              <select
                className="input-glass"
                value={draft.section}
                onChange={(event) => setDraft((current) => ({ ...current, section: event.target.value }))}
              >
                <option value="ttx">ТТХ</option>
                <option value="instructions">Инструкции</option>
                <option value="backups">Бэкапы</option>
              </select>
            </label>
          ) : null}

          <label className="file-storage-field">
            <span>Название блока</span>
            <input
              className="input-glass"
              value={draft.title}
              maxLength={160}
              autoFocus
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Например, Интерактивная панель 86″"
            />
          </label>

          <label className="file-storage-field">
            <span>Краткое описание</span>
            <textarea
              className="input-glass"
              value={draft.description}
              maxLength={600}
              rows={3}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="Что находится внутри и для какого оборудования"
            />
          </label>

          {isEditing ? (
            <div className="file-storage-existing-files">
              <span className="file-storage-existing-files-label">Документы блока</span>
              {(block?.files || []).map((file) => {
                const replacement = draft.replacements[file.id]
                return (
                  <div className="file-storage-existing-file" key={file.id}>
                    <span className="file-storage-file-icon"><FileText size={17} /></span>
                    <div className="file-storage-existing-file-copy">
                      <strong>{file.file_name}</strong>
                      <span>
                        {replacement
                          ? `Будет заменён на ${replacement.name} · ${formatFileSize(replacement.size)}`
                          : `Текущий файл · ${formatFileSize(file.byte_size)}`}
                      </span>
                    </div>
                    <div className="file-storage-replacement-actions">
                      <label className="btn file-storage-replace-control">
                        <RefreshCw size={15} /> {replacement ? 'Выбрать другой' : 'Заменить'}
                        <input
                          type="file"
                          hidden
                          onChange={(event) => {
                            const nextFile = event.target.files?.[0]
                            if (nextFile) {
                              setDraft((current) => ({
                                ...current,
                                replacements: { ...current.replacements, [file.id]: nextFile }
                              }))
                              setError('')
                            }
                            event.target.value = ''
                          }}
                        />
                      </label>
                      {replacement ? (
                        <button
                          type="button"
                          className="btn icon-btn"
                          aria-label={`Отменить замену ${file.file_name}`}
                          onClick={() => setDraft((current) => {
                            const replacements = { ...current.replacements }
                            delete replacements[file.id]
                            return { ...current, replacements }
                          })}
                        >
                          <X size={15} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className={`file-storage-dropzone ${dragActive ? 'is-active' : ''}`}
              onDragEnter={(event) => { event.preventDefault(); setDragActive(true) }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setDragActive(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setDragActive(false)
                addFiles(event.dataTransfer.files)
              }}
            >
              <Upload size={24} />
              <strong>Перетащите файлы сюда</strong>
              <span>Любые типы файлов · до 50 файлов · до 50 МБ каждый</span>
              <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
                Выбрать файлы
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                hidden
                onChange={(event) => {
                  addFiles(event.target.files)
                  event.target.value = ''
                }}
              />
            </div>
          )}

          {!isEditing && draft.files.length ? (
            <div className="file-storage-selected-files" aria-label="Выбранные файлы">
              {draft.files.map((file, index) => (
                <div className="file-storage-selected-file" key={`${file.name}-${file.size}-${index}`}>
                  <span className="file-storage-selected-name">{file.name}</span>
                  <span>{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    className="btn icon-btn"
                    aria-label={`Убрать ${file.name}`}
                    onClick={() => setDraft((current) => ({
                      ...current,
                      files: current.files.filter((_, fileIndex) => fileIndex !== index)
                    }))}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {error ? <div className="file-storage-form-error" role="alert">{error}</div> : null}
        </div>

        <div className="modal-actions file-storage-modal-actions">
          <button type="button" className="btn" onClick={onClose} disabled={saving}>Отмена</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {isEditing ? <Save size={17} /> : <Upload size={17} />}
            {saving
              ? (isEditing ? 'Сохранение...' : 'Загрузка...')
              : (isEditing ? 'Сохранить' : 'Создать блок')}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
