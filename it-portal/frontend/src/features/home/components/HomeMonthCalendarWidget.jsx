import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import {
  createHomeCalendarEntry,
  deleteHomeCalendarEntry,
  fetchHomeCalendarEntries,
  updateHomeCalendarEntry
} from '../../../entities/home/api'

const MONTH_LABELS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const RECURRENCE_OPTIONS = [
  { value: 'once', label: 'Одиночная' },
  { value: 'daily', label: 'Ежедневно' },
  { value: 'weekdays', label: 'По будням' },
  { value: 'weekly', label: 'Раз в неделю' }
]
const MAX_DAY_DOTS = 3

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDateKey(value) {
  const [year, month, day] = String(value || '').split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function buildMonthCells(year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const cells = Array.from({ length: firstWeekday }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      key: `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function formatDateLabel(value) {
  return parseDateKey(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long'
  })
}

function formatFreshnessLabel(timestamp) {
  if (!timestamp) return 'Ещё не загружено'
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return 'Обновлено только что'
  if (diffMinutes === 1) return 'Обновлено минуту назад'
  return `Обновлено ${diffMinutes} мин назад`
}

function normalizeRecurrenceRule(value) {
  switch ((value || 'once').toLowerCase()) {
    case 'daily':
    case 'weekdays':
    case 'weekly':
      return value.toLowerCase()
    default:
      return 'once'
  }
}

function getEntrySourceDate(entry) {
  return entry?.original_entry_date || entry?.entry_date || getDateKey(new Date())
}

function formatMonthEntriesLabel(total) {
  if (total % 10 === 1 && total % 100 !== 11) return `${total} запись`
  if ([2, 3, 4].includes(total % 10) && ![12, 13, 14].includes(total % 100)) return `${total} записи`
  return `${total} записей`
}

const EMPTY_DRAFT = {
  title: '',
  details: '',
  recurrence_rule: 'once'
}

export function HomeMonthCalendarWidget({ widget }) {
  const todayKey = useMemo(() => getDateKey(new Date()), [])
  const isMiniMode = (widget?.width_mode || 'wide') === 'normal'
  const [cursorDate, setCursorDate] = useState(() => new Date())
  const [selectedDayKey, setSelectedDayKey] = useState(todayKey)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadedAt, setLoadedAt] = useState(null)
  const [clockTick, setClockTick] = useState(Date.now())
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [editingEntryId, setEditingEntryId] = useState(null)
  const [editingSourceDate, setEditingSourceDate] = useState(null)
  const [composerOpen, setComposerOpen] = useState(false)

  const monthKey = useMemo(() => getMonthKey(cursorDate), [cursorDate])
  const monthCells = useMemo(
    () => buildMonthCells(cursorDate.getFullYear(), cursorDate.getMonth()),
    [cursorDate]
  )

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockTick(Date.now())
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadMonthEntries({ quiet = false } = {}) {
      if (quiet) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError('')

      try {
        const data = await fetchHomeCalendarEntries(monthKey)
        if (cancelled) return
        setEntries(Array.isArray(data) ? data : [])
        setLoadedAt(Date.now())
      } catch (loadError) {
        if (cancelled) return
        setError(loadError.message || 'Не удалось загрузить записи месяца')
      } finally {
        if (!cancelled) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    }

    loadMonthEntries()

    return () => {
      cancelled = true
    }
  }, [monthKey])

  useEffect(() => {
    const nextSelectedKey = monthKey === todayKey.slice(0, 7)
      ? todayKey
      : `${monthKey}-01`

    setSelectedDayKey(nextSelectedKey)
    setComposerOpen(false)
    setEditingEntryId(null)
    setEditingSourceDate(null)
    setDraft(EMPTY_DRAFT)
  }, [monthKey, todayKey])

  const entriesByDay = useMemo(() => {
    const nextMap = new Map()

    entries.forEach((entry) => {
      const dayEntries = nextMap.get(entry.entry_date) || []
      dayEntries.push(entry)
      nextMap.set(entry.entry_date, dayEntries)
    })

    return nextMap
  }, [entries])

  const selectedDayEntries = entriesByDay.get(selectedDayKey) || []
  const selectedDayLabel = formatDateLabel(selectedDayKey)
  const monthTitle = `${MONTH_LABELS[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`
  const monthEntriesCount = entries.length
  const isStale = Boolean(loadedAt) && (clockTick - loadedAt) > 120000
  const statusTone = error ? 'is-error' : refreshing ? 'is-loading' : isStale ? 'is-stale' : 'is-ready'
  const statusLabel = loading && entries.length === 0
    ? 'Подгружаю месяц'
    : refreshing
      ? 'Обновляю данные'
      : error
        ? 'Есть проблема с загрузкой'
        : isStale
          ? formatFreshnessLabel(loadedAt)
          : `Локально · ${formatMonthEntriesLabel(monthEntriesCount)}`

  const refreshMonthEntries = async ({ quiet = false } = {}) => {
    if (quiet) {
      setRefreshing(true)
    } else if (!loading) {
      setLoading(true)
    }
    setError('')

    try {
      const data = await fetchHomeCalendarEntries(monthKey)
      setEntries(Array.isArray(data) ? data : [])
      setLoadedAt(Date.now())
    } catch (loadError) {
      setError(loadError.message || 'Не удалось загрузить записи месяца')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const reloadMonth = async () => {
    if (refreshing || saving) return
    await refreshMonthEntries({ quiet: true })
  }

  const openCreateComposer = () => {
    setEditingEntryId(null)
    setEditingSourceDate(null)
    setDraft({ ...EMPTY_DRAFT, recurrence_rule: 'once' })
    setComposerOpen(true)
  }

  const handleSelectDay = (dayKey) => {
    const dayEntries = entriesByDay.get(dayKey) || []
    setSelectedDayKey(dayKey)
    setEditingEntryId(null)
    setEditingSourceDate(null)
    setDraft(EMPTY_DRAFT)
    setComposerOpen(dayEntries.length === 0)
  }

  const handleStartEdit = (entry) => {
    setSelectedDayKey(entry.entry_date)
    setEditingEntryId(entry.id)
    setEditingSourceDate(getEntrySourceDate(entry))
    setDraft({
      title: entry.title || '',
      details: entry.details || '',
      recurrence_rule: normalizeRecurrenceRule(entry.recurrence_rule)
    })
    setComposerOpen(true)
  }

  const handleDelete = async (entryId) => {
    if (!window.confirm('Удалить запись из календаря?')) return

    setSaving(true)
    try {
      await deleteHomeCalendarEntry(entryId)
      await refreshMonthEntries({ quiet: true })
      if (editingEntryId === entryId) {
        setEditingEntryId(null)
        setEditingSourceDate(null)
        setDraft(EMPTY_DRAFT)
        setComposerOpen(false)
      }
    } catch (deleteError) {
      alert(deleteError.message || 'Не удалось удалить запись')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      if (editingEntryId) {
        await updateHomeCalendarEntry(editingEntryId, {
          entry_date: editingSourceDate || selectedDayKey,
          recurrence_rule: draft.recurrence_rule,
          title: draft.title,
          details: draft.details
        })
        await refreshMonthEntries({ quiet: true })
        setEditingEntryId(null)
        setEditingSourceDate(null)
        setDraft(EMPTY_DRAFT)
        setComposerOpen(false)
      } else {
        await createHomeCalendarEntry({
          entry_date: selectedDayKey,
          recurrence_rule: draft.recurrence_rule,
          title: draft.title,
          details: draft.details
        })
        await refreshMonthEntries({ quiet: true })
        setEditingEntryId(null)
        setEditingSourceDate(null)
        setDraft(EMPTY_DRAFT)
        setComposerOpen(false)
      }
    } catch (saveError) {
      alert(saveError.message || 'Не удалось сохранить запись')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`home-month-widget is-${widget?.width_mode || 'wide'} ${isMiniMode ? 'is-mini' : ''}`}>
      <div className="home-month-widget-toolbar">
        <button
          type="button"
          className="home-month-widget-nav-btn"
          onClick={() => setCursorDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
        >
          <ChevronLeft size={16} />
        </button>
        <div className="home-month-widget-title">
          <strong>{monthTitle}</strong>
          <span>{isMiniMode ? `${formatMonthEntriesLabel(monthEntriesCount)} в этом месяце` : statusLabel}</span>
        </div>
        <div className="home-month-widget-toolbar-actions">
          {!isMiniMode && (
            <span className={`home-month-widget-status ${statusTone}`}>
              {error ? 'Ошибка' : refreshing ? 'Обновляю' : isStale ? 'Устарело' : 'Готово'}
            </span>
          )}
          <button
            type="button"
            className="home-month-widget-nav-btn"
            onClick={reloadMonth}
            title="Обновить записи"
          >
            <RefreshCcw size={15} />
          </button>
          <button
            type="button"
            className="home-month-widget-nav-btn"
            onClick={() => setCursorDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading && entries.length === 0 ? (
        <div className="home-month-widget-skeleton" aria-hidden="true">
          <div className="home-month-widget-skeleton-grid">
            {Array.from({ length: 14 }, (_, index) => (
              <span key={`skeleton-cell-${index}`} className="home-month-widget-skeleton-cell" />
            ))}
          </div>
          <div className="home-month-widget-skeleton-panel">
            <span className="home-month-widget-skeleton-line is-wide" />
            <span className="home-month-widget-skeleton-line" />
            <span className="home-month-widget-skeleton-line" />
          </div>
        </div>
      ) : (
        <>
          <div className="home-month-widget-weekdays">
            {WEEKDAY_LABELS.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>

          <div className="home-month-widget-grid">
            {monthCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="home-month-widget-day is-empty" aria-hidden="true" />
              }

              const dayEntries = entriesByDay.get(cell.key) || []
              const isSelected = cell.key === selectedDayKey
              const isToday = cell.key === todayKey
              const indicatorCount = dayEntries.length
              const showCounter = indicatorCount > MAX_DAY_DOTS

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={`home-month-widget-day ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''} ${indicatorCount > 0 ? 'has-entries' : ''}`}
                  onClick={() => handleSelectDay(cell.key)}
                  title={`${formatDateLabel(cell.key)} · ${indicatorCount > 0 ? `${indicatorCount} ${formatMonthEntriesLabel(indicatorCount)}` : 'Без записей'}`}
                >
                  <span className="home-month-widget-day-number">{cell.day}</span>
                  {indicatorCount > 0 && (
                    <span className="home-month-widget-day-meta">
                      {Array.from({ length: Math.min(indicatorCount, MAX_DAY_DOTS) }, (_, index) => (
                        <span key={`day-dot-${cell.key}-${index}`} className="home-month-widget-day-dot" />
                      ))}
                      {showCounter && (
                        <span className="home-month-widget-day-extra">{`+${indicatorCount - MAX_DAY_DOTS}`}</span>
                      )}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {isMiniMode ? (
            <>
              <div className="home-month-widget-mini-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedDayKey((selectedDayKey && entriesByDay.has(selectedDayKey)) ? selectedDayKey : todayKey)
                    openCreateComposer()
                  }}
                >
                  <Plus size={16} /> Новая запись
                </button>
                {error && (
                  <button
                    type="button"
                    className="home-month-widget-status is-error"
                    onClick={reloadMonth}
                  >
                    Обновить
                  </button>
                )}
                {!composerOpen && monthEntriesCount === 0 && !error && !loading && (
                  <div className="home-month-widget-empty">
                    Записи по этому месяцу ещё не добавлены.
                  </div>
                )}
              </div>

              {composerOpen && (
                <form className="home-month-widget-form" onSubmit={handleSubmit}>
                  <input
                    className="input-glass"
                    type="text"
                    placeholder="Название записи"
                    value={draft.title}
                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  />
                  <textarea
                    className="input-glass"
                    rows={3}
                    placeholder="Что важно на этот день"
                    value={draft.details}
                    onChange={(event) => setDraft((current) => ({ ...current, details: event.target.value }))}
                  />
                  <label className="home-month-widget-field-label" htmlFor={`recurrence-${selectedDayKey}`}>
                    Повторение
                  </label>
                  <select
                    id={`recurrence-${selectedDayKey}`}
                    className="input-glass"
                    value={draft.recurrence_rule}
                    onChange={(event) => setDraft((current) => ({
                      ...current,
                      recurrence_rule: event.target.value
                    }))}
                  >
                    {RECURRENCE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <div className="home-month-widget-form-actions">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setComposerOpen(false)
                        setEditingEntryId(null)
                        setEditingSourceDate(null)
                        setDraft(EMPTY_DRAFT)
                      }}
                    >
                      Отмена
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Сохраняю...' : editingEntryId ? 'Сохранить' : 'Создать'}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
              <div className="home-month-widget-panel">
              <div className="home-month-widget-panel-head">
                <div>
                  <strong>{selectedDayLabel}</strong>
                  <span>{selectedDayEntries.length > 0 ? `Записей: ${selectedDayEntries.length}` : 'Пока без записей'}</span>
                </div>
                <button type="button" className="btn" onClick={openCreateComposer}>
                  <Plus size={16} /> Запись
                </button>
              </div>

              {error && (
                <div className="home-month-widget-error">
                  {error}
                  <div className="home-month-widget-error-actions">
                    <button type="button" className="btn" onClick={reloadMonth}>
                      Обновить
                    </button>
                  </div>
                </div>
              )}

              {selectedDayEntries.length > 0 && (
                <div className="home-month-widget-entry-list">
                  {selectedDayEntries.map((entry) => (
                    <article key={`${entry.id}-${entry.entry_date}`} className="home-month-widget-entry">
                      <div className="home-month-widget-entry-copy">
                        <strong>{entry.title}</strong>
                        {entry.details ? <p>{entry.details}</p> : <p>Без описания</p>}
                        {entry.recurrence_rule !== 'once' && (
                          <span className="home-month-widget-entry-recurrence">
                            {RECURRENCE_OPTIONS.find((option) => option.value === entry.recurrence_rule)?.label}
                          </span>
                        )}
                      </div>
                      <div className="home-month-widget-entry-actions">
                        <button type="button" className="home-card-icon-btn" onClick={() => handleStartEdit(entry)}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="home-card-icon-btn" onClick={() => handleDelete(entry.id)} disabled={saving}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {composerOpen && (
                <form className="home-month-widget-form" onSubmit={handleSubmit}>
                  <input
                    className="input-glass"
                    type="text"
                    placeholder="Название записи"
                    value={draft.title}
                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  />
                  <textarea
                    className="input-glass"
                    rows={3}
                    placeholder="Что важно на этот день"
                    value={draft.details}
                    onChange={(event) => setDraft((current) => ({ ...current, details: event.target.value }))}
                  />
                  <label className="home-month-widget-field-label" htmlFor={`recurrence-${selectedDayKey}`}>
                    Повторение
                  </label>
                  <select
                    id={`recurrence-${selectedDayKey}`}
                    className="input-glass"
                    value={draft.recurrence_rule}
                    onChange={(event) => setDraft((current) => ({
                      ...current,
                      recurrence_rule: event.target.value
                    }))}
                  >
                    {RECURRENCE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <div className="home-month-widget-form-actions">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setComposerOpen(false)
                        setEditingEntryId(null)
                        setEditingSourceDate(null)
                        setDraft(EMPTY_DRAFT)
                      }}
                    >
                      Отмена
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Сохраняю...' : editingEntryId ? 'Сохранить' : 'Создать'}
                    </button>
                  </div>
                </form>
              )}

              {!composerOpen && selectedDayEntries.length === 0 && !error && !loading && (
                <div className="home-month-widget-empty">
                  Выберите день и добавьте первую запись для этого числа.
                  <div className="home-month-widget-empty-actions">
                    <button type="button" className="btn" onClick={openCreateComposer}>
                      <Plus size={16} /> Добавить запись
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
