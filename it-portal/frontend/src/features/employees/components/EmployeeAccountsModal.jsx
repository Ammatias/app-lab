import { useEffect, useMemo, useState } from 'react'
import { Archive, RotateCcw, Search, UserRound, X } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { UtilityPageShell } from '../../../shared/ui/UtilityPageShell'
import { createEmptyEmployeeAccountForm, createEmployeeAccountFormFromEmployee } from '../lib/employeeAccountsForm'

const employeeMatchesSearch = (employee, query) => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return [
    employee.full_name,
    employee.department,
    employee.room,
    employee.position,
    employee.email,
    employee.phone,
    employee.internal,
    employee.mobile
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery))
}

const getEmployeeLinkCount = (employee) => (
  (employee?.links?.phonebook?.length || 0) +
  (employee?.links?.printers?.length || 0) +
  (employee?.links?.equipment?.length || 0) +
  (employee?.links?.anydesk?.length || 0) +
  (employee?.links?.ecp?.length || 0) +
  (employee?.links?.ip_phone?.length || 0) +
  (employee?.links?.accountable?.length || 0)
)

const getEmployeeLinkSummary = (employee) => [
  ['Справочник (будет скрыт)', employee?.links?.phonebook?.length || 0],
  ['Подотчет', employee?.links?.accountable?.length || 0],
  ['Принтеры', employee?.links?.printers?.length || 0],
  ['Рабочие места', employee?.links?.equipment?.length || 0],
  ['AnyDesk', employee?.links?.anydesk?.length || 0],
  ['ЭЦП', employee?.links?.ecp?.length || 0],
  ['IP-телефоны', employee?.links?.ip_phone?.length || 0]
].filter(([, count]) => count > 0)

