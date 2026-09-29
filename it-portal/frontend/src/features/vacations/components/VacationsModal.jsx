import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarRange, ChevronDown, ChevronUp, Clock3, Download, FileUp, Pencil, Plus, RotateCcw, Trash2, Umbrella, X } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { UtilityPageShell } from '../../../shared/ui/UtilityPageShell'
import { fetchVacationCalendar } from '../../../entities/vacations/api'
import { filterVisiblePortalAccounts, isHiddenPortalAccount, isHiddenPortalUsername } from '../../../shared/lib/portalAccounts'

const MONTH_LABELS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const VACATION_COLOR_PALETTE = [
  {
    solid: '#67e8f9',
    soft: 'rgba(103, 232, 249, 0.2)',
    border: 'rgba(103, 232, 249, 0.5)',
    glow: 'rgba(103, 232, 249, 0.28)'
  },
  {
    solid: '#f9a8d4',
    soft: 'rgba(249, 168, 212, 0.22)',
    border: 'rgba(249, 168, 212, 0.48)',
    glow: 'rgba(249, 168, 212, 0.26)'
  },
  {
    solid: '#facc15',
    soft: 'rgba(250, 204, 21, 0.22)',
    border: 'rgba(250, 204, 21, 0.48)',
    glow: 'rgba(250, 204, 21, 0.26)'
  },
  {
    solid: '#86efac',
    soft: 'rgba(134, 239, 172, 0.2)',
    border: 'rgba(134, 239, 172, 0.46)',
    glow: 'rgba(134, 239, 172, 0.24)'
  }
]
const VACATION_COLOR_OVERRIDES = {
  DemoAdmin: {
    solid: '#86efac',
    soft: 'rgba(134, 239, 172, 0.2)',
    border: 'rgba(134, 239, 172, 0.46)',
    glow: 'rgba(134, 239, 172, 0.24)'
  }
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('ru-RU')
}

function getScheduledDays(periods) {
  return periods.reduce((sum, period) => sum + Number(period.days_count || 0), 0)
}

