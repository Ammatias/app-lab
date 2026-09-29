import { useEffect, useMemo, useState } from 'react'
import { Building2, Plus, RefreshCw, Search, Tag, Trash2, X } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { UtilityPageShell } from '../../../shared/ui/UtilityPageShell'

const emptyDepartmentForm = () => ({ canonical_name: '', sort_order: 10000 })
const emptyAliasForm = () => ({ alias_value: '' })

const matchesSearch = (department, query) => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return [
    department.canonical_name,
    ...(department.aliases || []).flatMap((alias) => [alias.alias_value, alias.normalized_alias])
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery))
}

const usageLabel = (usage) => {
  if (!usage?.total_count) return 'Свободен'
  return `Связей: ${usage.total_count}`
}

export function DepartmentsManagerModal({
  open,
  onClose,
  departments,
  loading,
  onRefresh,
  onCreateDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onCreateAlias,
  onUpdateAlias,
  onDeleteAlias,
  onMergeDepartments,
  pageMode = false,
  onBack = null
}) {
  const isActive = pageMode || open
  const [searchQuery, setSearchQuery] = useState('')
  const [editingDepartmentId, setEditingDepartmentId] = useState(null)
  const [editingAliasId, setEditingAliasId] = useState(null)
  const [departmentForm, setDepartmentForm] = useState(emptyDepartmentForm)
  const [aliasForm, setAliasForm] = useState(emptyAliasForm)
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false)
  const [isSavingDepartment, setIsSavingDepartment] = useState(false)
  const [isSavingAlias, setIsSavingAlias] = useState(false)
  const [mergeSourceDepartmentId, setMergeSourceDepartmentId] = useState('')
  const [showMergeConfirm, setShowMergeConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [aliasToDelete, setAliasToDelete] = useState(null)

  const filteredDepartments = useMemo(() => (
    departments
      .filter((department) => matchesSearch(department, searchQuery))
      .slice()
      .sort((left, right) => {
        const sortDiff = (left.sort_order || 10000) - (right.sort_order || 10000)
        if (sortDiff !== 0) return sortDiff
        return (left.canonical_name || '').localeCompare(right.canonical_name || '', 'ru-RU')
      })
  ), [departments, searchQuery])

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === editingDepartmentId) || null,
    [departments, editingDepartmentId]
  )

  const mergeOptions = useMemo(() => (
    departments
      .filter((department) => selectedDepartment && department.id !== selectedDepartment.id)
      .slice()
      .sort((left, right) => (left.canonical_name || '').localeCompare(right.canonical_name || '', 'ru-RU'))
  ), [departments, selectedDepartment])

  const mergeSourceDepartment = useMemo(
    () => mergeOptions.find((department) => department.id === Number(mergeSourceDepartmentId)) || null,
    [mergeOptions, mergeSourceDepartmentId]
  )

  useEffect(() => {
    if (!isActive) {
      setShowMergeConfirm(false)
      setShowDeleteConfirm(false)
      setAliasToDelete(null)
      setMergeSourceDepartmentId('')
      return
    }

    if (isCreatingDepartment || selectedDepartment || !filteredDepartments[0]) return
    setEditingDepartmentId(filteredDepartments[0].id)
  }, [filteredDepartments, isActive, isCreatingDepartment, selectedDepartment])

  useEffect(() => {
    if (!isActive) return

    if (selectedDepartment) {
      setDepartmentForm({
        canonical_name: selectedDepartment.canonical_name || '',
        sort_order: selectedDepartment.sort_order || 10000
      })

      if (editingAliasId && !selectedDepartment.aliases.some((alias) => alias.id === editingAliasId)) {
        setEditingAliasId(null)
        setAliasForm(emptyAliasForm())
      }
      return
    }

    if (isCreatingDepartment) {
      setDepartmentForm(emptyDepartmentForm())
      setEditingAliasId(null)
      setAliasForm(emptyAliasForm())
    }
  }, [editingAliasId, isActive, isCreatingDepartment, selectedDepartment])

  useEffect(() => {
    if (!pageMode || !isActive) return

    const request = onRefresh?.()
    request?.catch((error) => {
      console.error('Failed to refresh departments directory', error)
    })
  }, [isActive, onRefresh, pageMode])

  const handleSelectDepartment = (department) => {
    setIsCreatingDepartment(false)
    setEditingDepartmentId(department.id)
    setEditingAliasId(null)
    setShowMergeConfirm(false)
    setMergeSourceDepartmentId('')
    setDepartmentForm({
      canonical_name: department.canonical_name || '',
      sort_order: department.sort_order || 10000
    })
    setAliasForm(emptyAliasForm())
  }

  const handleOpenCreateDepartment = () => {
    setIsCreatingDepartment(true)
    setEditingDepartmentId(null)
    setEditingAliasId(null)
    setShowMergeConfirm(false)
    setMergeSourceDepartmentId('')
    setDepartmentForm(emptyDepartmentForm())
    setAliasForm(emptyAliasForm())
  }

  const handleSubmitDepartment = async (event) => {
    event.preventDefault()
    setIsSavingDepartment(true)

    try {
      if (isCreatingDepartment) {
        const created = await onCreateDepartment(departmentForm)
        setEditingDepartmentId(created.id)
        setIsCreatingDepartment(false)
      } else if (selectedDepartment) {
        const updated = await onUpdateDepartment(selectedDepartment.id, departmentForm)
        setEditingDepartmentId(updated.id)
      }
    } finally {
      setIsSavingDepartment(false)
    }
  }

  const handleSubmitAlias = async (event) => {
    event.preventDefault()
    if (!selectedDepartment) return

    setIsSavingAlias(true)
    try {
      if (editingAliasId) {
        await onUpdateAlias(editingAliasId, aliasForm)
      } else {
        await onCreateAlias(selectedDepartment.id, aliasForm)
      }

      setEditingAliasId(null)
      setAliasForm(emptyAliasForm())
    } finally {
      setIsSavingAlias(false)
    }
  }

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return

    setIsSavingDepartment(true)
    try {
      await onDeleteDepartment(selectedDepartment.id)
      setShowDeleteConfirm(false)
      setIsCreatingDepartment(false)
      setEditingDepartmentId(null)
    } finally {
      setIsSavingDepartment(false)
    }
  }

  const handleDeleteAlias = async () => {
    if (!aliasToDelete) return

    setIsSavingAlias(true)
    try {
      await onDeleteAlias(aliasToDelete.id)
      if (editingAliasId === aliasToDelete.id) {
        setEditingAliasId(null)
        setAliasForm(emptyAliasForm())
      }
      setAliasToDelete(null)
    } finally {
      setIsSavingAlias(false)
    }
  }

  const handleMergeDepartments = async () => {
    if (!selectedDepartment || !mergeSourceDepartmentId) return

    setIsSavingDepartment(true)
    try {
      await onMergeDepartments({
        source_department_id: Number(mergeSourceDepartmentId),
        target_department_id: selectedDepartment.id
      })
      setShowMergeConfirm(false)
      setMergeSourceDepartmentId('')
    } finally {
      setIsSavingDepartment(false)
    }
  }

  const content = (
    <>
      <div className="locations-modal-toolbar">
        <div className="locations-modal-search">
          <Search size={16} />
          <input
            type="text"
            className="input-glass"
            placeholder="Поиск по отделу или алиасу..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="glass-panel locations-modal-summary">
          <span>Отделов</span>
          <strong>{departments.length}</strong>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenCreateDepartment}>
          <Plus size={16} /> Новый отдел
        </button>
      </div>

      <div className="locations-modal-layout">
        <aside className="locations-modal-list glass-panel">
          {loading ? (
            <div className="locations-modal-empty">
              <strong>Загружаю справочник...</strong>
              <span>Список отделов подтягивается с backend.</span>
            </div>
          ) : filteredDepartments.length ? (
            filteredDepartments.map((department) => (
              <button
                key={department.id}
                type="button"
                className={`locations-card ${editingDepartmentId === department.id && !isCreatingDepartment ? 'is-active' : ''}`}
                onClick={() => handleSelectDepartment(department)}
              >
                <div className="locations-card-header">
                  <span className="locations-card-icon">
                    <Building2 size={15} />
                  </span>
                  <div className="locations-card-copy">
                    <strong>{department.canonical_name}</strong>
                    <span>{usageLabel(department.usage)}</span>
                  </div>
                </div>
                <div className="locations-card-meta">
                  <span>Алиасов: {department.aliases.length}</span>
                  <span>ID: {department.id}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="locations-modal-empty">
              <strong>Ничего не найдено</strong>
              <span>Смени поиск или создай новый отдел.</span>
            </div>
          )}
        </aside>

        <div className="locations-modal-editor">
          <form className="locations-panel glass-panel" onSubmit={handleSubmitDepartment}>
            <div className="locations-panel-header">
              <div>
                <div className="locations-panel-eyebrow">
                  {isCreatingDepartment ? 'Создание' : selectedDepartment ? 'Редактирование' : 'Отдел'}
                </div>
                <h3>{isCreatingDepartment ? 'Новый отдел' : selectedDepartment ? selectedDepartment.canonical_name : 'Выбери отдел'}</h3>
              </div>
              {!isCreatingDepartment && selectedDepartment ? (
                <button type="button" className="btn" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={16} /> Удалить
                </button>
              ) : null}
            </div>

            <label className="locations-field">
              <span>Каноническое название</span>
              <input
                required
                type="text"
                className="input-glass"
                placeholder="Например: Отдел учета"
                value={departmentForm.canonical_name}
                onChange={(event) => setDepartmentForm((prev) => ({ ...prev, canonical_name: event.target.value }))}
              />
            </label>

            <label className="locations-field">
              <span>Порядок сортировки</span>
              <input
                type="number"
                className="input-glass"
                value={departmentForm.sort_order}
                onChange={(event) => setDepartmentForm((prev) => ({ ...prev, sort_order: Number(event.target.value) || 10000 }))}
              />
            </label>

            {selectedDepartment ? (
              <>
                <div className="locations-usage-grid">
                  <div className="locations-usage-card">
                    <span>Сотрудники</span>
                    <strong>{selectedDepartment.usage.employees_count}</strong>
                  </div>
                  <div className="locations-usage-card">
                    <span>Справочник</span>
                    <strong>{selectedDepartment.usage.phonebook_count}</strong>
                  </div>
                </div>

                <div className="locations-merge-box">
                  <p className="locations-merge-hint">
                    Выбери отдел-дубль, чтобы перенести его сотрудников, контакты и алиасы в текущий отдел.
                  </p>
                  <label className="locations-field">
                    <span>Схлопнуть отдел-дубль</span>
                    <select
                      className="input-glass"
                      value={mergeSourceDepartmentId}
                      onChange={(event) => setMergeSourceDepartmentId(event.target.value)}
                    >
                      <option value="">Выберите отдел</option>
                      {mergeOptions.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.canonical_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="locations-panel-actions">
                    <button
                      type="button"
                      className="btn"
                      disabled={!mergeSourceDepartmentId || isSavingDepartment}
                      onClick={() => setShowMergeConfirm(true)}
                    >
                      Объединить
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            <div className="locations-panel-actions">
              <button type="button" className="btn" onClick={handleOpenCreateDepartment}>Очистить</button>
              <button type="submit" className="btn btn-primary" disabled={isSavingDepartment}>
                {isSavingDepartment ? 'Сохранение...' : isCreatingDepartment ? 'Создать' : 'Сохранить'}
              </button>
            </div>
          </form>

          <section className="locations-panel glass-panel">
            <div className="locations-panel-header">
              <div>
                <div className="locations-panel-eyebrow">Алиасы</div>
                <h3>Варианты написания</h3>
              </div>
            </div>

            {selectedDepartment ? (
              <>
                <div className="locations-alias-list">
                  {selectedDepartment.aliases.map((alias) => (
                    <button
                      key={alias.id}
                      type="button"
                      className={`locations-alias-row ${editingAliasId === alias.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setEditingAliasId(alias.id)
                        setAliasForm({ alias_value: alias.alias_value || '' })
                      }}
                    >
                      <span className="locations-alias-main">
                        <span className="locations-alias-icon">
                          <Tag size={14} />
                        </span>
                        <span className="locations-alias-copy">
                          <strong>{alias.alias_value}</strong>
                          <small>{alias.normalized_alias}</small>
                        </span>
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="locations-alias-delete"
                        onClick={(event) => {
                          event.stopPropagation()
                          setAliasToDelete(alias)
                        }}
                      >
                        <Trash2 size={14} />
                      </span>
                    </button>
                  ))}
                </div>

                <form className="locations-alias-form" onSubmit={handleSubmitAlias}>
                  <label className="locations-field">
                    <span>{editingAliasId ? 'Редактировать алиас' : 'Новый алиас'}</span>
                    <input
                      required
                      type="text"
                      className="input-glass"
                      value={aliasForm.alias_value}
                      onChange={(event) => setAliasForm({ alias_value: event.target.value })}
                    />
                  </label>
                  <div className="locations-panel-actions">
                    {editingAliasId ? (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          setEditingAliasId(null)
                          setAliasForm(emptyAliasForm())
                        }}
                      >
                        Отмена
                      </button>
                    ) : null}
                    <button type="submit" className="btn btn-primary" disabled={isSavingAlias}>
                      {isSavingAlias ? 'Сохранение...' : editingAliasId ? 'Сохранить алиас' : 'Добавить алиас'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="locations-modal-empty is-compact">
                <strong>Отдел не выбран</strong>
                <span>Выбери отдел слева, чтобы управлять алиасами.</span>
              </div>
            )}
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={showMergeConfirm}
        onClose={() => setShowMergeConfirm(false)}
        onConfirm={handleMergeDepartments}
        title="Объединить отделы?"
        description={mergeSourceDepartment && selectedDepartment
          ? `Отдел "${mergeSourceDepartment.canonical_name}" будет объединен с "${selectedDepartment.canonical_name}". Все связи переедут в текущий отдел, а исходное название сохранится как алиас.`
          : ''}
        confirmLabel={isSavingDepartment ? 'Объединяю...' : 'Объединить'}
        confirmDisabled={isSavingDepartment}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteDepartment}
        title="Удалить отдел?"
        description={`Отдел "${selectedDepartment?.canonical_name || ''}" будет удален только если не используется в справочниках.`}
        confirmLabel={isSavingDepartment ? 'Удаление...' : 'Удалить'}
        confirmDisabled={isSavingDepartment}
      />

      <ConfirmDialog
        open={Boolean(aliasToDelete)}
        onClose={() => setAliasToDelete(null)}
        onConfirm={handleDeleteAlias}
        title="Удалить алиас?"
        description={`Алиас "${aliasToDelete?.alias_value || ''}" будет удален из отдела.`}
        confirmLabel={isSavingAlias ? 'Удаление...' : 'Удалить'}
        confirmDisabled={isSavingAlias}
      />
    </>
  )

  if (pageMode) {
    return (
      <UtilityPageShell
        eyebrow="Справочник отделов"
        title="Отделы и алиасы"
        description="Единый источник названий отделов для телефонного справочника и профилей сотрудников."
        onBack={onBack}
        actions={(
          <button type="button" className="btn" onClick={() => onRefresh?.()} disabled={loading}>
            <RefreshCw size={16} /> Обновить
          </button>
        )}
        maxWidth="1180px"
        compact
      >
        {content}
      </UtilityPageShell>
    )
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      panelClassName="glass-panel modal-panel locations-modal"
      panelStyle={{ width: 'min(1180px, calc(100vw - 32px))' }}
    >
      <div className="locations-modal-header">
        <div>
          <div className="portal-profile-modal-eyebrow">Справочник отделов</div>
          <h2>Отделы и алиасы</h2>
        </div>
        <button type="button" className="btn portal-profile-modal-close" onClick={onClose} title="Закрыть">
          <X size={16} />
        </button>
      </div>

      {content}
    </ModalShell>
  )
}