export function EmployeeAccountsModal({
  open,
  onClose,
  employees,
  archivedEmployees = [],
  departments = [],
  locations = [],
  loadingArchive = false,
  onSave,
  onArchive,
  onRefreshArchive,
  onRestore,
  pageMode = false,
  onBack = null
}) {
  const isActive = pageMode || open
  const [showDetachedOnly, setShowDetachedOnly] = useState(true)
  const [showArchive, setShowArchive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)
  const [form, setForm] = useState(createEmptyEmployeeAccountForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [replacementEmployeeId, setReplacementEmployeeId] = useState('')

  const activeEmployees = showArchive ? archivedEmployees : employees
  const departmentOptions = useMemo(() => (
    departments
      .slice()
      .sort((left, right) => (left.canonical_name || '').localeCompare(right.canonical_name || '', 'ru-RU'))
  ), [departments])
  const roomOptions = useMemo(() => (
    locations
      .slice()
      .sort((left, right) => (left.canonical_name || '').localeCompare(right.canonical_name || '', 'ru-RU', { numeric: true }))
  ), [locations])

  const filteredEmployees = useMemo(() => (
    activeEmployees
      .filter((employee) => showArchive || !showDetachedOnly || employee.links.phonebook.length === 0)
      .filter((employee) => employeeMatchesSearch(employee, searchQuery))
      .slice()
      .sort((left, right) => {
        const nameDiff = (left.full_name || '').localeCompare(right.full_name || '')
        if (nameDiff !== 0) return nameDiff
        return (left.department || '').localeCompare(right.department || '')
      })
  ), [activeEmployees, searchQuery, showArchive, showDetachedOnly])

  const selectedEmployee = useMemo(
    () => activeEmployees.find((employee) => employee.id === editingEmployeeId) || null,
    [activeEmployees, editingEmployeeId]
  )

  useEffect(() => {
    if (!isActive || !showArchive) return

    const request = onRefreshArchive?.()
    request?.catch((error) => {
      console.error('Failed to refresh archived employees', error)
    })
  }, [isActive, onRefreshArchive, showArchive])

  useEffect(() => {
    if (!isActive) {
      setIsCreating(false)
      setShowArchiveConfirm(false)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return

    if (selectedEmployee) {
      setForm(createEmployeeAccountFormFromEmployee(selectedEmployee))
      return
    }

    if (!isCreating && filteredEmployees.length > 0) {
      setEditingEmployeeId(filteredEmployees[0].id)
      return
    }

    setForm(createEmptyEmployeeAccountForm())
  }, [isActive, selectedEmployee, filteredEmployees, isCreating])

  useEffect(() => {
    if (!isActive) return

    if (editingEmployeeId && !filteredEmployees.some((employee) => employee.id === editingEmployeeId)) {
      if (filteredEmployees[0]) {
        setEditingEmployeeId(filteredEmployees[0].id)
      } else {
        setEditingEmployeeId(null)
        setForm(createEmptyEmployeeAccountForm())
      }
    }
  }, [isActive, filteredEmployees, editingEmployeeId])

  const handleOpenCreate = () => {
    setShowArchive(false)
    setIsCreating(true)
    setEditingEmployeeId(null)
    setForm(createEmptyEmployeeAccountForm())
  }

  const handleSelectEmployee = (employee) => {
    setIsCreating(false)
    setEditingEmployeeId(employee.id)
    setForm(createEmployeeAccountFormFromEmployee(employee))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      await onSave(editingEmployeeId, form)
      if (pageMode) {
        setIsCreating(false)
      } else {
        onClose?.()
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleRequestArchive = () => {
    if (!editingEmployeeId || !selectedEmployee) return
    setReplacementEmployeeId('')
    setShowArchiveConfirm(true)
  }

  const handleArchive = async () => {
    if (!editingEmployeeId || !selectedEmployee) return
    setIsSaving(true)
    try {
      await onArchive(editingEmployeeId, {
        replacement_employee_id: replacementEmployeeId ? Number(replacementEmployeeId) : null
      })
      setShowArchiveConfirm(false)
      setIsCreating(false)
      setEditingEmployeeId(null)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestore = async () => {
    if (!editingEmployeeId || !selectedEmployee) return
    setIsSaving(true)
    try {
      await onRestore?.(editingEmployeeId)
      setEditingEmployeeId(null)
      await onRefreshArchive?.()
    } finally {
      setIsSaving(false)
    }
  }

  const detachedCount = employees.filter((employee) => employee.links.phonebook.length === 0).length
  const archiveReplacementOptions = employees
    .filter((employee) => Number(employee.id) !== Number(editingEmployeeId))
    .slice()
    .sort((left, right) => (left.full_name || '').localeCompare(right.full_name || '', 'ru-RU'))
  const archiveLinkSummary = getEmployeeLinkSummary(selectedEmployee)

  const content = (
    <>
      <div className="employee-accounts-modal-toolbar">
        <div className="employee-accounts-search">
          <Search size={16} />
          <input
            type="text"
            className="input-glass"
            placeholder="Поиск сотрудника..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <button
          type="button"
          className={`btn ${showArchive ? 'btn-primary' : ''}`}
          onClick={() => {
            setShowArchive((prev) => !prev)
            setIsCreating(false)
            setEditingEmployeeId(null)
          }}
        >
          <Archive size={16} /> Архив
        </button>

        {!showArchive && (
          <button
            type="button"
            className={`btn ${showDetachedOnly ? 'btn-primary' : ''}`}
            onClick={() => setShowDetachedOnly((prev) => !prev)}
          >
            {showDetachedOnly ? 'Только вне справочника' : 'Показывать всех'}
          </button>
        )}

        <div className="glass-panel employee-accounts-summary">
          <span>{showArchive ? 'В архиве' : 'Вне справочника'}</span>
          <strong>{showArchive ? archivedEmployees.length : detachedCount}</strong>
        </div>

        <button type="button" className="btn" onClick={handleOpenCreate} disabled={showArchive}>
          Новый сотрудник
        </button>
      </div>

      <div className="employee-accounts-layout">
        <aside className="employee-accounts-list glass-panel">
          {loadingArchive && showArchive ? (
            <div className="employee-accounts-empty">
              <strong>Загружаю архив...</strong>
              <span>Список архивных сотрудников подтягивается с backend.</span>
            </div>
          ) : filteredEmployees.length ? (
            filteredEmployees.map((employee) => {
              const isDetached = employee.links.phonebook.length === 0

              return (
                <button
                  key={employee.id}
                  type="button"
                  className={`employee-account-card ${editingEmployeeId === employee.id ? 'is-active' : ''}`}
                  onClick={() => handleSelectEmployee(employee)}
                >
                  <div className="employee-account-card-header">
                    <span className="employee-account-card-avatar">
                      <UserRound size={15} />
                    </span>
                    <div className="employee-account-card-copy">
                      <strong>{employee.full_name}</strong>
                      <span>{employee.department || 'Без отдела'}</span>
                    </div>
                  </div>
                  <div className="employee-account-card-meta">
                    <span>{showArchive ? 'Архив' : isDetached ? 'Вне справочника' : 'Есть в справочнике'}</span>
                    <span>Связей: {getEmployeeLinkCount(employee)}</span>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="employee-accounts-empty">
              <strong>Сотрудники не найдены</strong>
              <span>Смени фильтр или создай новую учетку вручную.</span>
            </div>
          )}
        </aside>

        <form className="employee-accounts-form glass-panel" onSubmit={handleSubmit}>
          <div className="employee-accounts-form-header">
            <div>
              <div className="employee-accounts-form-eyebrow">
                {showArchive ? 'Архив' : editingEmployeeId ? 'Редактирование' : 'Создание'}
              </div>
              <h3>{showArchive ? 'Архивный профиль' : editingEmployeeId ? 'Профиль сотрудника' : 'Новая учетка'}</h3>
            </div>
          </div>

          <div className="employee-accounts-form-grid">
            <label className="employee-accounts-field employee-accounts-field--wide">
              <span>ФИО</span>
              <input
                required
                disabled={showArchive}
                type="text"
                className="input-glass"
                value={form.full_name}
                onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
              />
            </label>

            <label className="employee-accounts-field">
              <span>Отдел</span>
              <select
                className="input-glass"
                required
                disabled={showArchive}
                value={form.department_id || ''}
                onChange={(event) => {
                  const department = departmentOptions.find((item) => Number(item.id) === Number(event.target.value))
                  setForm((prev) => ({
                    ...prev,
                    department_id: event.target.value,
                    department: department?.canonical_name || ''
                  }))
                }}
              >
                <option value="">Выберите отдел</option>
                {departmentOptions.map((department) => (
                  <option key={department.id} value={department.id}>{department.canonical_name}</option>
                ))}
              </select>
            </label>

            <label className="employee-accounts-field">
              <span>Кабинет</span>
              <select
                className="input-glass"
                disabled={showArchive}
                value={form.location_id || ''}
                onChange={(event) => {
                  const location = roomOptions.find((item) => Number(item.id) === Number(event.target.value))
                  setForm((prev) => ({
                    ...prev,
                    location_id: event.target.value,
                    room: location?.canonical_name || ''
                  }))
                }}
              >
                <option value="">Без кабинета</option>
                {roomOptions.map((room) => (
                  <option key={room.id} value={room.id}>{room.canonical_name}</option>
                ))}
              </select>
            </label>

            <label className="employee-accounts-field employee-accounts-field--wide">
              <span>Должность</span>
              <input
                type="text"
                disabled={showArchive}
                className="input-glass"
                value={form.position}
                onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
              />
            </label>

            <label className="employee-accounts-field employee-accounts-field--wide">
              <span>Эл. почта</span>
              <input
                type="text"
                disabled={showArchive}
                className="input-glass"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>

            <label className="employee-accounts-field">
              <span>Гор. телефон</span>
              <input
                type="text"
                disabled={showArchive}
                className="input-glass"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </label>

            <label className="employee-accounts-field">
              <span>Внутренний</span>
              <input
                type="text"
                disabled={showArchive}
                className="input-glass"
                value={form.internal}
                onChange={(event) => setForm((prev) => ({ ...prev, internal: event.target.value }))}
              />
            </label>

            <label className="employee-accounts-field employee-accounts-field--wide">
              <span>Мобильный</span>
              <input
                type="text"
                disabled={showArchive}
                className="input-glass"
                value={form.mobile}
                onChange={(event) => setForm((prev) => ({ ...prev, mobile: event.target.value }))}
              />
            </label>
          </div>

          <div className="employee-accounts-form-actions">
            {showArchive && editingEmployeeId ? (
              <button type="button" className="btn btn-primary" onClick={handleRestore} disabled={isSaving}>
                <RotateCcw size={16} /> {isSaving ? 'Восстановление...' : 'Восстановить'}
              </button>
            ) : editingEmployeeId && (
              <button type="button" className="btn" onClick={handleRequestArchive} disabled={isSaving}>
                <Archive size={16} /> В архив
              </button>
            )}
            <button type="button" className="btn" onClick={handleOpenCreate} disabled={showArchive}>
              Очистить
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving || showArchive}>
              {isSaving ? 'Сохранение...' : editingEmployeeId ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>

      <ModalShell
        open={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        overlayClassName="modal-overlay modal-overlay-danger"
        overlayStyle={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 200
        }}
        panelClassName="glass-panel modal-panel delete-modal-panel"
        panelStyle={{
          padding: '30px',
          maxWidth: '460px',
          width: '100%',
          background: 'linear-gradient(160deg, rgba(30,20,32,0.95), rgba(12,16,28,0.95))',
          border: '1px solid rgba(248,113,113,0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        <Archive size={42} color="#f87171" style={{ marginBottom: '15px' }} />
        <h3 style={{ margin: '0 0 10px', fontSize: '1.4rem' }}>Отправить сотрудника в архив?</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '18px' }}>
          Профиль "{selectedEmployee?.full_name || 'сотрудника'}" будет скрыт из активного справочника.
        </p>

        {archiveLinkSummary.length > 0 && (
          <div className="employee-archive-summary">
            {archiveLinkSummary.map(([label, count]) => (
              <span key={label}>{label}: {count}</span>
            ))}
          </div>
        )}

        <label className="employee-accounts-field employee-archive-field">
          <span>Передать связанные записи</span>
          <select
            className="input-glass"
            value={replacementEmployeeId}
            onChange={(event) => setReplacementEmployeeId(event.target.value)}
            disabled={isSaving}
          >
            <option value="">Не передавать (сохранить за архивным сотрудником)</option>
            {archiveReplacementOptions.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}{employee.department ? ` · ${employee.department}` : ''}
              </option>
            ))}
          </select>
          <small className="employee-archive-hint">
            Если не выбрать сотрудника, оборудование и другие записи останутся привязаны к архивному профилю как исторические данные.
          </small>
        </label>

        <div className="modal-actions modal-actions-centered" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            className="btn"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setShowArchiveConfirm(false)}
            disabled={isSaving}
          >
            Отмена
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444', boxShadow: '0 0 15px rgba(239,68,68,0.4)', justifyContent: 'center' }}
            onClick={handleArchive}
            disabled={isSaving}
          >
            {isSaving ? 'Архивирую...' : replacementEmployeeId ? 'Передать и архивировать' : 'Архивировать'}
          </button>
        </div>
      </ModalShell>
    </>
  )

  if (pageMode) {
    return (
      <UtilityPageShell
        eyebrow="Сотрудники"
        title="Учетки вне справочника"
        description="Отдельный реестр профилей сотрудников для ручного сопровождения и привязки связей по порталу."
        onBack={onBack}
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
      panelClassName="glass-panel modal-panel employee-accounts-modal"
      panelStyle={{ width: 'min(1180px, calc(100vw - 32px))' }}
    >
      <div className="employee-accounts-modal-header">
        <div>
          <div className="portal-profile-modal-eyebrow">Сотрудники</div>
          <h2>Учетки вне справочника</h2>
        </div>
        <button
          type="button"
          className="btn portal-profile-modal-close"
          onClick={onClose}
          title="Закрыть"
        >
          <X size={16} />
        </button>
      </div>

      {content}
    </ModalShell>
  )
}