function buildWeekendFallbackDayOffKeys(year) {
  if (!year) return []

  const keys = []
  const cursor = new Date(year, 0, 1)

  while (cursor.getFullYear() === year) {
    const weekday = cursor.getDay()
    if (weekday === 0 || weekday === 6) {
      keys.push(getLocalDateKey(cursor))
    }

    cursor.setDate(cursor.getDate() + 1)
  }

  return keys
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(value) {
  const [year, month, day] = String(value || '').split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function sortPeriodsChronologically(periods) {
  return [...periods].sort((left, right) => {
    const startCompare = String(left.start_date || '').localeCompare(String(right.start_date || ''))
    if (startCompare !== 0) return startCompare

    const endCompare = String(left.end_date || '').localeCompare(String(right.end_date || ''))
    if (endCompare !== 0) return endCompare

    return String(left.display_name || '').localeCompare(String(right.display_name || ''))
  })
}

function listDateKeysInclusive(startDate, endDate) {
  const keys = []
  const cursor = parseDateKey(startDate)
  const limit = parseDateKey(endDate)

  while (cursor <= limit) {
    keys.push(getLocalDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return keys
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

function buildSegmentedBackground(colors) {
  if (colors.length <= 1) return colors[0] || 'rgba(255, 255, 255, 0.05)'
  const segment = 100 / colors.length
  const stops = colors.map((color, index) => {
    const start = Number((segment * index).toFixed(2))
    const end = Number((segment * (index + 1)).toFixed(2))
    return `${color} ${start}% ${end}%`
  })
  return `conic-gradient(${stops.join(', ')})`
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="portal-vacation-summary-card" style={{ borderColor: accent }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

const emptyForm = {
  start_date: '',
  end_date: '',
  note: ''
}

export function VacationsModal({
  open,
  onClose,
  user,
  vacationsOverview,
  loading,
  saving,
  deletingId,
  importing,
  exporting,
  onRefresh,
  onSave,
  onDelete,
  onImportSchedule,
  onExportSchedule,
  pageMode = false,
  onBack = null
}) {
  const isActive = pageMode || open
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [viewMode, setViewMode] = useState('calendar')
  const [isFormExpanded, setIsFormExpanded] = useState(false)
  const [calendarByYear, setCalendarByYear] = useState({})
  const [calendarErrorsByYear, setCalendarErrorsByYear] = useState({})
  const fileInputRef = useRef(null)
  const calendarRequestYearsRef = useRef(new Set())
  const profile = vacationsOverview.profile
  const profiles = useMemo(
    () => filterVisiblePortalAccounts(vacationsOverview.profiles || []),
    [vacationsOverview.profiles]
  )
  const visibleProfileUsernameSet = useMemo(
    () => new Set(profiles.map((entry) => String(entry.username || '').trim().toLowerCase())),
    [profiles]
  )
  const currentUsername = vacationsOverview.current_username || profile?.username || ''
  const accessDenied = vacationsOverview.access_denied
  const isHiddenUser = isHiddenPortalAccount(user) || isHiddenPortalAccount(profile)
  const currentCalendarYear = useMemo(() => new Date().getFullYear(), [])
  const nextCalendarYear = currentCalendarYear + 1

  useEffect(() => {
    if (!isActive) {
      setForm(emptyForm)
      setEditingId(null)
      setIsFormExpanded(false)
      return
    }

    onRefresh?.()
  }, [isActive])

  const availableYears = useMemo(() => {
    const years = new Set([currentCalendarYear, nextCalendarYear])
    ;(vacationsOverview.periods || []).forEach((period) => years.add(period.vacation_year))
    return Array.from(years).sort((left, right) => right - left)
  }, [currentCalendarYear, nextCalendarYear, vacationsOverview.periods])

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0] || new Date().getFullYear())
    }
  }, [availableYears, selectedYear])

  const periodsForYear = useMemo(
    () => sortPeriodsChronologically((vacationsOverview.periods || []).filter((period) => period.vacation_year === selectedYear)),
    [vacationsOverview.periods, selectedYear]
  )
  const visiblePeriodsForYear = useMemo(
    () => periodsForYear.filter((period) => {
      const username = String(period.username || '').trim().toLowerCase()
      return visibleProfileUsernameSet.has(username) && !isHiddenPortalUsername(username)
    }),
    [periodsForYear, visibleProfileUsernameSet]
  )
  const ownPeriodsForYear = useMemo(
    () => periodsForYear.filter((period) => period.username === currentUsername),
    [periodsForYear, currentUsername]
  )
  const paletteByUsername = useMemo(() => {
    const palette = new Map()
    profiles.forEach((entry, index) => {
      palette.set(
        entry.username,
        VACATION_COLOR_OVERRIDES[entry.username] || VACATION_COLOR_PALETTE[index % VACATION_COLOR_PALETTE.length]
      )
    })
    return palette
  }, [profiles])
  const loadCalendarYear = useCallback(async (year) => {
    if (!year || calendarRequestYearsRef.current.has(year)) return

    calendarRequestYearsRef.current.add(year)
    try {
      const result = await fetchVacationCalendar(year)
      setCalendarByYear((prev) => ({ ...prev, [year]: result }))
      setCalendarErrorsByYear((prev) => {
        if (!prev[year]) return prev
        return { ...prev, [year]: '' }
      })
    } catch (error) {
      console.error(`Failed to fetch vacation calendar for ${year}`, error)
      setCalendarErrorsByYear((prev) => ({ ...prev, [year]: error?.message || 'Failed to fetch vacation calendar' }))
    } finally {
      calendarRequestYearsRef.current.delete(year)
    }
  }, [])
  const groupedPeriods = useMemo(
    () => profiles.map((entry) => ({
      profile: entry,
      periods: sortPeriodsChronologically(visiblePeriodsForYear.filter((period) => (
        String(period.username || '').trim().toLowerCase() === String(entry.username || '').trim().toLowerCase()
      )))
    })),
    [profiles, visiblePeriodsForYear]
  )
  const selectedCalendar = calendarByYear[selectedYear] || null
  const todayKey = useMemo(() => getLocalDateKey(new Date()), [])
  const vacationDaysMap = useMemo(() => {
    const days = new Map()

    visiblePeriodsForYear.forEach((period) => {
      listDateKeysInclusive(period.start_date, period.end_date).forEach((dateKey) => {
        const entries = days.get(dateKey) || []
        if (!entries.includes(period.username)) {
          entries.push(period.username)
        }
        days.set(dateKey, entries)
      })
    })

    return days
  }, [visiblePeriodsForYear])
  const dayOffKeySet = useMemo(() => {
    const dayOffKeys = selectedCalendar?.day_off_keys?.length
      ? selectedCalendar.day_off_keys
      : buildWeekendFallbackDayOffKeys(selectedYear)
    return new Set(dayOffKeys)
  }, [selectedCalendar, selectedYear])
  const months = useMemo(
    () => MONTH_LABELS.map((label, index) => ({ label, cells: buildMonthCells(selectedYear, index) })),
    [selectedYear]
  )

  const usedDays = getScheduledDays(ownPeriodsForYear)
  const yearlyLimit = vacationsOverview.yearly_limit || profile?.yearly_limit || 0
  const overLimitDays = Math.max(0, usedDays - yearlyLimit)
  const usagePercent = yearlyLimit > 0 ? Math.round((usedDays / yearlyLimit) * 100) : 0
  const usageMeterPercent = Math.min(100, Math.max(0, usagePercent))

  const nextUpcoming = useMemo(() => {
    return (vacationsOverview.periods || [])
      .filter((period) => period.end_date >= todayKey)
      .filter((period) => period.username === currentUsername)
      .sort((left, right) => left.start_date.localeCompare(right.start_date))[0] || null
  }, [vacationsOverview.periods, currentUsername])
  const calendarStatusText = useMemo(() => {
    if (calendarErrorsByYear[selectedYear]) {
      return 'Не удалось обновить isDayOff, временно показываются обычные выходные.'
    }

    if (!selectedCalendar) {
      return 'Показываются обычные выходные, данные isDayOff догружаются.'
    }

    if (!selectedCalendar.api_available) {
      return `Для ${selectedYear} пока доступны только обычные выходные. Сервер перепроверяет isDayOff раз в неделю.`
    }

    return `Выходные и праздники подставлены из isDayOff. Следующая перепроверка после ${new Date(selectedCalendar.refresh_after).toLocaleDateString('ru-RU')}.`
  }, [calendarErrorsByYear, selectedCalendar, selectedYear])

  useEffect(() => {
    if (!isActive || accessDenied) return

    loadCalendarYear(selectedYear)
    loadCalendarYear(nextCalendarYear)
  }, [accessDenied, isActive, loadCalendarYear, nextCalendarYear, selectedYear])

  const submit = async (event) => {
    event.preventDefault()
    await onSave(editingId, form)
    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (period) => {
    setEditingId(period.id)
    setSelectedYear(period.vacation_year)
    setIsFormExpanded(true)
    setForm({
      start_date: period.start_date,
      end_date: period.end_date,
      note: period.note || ''
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setIsFormExpanded(false)
  }

  const triggerImport = () => {
    fileInputRef.current?.click()
  }

  const handleImportChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const result = await onImportSchedule?.(file)
      if (result?.imported_years?.length) {
        setSelectedYear(result.imported_years[0])
      }
    } catch {
      // Ошибка уже показана в слое App.
    }
  }

  const handleExport = async () => {
    await onExportSchedule?.(selectedYear)
  }

  const headerActions = (
    <>
      <button type="button" className="btn btn-secondary compact" onClick={triggerImport} disabled={importing || accessDenied}>
        <FileUp size={14} /> {importing ? 'Импортирую...' : 'Импорт'}
      </button>
      <button type="button" className="btn btn-secondary compact" onClick={handleExport} disabled={exporting || accessDenied}>
        <Download size={14} /> {exporting ? 'Готовлю...' : `Экспорт ${selectedYear}`}
      </button>
    </>
  )

  const content = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        hidden
        onChange={handleImportChange}
      />

      {accessDenied ? (
        <div className="portal-profile-modal-section">
          <div className="portal-notification-empty">Эта часть доступна только трем администраторам портала.</div>
        </div>
      ) : (
        <>

      <div className="portal-vacation-summary-grid">
        <SummaryCard label="Норма на год" value={`${yearlyLimit} дн.`} accent="rgba(140, 199, 255, 0.22)" />
        <SummaryCard label="Запланировано" value={`${usedDays} дн.`} accent="rgba(250, 204, 21, 0.22)" />
        <SummaryCard label="Сверх нормы" value={`${overLimitDays} дн.`} accent="rgba(74, 222, 128, 0.22)" />
        <SummaryCard
          label="Ближайший период"
          value={nextUpcoming ? `${formatDate(nextUpcoming.start_date)} - ${formatDate(nextUpcoming.end_date)}` : 'Не задан'}
          accent="rgba(151, 47, 255, 0.22)"
        />
      </div>

      <div className="portal-profile-modal-body">
        <section className="portal-profile-modal-section portal-vacation-section portal-vacation-section--hero">
          <div className="portal-vacation-hero">
            <div className="portal-vacation-hero-copy">
              <div className="portal-profile-modal-section-title">Ваш отпускной план</div>
              <div className="portal-notification-section-subtitle">
                {isHiddenUser
                  ? 'Служебная авторизация. Здесь можно разложить отпуск на любые периоды внутри года без жесткого ограничения по норме.'
                  : `${profile?.display_name || user?.name || user?.username}${profile?.position_title ? ` • ${profile.position_title}` : ''}. Здесь можно разложить отпуск на любые периоды внутри года без жесткого ограничения по норме.`}
              </div>
              <div className="portal-vacation-meter">
                <div className="portal-vacation-meter-row">
                  <strong>{usedDays} дн. при норме {yearlyLimit}</strong>
                  <span>{overLimitDays > 0 ? `+${overLimitDays} сверх нормы` : `${usagePercent}% нормы`}</span>
                </div>
                <div className="portal-vacation-meter-track">
                  <div className="portal-vacation-meter-fill" style={{ width: `${usageMeterPercent}%` }} />
                </div>
              </div>
            </div>
            <div className="portal-vacation-hero-controls">
              <div className="portal-vacation-year-switcher">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`phonebook-scope-btn ${selectedYear === year ? 'is-active' : ''}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="portal-profile-modal-section portal-vacation-section portal-vacation-section--form">
          <div className="portal-notification-section-head">
            <div>
              <div className="portal-profile-modal-section-title">{editingId ? 'Редактирование периода' : 'Новый период'}</div>
              <div className="portal-notification-section-subtitle">
                {isFormExpanded
                  ? 'Если отпуск переходит через Новый год, просто разбейте его на два периода.'
                  : 'Форма свернута по умолчанию, чтобы не перегружать окно.'}
              </div>
            </div>
            <div className="portal-notification-toolbar">
              <button className="btn btn-secondary compact" onClick={() => setIsFormExpanded((value) => !value)}>
                {isFormExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {isFormExpanded ? 'Свернуть' : editingId ? 'Показать форму' : 'Новый период'}
              </button>
              <button className="btn btn-secondary compact" onClick={() => {
                setEditingId(null)
                setForm({ ...emptyForm, note: 'Отгул' })
                setIsFormExpanded(true)
              }} title="Отгулы и дополнительные дни можно сохранять без годового ограничения">
                <Plus size={14} /> Создать отгул
              </button>
              <button className="btn btn-secondary compact" onClick={() => {
                onRefresh?.()
                loadCalendarYear(selectedYear)
              }} disabled={loading}>
                <RotateCcw size={14} /> {loading ? 'Обновляю...' : 'Обновить'}
              </button>
              {editingId ? (
                <button className="btn btn-secondary compact" onClick={resetForm}>
                  Сбросить
                </button>
              ) : null}
            </div>
          </div>

          {isFormExpanded ? (
            <form onSubmit={submit} className="portal-vacation-form">
              <label className="portal-notification-field">
                <span>Дата начала</span>
                <input
                  required
                  type="date"
                  className="input-glass"
                  value={form.start_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
                />
              </label>

              <label className="portal-notification-field">
                <span>Дата окончания</span>
                <input
                  required
                  type="date"
                  className="input-glass"
                  value={form.end_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
                />
              </label>

              <label className="portal-notification-field portal-notification-field--wide">
                <span>Заметка</span>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="Например, летний отпуск или семейная поездка"
                  value={form.note}
                  onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                />
              </label>

              <button className="btn btn-primary" type="submit" disabled={saving}>
                {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                {saving ? 'Сохраняю...' : editingId ? 'Сохранить период' : 'Добавить период'}
              </button>
            </form>
          ) : (
            <div className="portal-vacation-collapsed-note">
              Нажмите <strong>Новый период</strong>, когда захотите добавить или поправить отпуск.
            </div>
          )}
        </section>

        <section className="portal-profile-modal-section portal-vacation-section portal-vacation-section--board">
          <div className="portal-notification-section-head">
            <div>
              <div className="portal-profile-modal-section-title">
                {viewMode === 'calendar' ? `Календарь команды на ${selectedYear} год` : `Команда на ${selectedYear} год`}
              </div>
              <div className="portal-notification-section-subtitle">
                {viewMode === 'calendar'
                  ? `${calendarStatusText} Сегодняшний день выделен красным.`
                  : 'Здесь видны периоды всех трех администраторов портала. Редактировать можно только свои записи.'}
              </div>
            </div>
            <div className="portal-vacation-view-switcher">
              <button
                type="button"
                className={`phonebook-scope-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                Список
              </button>
              <button
                type="button"
                className={`phonebook-scope-btn ${viewMode === 'calendar' ? 'is-active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                Календарь
              </button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <div className="portal-vacation-calendar-layout">
              <div className="portal-vacation-calendar-legend">
                {profiles.map((teamMember) => {
                  const accent = paletteByUsername.get(teamMember.username)
                  return (
                    <div key={teamMember.username} className="portal-vacation-legend-chip">
                      <span className="portal-vacation-legend-swatch" style={{ background: accent?.solid }} />
                      <div>
                        <strong>{teamMember.display_name}</strong>
                        <span>{teamMember.position_title}</span>
                      </div>
                    </div>
                  )
                })}
                <div className="portal-vacation-legend-chip is-today">
                  <span className="portal-vacation-legend-swatch is-today" />
                  <div>
                    <strong>Сегодня</strong>
                    <span>Красная рамка в календаре</span>
                  </div>
                </div>
              </div>

              <div className="portal-vacation-calendar-grid">
                {months.map((month) => (
                  <div key={month.label} className="portal-vacation-month-card">
                    <div className="portal-vacation-month-head">
                      <strong>{month.label}</strong>
                      <span>{selectedYear}</span>
                    </div>

                    <div className="portal-vacation-month-weekdays">
                      {WEEKDAY_LABELS.map((weekday) => (
                        <span key={weekday}>{weekday}</span>
                      ))}
                    </div>

                    <div className="portal-vacation-month-days">
                      {month.cells.map((cell, index) => {
                        const isWeekend = index % 7 === 5 || index % 7 === 6

                        if (!cell) {
                          return <div key={`empty-${month.label}-${index}`} className="portal-vacation-day is-empty" aria-hidden="true" style={isWeekend ? { background: 'rgba(239, 68, 68, 0.04)' } : undefined} />
                        }

                        const usernames = vacationDaysMap.get(cell.key) || []
                        const accentList = usernames
                          .map((username) => paletteByUsername.get(username))
                          .filter(Boolean)
                        const isToday = cell.key === todayKey
                        const isDayOff = dayOffKeySet.has(cell.key)

                        let style = undefined

                        if (usernames.length === 0) {
                          if (isDayOff) {
                            style = { background: 'rgba(239, 68, 68, 0.08)', color: '#fca5a5' }
                          }
                        } else if (usernames.length === 1) {
                          style = {
                            background: `linear-gradient(180deg, ${accentList[0].soft}, ${isDayOff ? 'rgba(239, 68, 68, 0.16)' : 'rgba(12, 16, 24, 0.96)'})`,
                            borderColor: accentList[0].border,
                            boxShadow: `0 12px 20px ${accentList[0].glow}`,
                            color: isDayOff ? '#f87171' : undefined
                          }
                        } else {
                          style = {
                            background: buildSegmentedBackground(accentList.map((accent) => accent.solid)),
                            borderColor: isDayOff ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.18)',
                            boxShadow: '0 12px 20px rgba(10, 14, 22, 0.22)',
                            color: isDayOff ? '#fee2e2' : undefined
                          }
                        }

                        const dayOwners = usernames
                          .map((username) => profiles.find((entry) => entry.username === username)?.display_name || username)
                          .join(', ')

                        return (
                          <div
                            key={cell.key}
                            className={`portal-vacation-day ${usernames.length > 0 ? 'is-vacation' : ''} ${isToday ? 'is-today' : ''}`}
                            style={style}
                            title={dayOwners ? `${formatDate(cell.key)}: ${dayOwners}` : formatDate(cell.key)}
                          >
                            <span className="portal-vacation-day-number">{cell.day}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="portal-vacation-groups">
              {groupedPeriods.map(({ profile: teamMember, periods }) => {
                const memberUsedDays = getScheduledDays(periods)
                const memberOverLimitDays = Math.max(0, memberUsedDays - teamMember.yearly_limit)
                const isCurrentUser = teamMember.username === currentUsername
                const accent = paletteByUsername.get(teamMember.username)

                return (
                  <div key={teamMember.username} className="portal-vacation-group-card" style={{ borderColor: accent?.border }}>
                    <div className="portal-vacation-group-head">
                      <div className="portal-vacation-group-person">
                        <span className="portal-vacation-group-accent" style={{ background: accent?.solid }} />
                        <div>
                          <strong>{teamMember.display_name}</strong>
                          <span>{teamMember.position_title}</span>
                        </div>
                      </div>
                      <div className="portal-vacation-group-meta">
                        <span>{memberUsedDays} дн. {memberOverLimitDays > 0 ? `• +${memberOverLimitDays} сверх нормы` : `• норма ${teamMember.yearly_limit} дн.`}</span>
                        {isCurrentUser ? <div className="portal-vacation-chip is-soft">Мои периоды</div> : null}
                      </div>
                    </div>

                    <div className="portal-vacation-cards">
                      {periods.length === 0 ? (
                        <div className="portal-notification-empty">На {selectedYear} год периодов пока нет.</div>
                      ) : periods.map((period) => (
                        <div key={period.id} className="portal-vacation-card">
                          <div className="portal-vacation-card-top">
                            <div className="portal-vacation-chip">
                              <CalendarRange size={14} /> {formatDate(period.start_date)} - {formatDate(period.end_date)}
                            </div>
                            <div className="portal-vacation-chip is-soft">
                              <Clock3 size={14} /> {period.days_count} дн.
                            </div>
                          </div>

                          <div className="portal-vacation-card-body">
                            <strong>{period.note || 'Отпуск без заметки'}</strong>
                            <span>{period.display_name}</span>
                          </div>

                          {isCurrentUser ? (
                            <div className="portal-vacation-card-actions">
                              <button className="btn btn-secondary compact" onClick={() => startEdit(period)}>
                                <Pencil size={14} /> Изменить
                              </button>
                              <button className="btn btn-secondary compact" onClick={() => onDelete(period.id)} disabled={deletingId === period.id}>
                                <Trash2 size={14} /> {deletingId === period.id ? 'Удаляю...' : 'Удалить'}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
        </>
      )}
    </>
  )

  if (pageMode) {
    return (
      <UtilityPageShell
        eyebrow="Профиль"
        title="Отпуска"
        description="Личный отпускной план, календарь команды, импорт расписания и выгрузка по выбранному году."
        onBack={onBack}
        actions={headerActions}
        maxWidth="940px"
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
      panelClassName="glass-panel modal-panel portal-profile-modal portal-vacations-modal"
      panelStyle={{ width: 'min(940px, calc(100vw - 24px))', padding: '20px' }}
      overlayStyle={{
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(10px)',
        zIndex: 330,
        padding: '28px 24px 36px',
        alignItems: 'flex-start',
        overflowY: 'auto'
      }}
    >
      <div className="portal-profile-modal-header">
        <div>
          <div className="portal-profile-modal-eyebrow">Профиль</div>
          <h2>Отпуска</h2>
        </div>
        <div className="portal-notification-head-actions">
          {headerActions}
          <button type="button" className="btn portal-profile-modal-close" onClick={onClose} title="Закрыть">
            <X size={16} />
          </button>
        </div>
      </div>

      {content}
    </ModalShell>
  )
}
