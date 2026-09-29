import { useEffect, useMemo, useState } from 'react'
import { Activity, Download, MapPin, Plus, RefreshCw, Search, Tag, Trash2, X } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { UtilityPageShell } from '../../../shared/ui/UtilityPageShell'

const createEmptyLocationForm = () => ({
  canonical_name: ''
})

const createEmptyAliasForm = () => ({
  alias_value: ''
})

const locationMatchesSearch = (location, query) => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return [
    location.canonical_name,
    ...(location.aliases || []).flatMap((alias) => [alias.alias_value, alias.normalized_alias])
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery))
}

const formatUsageLabel = (usage) => {
  if (!usage?.total_count) return 'Свободен'
  return `Связей: ${usage.total_count}`
}

const formatTacticalLabel = (tactical) => {
  if (tactical?.sync_error) return 'Tactical: ошибка синхронизации'
  if (!tactical?.site_id && !tactical?.site_name) return 'Tactical: site не связан'
  if (!tactical?.agent_count) return 'Tactical: агентов нет'
  return `Tactical: online ${tactical.online_count || 0} / offline ${tactical.offline_count || 0}`
}

const getTacticalStatusClass = (tactical) => {
  if (tactical?.sync_error) return 'is-error'
  if ((tactical?.online_count || 0) > 0) return 'is-online'
  if ((tactical?.agent_count || 0) > 0) return 'is-offline'
  if (tactical?.site_id || tactical?.site_name) return 'is-empty'
  return 'is-unlinked'
}

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function LocationsManagerModal({
  open,
  onClose,
  locations,
  loading,
  onRefresh,
  onCreateLocation,
  onUpdateLocation,
  onDeleteLocation,
  onCreateAlias,
  onUpdateAlias,
  onDeleteAlias,
  onMergeLocations,
  onGenerateAgentScript,
  pageMode = false,
  onBack = null
}) {
  const isActive = pageMode || open
  const [searchQuery, setSearchQuery] = useState('')
  const [editingLocationId, setEditingLocationId] = useState(null)
  const [editingAliasId, setEditingAliasId] = useState(null)
  const [locationForm, setLocationForm] = useState(createEmptyLocationForm)
  const [aliasForm, setAliasForm] = useState(createEmptyAliasForm)
  const [isCreatingLocation, setIsCreatingLocation] = useState(false)
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [isSavingAlias, setIsSavingAlias] = useState(false)
  const [isMergingLocations, setIsMergingLocations] = useState(false)
  const [generatingAgentLocationId, setGeneratingAgentLocationId] = useState(null)
  const [mergeSourceLocationId, setMergeSourceLocationId] = useState('')
  const [showMergeConfirm, setShowMergeConfirm] = useState(false)
  const [showDeleteLocationConfirm, setShowDeleteLocationConfirm] = useState(false)
  const [aliasToDelete, setAliasToDelete] = useState(null)

  const filteredLocations = useMemo(() => (
    locations
      .filter((location) => locationMatchesSearch(location, searchQuery))
      .slice()
      .sort((left, right) => {
        const nameDiff = (left.canonical_name || '').localeCompare(right.canonical_name || '', 'ru')
        if (nameDiff !== 0) return nameDiff
        return left.id - right.id
      })
  ), [locations, searchQuery])

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === editingLocationId) || null,
    [locations, editingLocationId]
  )

  useEffect(() => {
    if (!isActive) {
      setShowMergeConfirm(false)
      setShowDeleteLocationConfirm(false)
      setAliasToDelete(null)
      setMergeSourceLocationId('')
      return
    }

    if (isCreatingLocation || selectedLocation || !filteredLocations[0]) {
      return
    }

    setEditingLocationId(filteredLocations[0].id)
  }, [isActive, filteredLocations, isCreatingLocation, selectedLocation])

  useEffect(() => {
    if (!isActive) return

    if (selectedLocation) {
      setLocationForm({ canonical_name: selectedLocation.canonical_name || '' })

      if (editingAliasId && !selectedLocation.aliases.some((alias) => alias.id === editingAliasId)) {
        setEditingAliasId(null)
        setAliasForm(createEmptyAliasForm())
      }

      return
    }

    if (isCreatingLocation) {
      setLocationForm(createEmptyLocationForm())
      setEditingAliasId(null)
      setAliasForm(createEmptyAliasForm())
    }
  }, [isActive, selectedLocation, isCreatingLocation, editingAliasId])

  useEffect(() => {
    if (!pageMode || !isActive) return

    const request = onRefresh?.()
    request?.catch((error) => {
      console.error('Failed to refresh locations directory', error)
    })
  }, [isActive, onRefresh, pageMode])

  const handleSelectLocation = (location) => {
    setIsCreatingLocation(false)
    setEditingLocationId(location.id)
    setEditingAliasId(null)
    setShowMergeConfirm(false)
    setMergeSourceLocationId('')
    setLocationForm({ canonical_name: location.canonical_name || '' })
    setAliasForm(createEmptyAliasForm())
  }

  const handleOpenCreateLocation = () => {
    setIsCreatingLocation(true)
    setEditingLocationId(null)
    setEditingAliasId(null)
    setShowMergeConfirm(false)
    setMergeSourceLocationId('')
    setLocationForm(createEmptyLocationForm())
    setAliasForm(createEmptyAliasForm())
  }

  const handleSubmitLocation = async (event) => {
    event.preventDefault()
    setIsSavingLocation(true)

    try {
      if (isCreatingLocation) {
        const created = await onCreateLocation(locationForm)
        setEditingLocationId(created.id)
        setIsCreatingLocation(false)
      } else if (selectedLocation) {
        const updated = await onUpdateLocation(selectedLocation.id, locationForm)
        setEditingLocationId(updated.id)
      }
    } finally {
      setIsSavingLocation(false)
    }
  }

  const handleSubmitAlias = async (event) => {
    event.preventDefault()
    if (!selectedLocation) return

    setIsSavingAlias(true)
    try {
      if (editingAliasId) {
        await onUpdateAlias(editingAliasId, aliasForm)
      } else {
        await onCreateAlias(selectedLocation.id, aliasForm)
      }

      setEditingAliasId(null)
      setAliasForm(createEmptyAliasForm())
    } finally {
      setIsSavingAlias(false)
    }
  }

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return

    setIsSavingLocation(true)
    try {
      await onDeleteLocation(selectedLocation.id)
      setShowDeleteLocationConfirm(false)
      setIsCreatingLocation(false)
      setEditingLocationId(null)
      setEditingAliasId(null)
      setShowMergeConfirm(false)
      setMergeSourceLocationId('')
      setLocationForm(createEmptyLocationForm())
      setAliasForm(createEmptyAliasForm())
    } finally {
      setIsSavingLocation(false)
    }
  }

  const handleDeleteAlias = async () => {
    if (!aliasToDelete) return

    setIsSavingAlias(true)
    try {
      await onDeleteAlias(aliasToDelete.id)
      if (editingAliasId === aliasToDelete.id) {
        setEditingAliasId(null)
        setAliasForm(createEmptyAliasForm())
      }
      setAliasToDelete(null)
    } finally {
      setIsSavingAlias(false)
    }
  }

  const mergeOptions = useMemo(() => (
    locations
      .filter((location) => selectedLocation && location.id !== selectedLocation.id)
      .slice()
      .sort((left, right) => (left.canonical_name || '').localeCompare(right.canonical_name || '', 'ru'))
  ), [locations, selectedLocation])

  const mergeSourceLocation = useMemo(
    () => mergeOptions.find((location) => location.id === Number(mergeSourceLocationId)) || null,
    [mergeOptions, mergeSourceLocationId]
  )

  const handleMergeLocations = async () => {
    if (!selectedLocation || !mergeSourceLocationId) return

    setIsMergingLocations(true)
    try {
      await onMergeLocations({
        source_location_id: Number(mergeSourceLocationId),
        target_location_id: selectedLocation.id
      })
      setShowMergeConfirm(false)
      setMergeSourceLocationId('')
    } finally {
      setIsMergingLocations(false)
    }
  }

  const handleGenerateAgentScript = async () => {
    if (!selectedLocation || !onGenerateAgentScript) return

    setGeneratingAgentLocationId(selectedLocation.id)
    try {
      await onGenerateAgentScript(selectedLocation.id)
    } finally {
      setGeneratingAgentLocationId(null)
    }
  }

  const refreshButton = (
    <button
      type="button"
      className="btn"
      onClick={() => {
        const request = onRefresh?.()
        request?.catch((error) => {
          console.error('Failed to refresh locations directory', error)
        })
      }}
      disabled={loading}
    >
      <RefreshCw size={16} /> Обновить
    </button>
  )

  const content = (
    <>
      <div className="locations-modal-toolbar">
        <div className="locations-modal-search">
          <Search size={16} />
          <input
            type="text"
            className="input-glass"
            placeholder="Поиск по кабинету или алиасу..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="glass-panel locations-modal-summary">
          <span>Кабинетов</span>
          <strong>{locations.length}</strong>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenCreateLocation}>
          <Plus size={16} /> Новый кабинет
        </button>
      </div>

      <div className="locations-modal-layout">
        <aside className="locations-modal-list glass-panel">
          {loading ? (
            <div className="locations-modal-empty">
              <strong>Загружаю справочник...</strong>
              <span>Список кабинетов подтягивается с backend.</span>
            </div>
          ) : filteredLocations.length ? (
            filteredLocations.map((location) => (
              <button
                key={location.id}
                type="button"
                className={`locations-card ${editingLocationId === location.id && !isCreatingLocation ? 'is-active' : ''}`}
                onClick={() => handleSelectLocation(location)}
              >
                <div className="locations-card-header">
                  <span className="locations-card-icon">
                    <MapPin size={15} />
                  </span>
                  <div className="locations-card-copy">
                    <strong>{location.canonical_name}</strong>
                    <span>{formatUsageLabel(location.usage)}</span>
                  </div>
                </div>
                <div className={`locations-tactical-pill ${getTacticalStatusClass(location.tactical)}`}>
                  <Activity size={13} />
                  <span>{formatTacticalLabel(location.tactical)}</span>
                </div>
                <div className="locations-card-meta">
                  <span>Алиасов: {location.aliases.length}</span>
                  <span>ID: {location.id}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="locations-modal-empty">
              <strong>Ничего не найдено</strong>
              <span>Смени поиск или создай новый кабинет.</span>
            </div>
          )}
        </aside>

        <div className="locations-modal-editor">
          <form className="locations-panel glass-panel" onSubmit={handleSubmitLocation}>
            <div className="locations-panel-header">
              <div>
                <div className="locations-panel-eyebrow">
                  {isCreatingLocation ? 'Создание' : selectedLocation ? 'Редактирование' : 'Кабинет'}
                </div>
                <h3>{isCreatingLocation ? 'Новый кабинет' : selectedLocation ? selectedLocation.canonical_name : 'Выбери кабинет'}</h3>
              </div>
              {!isCreatingLocation && selectedLocation ? (
                <div className="locations-modal-header-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleGenerateAgentScript}
                    disabled={generatingAgentLocationId === selectedLocation.id}
                  >
                    <Download size={16} />
                    {generatingAgentLocationId === selectedLocation.id ? 'Генерирую...' : 'Сгенерировать агента'}
                  </button>
                  <button type="button" className="btn" onClick={() => setShowDeleteLocationConfirm(true)}>
                    <Trash2 size={16} /> Удалить
                  </button>
                </div>
              ) : null}
            </div>

            <label className="locations-field">
              <span>Каноническое название</span>
              <input
                required
                type="text"
                className="input-glass"
                placeholder="Например: 214 или Атриум"
                value={locationForm.canonical_name}
                onChange={(event) => setLocationForm({ canonical_name: event.target.value })}
              />
            </label>

            {selectedLocation ? (
              <div className="locations-usage-grid">
                <div className="locations-usage-card">
                  <span>Подотчет</span>
                  <strong>{selectedLocation.usage.accountable_assets_count}</strong>
                </div>
                <div className="locations-usage-card">
                  <span>Снимки</span>
                  <strong>{selectedLocation.usage.accountable_import_entries_count}</strong>
                </div>
                <div className="locations-usage-card">
                  <span>Принтеры</span>
                  <strong>{selectedLocation.usage.printer_locations_count}</strong>
                </div>
                <div className="locations-usage-card">
                  <span>Оборудование</span>
                  <strong>{selectedLocation.usage.equipment_records_count}</strong>
                </div>
                <div className="locations-usage-card">
                  <span>Сотрудники</span>
                  <strong>{selectedLocation.usage.employees_count || 0}</strong>
                </div>
                <div className="locations-usage-card">
                  <span>Справочник</span>
                  <strong>{selectedLocation.usage.phonebook_count || 0}</strong>
                </div>
              </div>
            ) : null}

            {selectedLocation ? (
              <div className={`locations-tactical-panel ${getTacticalStatusClass(selectedLocation.tactical)}`}>
                <div className="locations-tactical-panel-header">
                  <span className="locations-card-icon">
                    <Activity size={15} />
                  </span>
                  <div>
                    <strong>Статус Tactical</strong>
                    <span>{formatTacticalLabel(selectedLocation.tactical)}</span>
                  </div>
                </div>
                <div className="locations-tactical-grid">
                  <div>
                    <span>Site</span>
                    <strong>{selectedLocation.tactical?.site_name || '—'}</strong>
                  </div>
                  <div>
                    <span>Всего</span>
                    <strong>{selectedLocation.tactical?.agent_count || 0}</strong>
                  </div>
                  <div>
                    <span>Online</span>
                    <strong>{selectedLocation.tactical?.online_count || 0}</strong>
                  </div>
                  <div>
                    <span>Offline</span>
                    <strong>{selectedLocation.tactical?.offline_count || 0}</strong>
                  </div>
                  <div>
                    <span>Last seen</span>
                    <strong>{formatDateTime(selectedLocation.tactical?.last_seen_at)}</strong>
                  </div>
                  <div>
                    <span>Sync</span>
                    <strong>{formatDateTime(selectedLocation.tactical?.last_sync_at)}</strong>
                  </div>
                </div>
                {selectedLocation.tactical?.sync_error ? (
                  <div className="locations-tactical-error">{selectedLocation.tactical.sync_error}</div>
                ) : null}
              </div>
            ) : null}

            {selectedLocation ? (
              <div className="locations-merge-box">
                <p className="locations-merge-hint">
                  Перенеси сюда кабинет-дубль, чтобы объединить все его связи с текущим кабинетом.
                  Название дубля не потеряется: после схлопывания оно станет алиасом.
                </p>
                <label className="locations-field">
                  <span>Схлопнуть другой кабинет в этот</span>
                  <select
                    className="input-glass"
                    value={mergeSourceLocationId}
                    onChange={(event) => setMergeSourceLocationId(event.target.value)}
                  >
                    <option value="">Выбери кабинет-дубль</option>
                    {mergeOptions.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.canonical_name} · связей {location.usage?.total_count || 0} · алиасов {location.aliases.length} · ID {location.id}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="locations-panel-actions">
                  <button
                    type="button"
                    className="btn"
                    disabled={!mergeSourceLocationId || isMergingLocations}
                    onClick={() => setShowMergeConfirm(true)}
                  >
                    {isMergingLocations ? 'Схлопываю...' : 'Схлопнуть кабинет'}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="locations-panel-actions">
              <button type="submit" className="btn btn-primary" disabled={isSavingLocation}>
                {isSavingLocation ? 'Сохраняю...' : isCreatingLocation ? 'Создать кабинет' : 'Сохранить кабинет'}
              </button>
            </div>
          </form>

          <section className="locations-panel glass-panel">
            <div className="locations-panel-header">
              <div>
                <div className="locations-panel-eyebrow">Алиасы</div>
                <h3>{selectedLocation ? 'Варианты написания' : 'Сначала выбери кабинет'}</h3>
              </div>
            </div>

            {selectedLocation ? (
              <>
                <div className="locations-alias-list">
                  {selectedLocation.aliases.map((alias) => (
                    <div
                      key={alias.id}
                      className={`locations-alias-row ${editingAliasId === alias.id ? 'is-active' : ''}`}
                    >
                      <button
                        type="button"
                        className="locations-alias-main"
                        onClick={() => {
                          setEditingAliasId(alias.id)
                          setAliasForm({ alias_value: alias.alias_value })
                        }}
                      >
                        <span className="locations-alias-icon">
                          <Tag size={14} />
                        </span>
                        <span className="locations-alias-copy">
                          <strong>{alias.alias_value}</strong>
                          <span>{alias.normalized_alias}</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setAliasToDelete(alias)}
                        title="Удалить алиас"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <form className="locations-alias-form" onSubmit={handleSubmitAlias}>
                  <label className="locations-field">
                    <span>{editingAliasId ? 'Редактировать алиас' : 'Новый алиас'}</span>
                    <input
                      required
                      type="text"
                      className="input-glass"
                      placeholder="Например: каб. 214"
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
                          setAliasForm(createEmptyAliasForm())
                        }}
                      >
                        Отмена
                      </button>
                    ) : null}
                    <button type="submit" className="btn btn-primary" disabled={isSavingAlias}>
                      {isSavingAlias ? 'Сохраняю...' : editingAliasId ? 'Обновить алиас' : 'Добавить алиас'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="locations-modal-empty is-compact">
                <strong>Кабинет не выбран</strong>
                <span>Слева можно выбрать существующий кабинет или создать новый.</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )

  const confirmations = (
    <>
      <ConfirmDialog
        open={showMergeConfirm}
        onClose={() => setShowMergeConfirm(false)}
        onConfirm={handleMergeLocations}
        title="Схлопнуть кабинет?"
        description={mergeSourceLocation && selectedLocation
          ? `Кабинет "${mergeSourceLocation.canonical_name}" будет объединен с "${selectedLocation.canonical_name}". Все связи переедут в текущий кабинет, а исходное название сохранится как алиас.`
          : 'Все связи исходного кабинета будут перенесены в текущий, а его название сохранится как алиас.'}
        confirmLabel="Схлопнуть кабинет"
        confirmDisabled={isMergingLocations}
      />

      <ConfirmDialog
        open={showDeleteLocationConfirm}
        onClose={() => setShowDeleteLocationConfirm(false)}
        onConfirm={handleDeleteLocation}
        title="Удалить кабинет?"
        description={`Кабинет "${selectedLocation?.canonical_name || ''}" будет удален только если не используется в других таблицах.`}
        confirmLabel="Удалить кабинет"
        confirmDisabled={isSavingLocation}
      />

      <ConfirmDialog
        open={Boolean(aliasToDelete)}
        onClose={() => setAliasToDelete(null)}
        onConfirm={handleDeleteAlias}
        title="Удалить алиас?"
        description={`Алиас "${aliasToDelete?.alias_value || ''}" будет удален из справочника.`}
        confirmLabel="Удалить алиас"
        confirmDisabled={isSavingAlias}
      />
    </>
  )

  if (pageMode) {
    return (
      <>
        <UtilityPageShell
          eyebrow="Справочники"
          title="Справочник кабинетов"
          description="Канонические кабинеты, их варианты написания и схлопывание дублей для связанных разделов портала."
          onBack={onBack}
          actions={refreshButton}
          maxWidth="1220px"
          compact
        >
          {content}
        </UtilityPageShell>
        {confirmations}
      </>
    )
  }

  return (
    <>
      <ModalShell
        open={open}
        onClose={onClose}
        panelClassName="glass-panel modal-panel locations-modal"
        panelStyle={{ width: 'min(1220px, calc(100vw - 32px))' }}
      >
        <div className="locations-modal-header">
          <div>
            <div className="portal-profile-modal-eyebrow">Профиль</div>
            <h2>Справочник кабинетов</h2>
          </div>
          <div className="locations-modal-header-actions">
            {refreshButton}
            <button
              type="button"
              className="btn portal-profile-modal-close"
              onClick={onClose}
              title="Закрыть"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {content}
      </ModalShell>

      {confirmations}
    </>
  )
}
