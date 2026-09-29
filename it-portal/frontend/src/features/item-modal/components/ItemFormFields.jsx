import { readFileAsArrayBuffer, readFileAsBase64 } from '../../../shared/lib/files'
import {
  applyEmployeeToItemForm,
  applyEmployeeToPhonebookForm,
  applyEmployeeToPrinterForm,
  EMPLOYEE_NONE_VALUE,
  findEmployeeById
} from '../../employees/lib/employeeDirectory'
import { extractValidUntilFromCertificate } from '../../ecp/lib/certificate'

const INTERNAL_PHONEBOOK_ORGANIZATION = 'Демо-организация'
const MAX_PRIVATE_KEY_ARCHIVE_BYTES = 20 * 1024 * 1024

const passwordSubtypeOptions = [
  { value: 'resource', label: 'Основная' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'employee_email', label: 'Почта сотрудников' }
]

function PasswordSubtypeSwitcher({ newItemParams, setNewItemParams }) {
  const passwordSubtype = newItemParams.subtype || 'resource'

  return (
    <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Формат записи
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {passwordSubtypeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn ${passwordSubtype === option.value ? 'btn-primary' : ''}`}
            style={{ padding: '8px 12px' }}
            onClick={() => setNewItemParams((prev) => ({
              ...prev,
              subtype: option.value,
              is_draft: false
            }))}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function EmployeeSelectField({ label = 'Сотрудник', employees, value, onChange, allowEmptyLabel = 'Без привязки', marginBottom = '15px' }) {
  return (
    <div style={{ marginBottom }}>
      <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>{label}</label>
      <select
        className="input-glass"
        value={value || EMPLOYEE_NONE_VALUE}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value={EMPLOYEE_NONE_VALUE}>{allowEmptyLabel}</option>
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.full_name}{employee.department ? ` · ${employee.department}` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

const normalizeSelectOptions = (values = [], currentValue = '') => Array.from(new Set(
  [...values, currentValue]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
)).sort((left, right) => left.localeCompare(right, 'ru-RU', { numeric: true }))

function PasswordFields({ newItemParams, setNewItemParams }) {
  const passwordSubtype = newItemParams.subtype || 'resource'

  return (
    <>
      <PasswordSubtypeSwitcher newItemParams={newItemParams} setNewItemParams={setNewItemParams} />

      {passwordSubtype === 'resource' && (
        <>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Описание / endpoint / заметки</label>
            <input
              required
              type="text"
              className="input-glass"
              value={newItemParams.title}
              onChange={(event) => setNewItemParams({ ...newItemParams, title: event.target.value })}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Логин / пользователь</label>
            <textarea
              className="input-glass"
              rows="3"
              style={{ resize: 'vertical' }}
              value={newItemParams.login}
              onChange={(event) => setNewItemParams({ ...newItemParams, login: event.target.value })}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Пароль / секрет</label>
            <textarea
              className="input-glass"
              rows="3"
              style={{ resize: 'vertical' }}
              value={newItemParams.value}
              onChange={(event) => setNewItemParams({ ...newItemParams, value: event.target.value })}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Ресурс / сервер / сервис</label>
            <textarea
              className="input-glass"
              rows="3"
              style={{ resize: 'vertical' }}
              value={newItemParams.description}
              onChange={(event) => setNewItemParams({ ...newItemParams, description: event.target.value })}
            />
          </div>
        </>
      )}

      {passwordSubtype === 'wifi' && (
        <>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>SSID / название точки</label>
            <input
              required
              type="text"
              className="input-glass"
              value={newItemParams.title}
              onChange={(event) => setNewItemParams({ ...newItemParams, title: event.target.value })}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Пароль</label>
            <textarea
              className="input-glass"
              rows="2"
              style={{ resize: 'vertical' }}
              value={newItemParams.value}
              onChange={(event) => setNewItemParams({ ...newItemParams, value: event.target.value })}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Расположение / комментарий</label>
            <textarea
              className="input-glass"
              rows="3"
              style={{ resize: 'vertical' }}
              value={newItemParams.description}
              onChange={(event) => setNewItemParams({ ...newItemParams, description: event.target.value })}
            />
          </div>
        </>
      )}

      {passwordSubtype === 'employee_email' && (
        <>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Сотрудник</label>
            <input
              required
              type="text"
              className="input-glass"
              value={newItemParams.title}
              onChange={(event) => setNewItemParams({ ...newItemParams, title: event.target.value })}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Email</label>
            <input
              required
              type="text"
              className="input-glass"
              value={newItemParams.login}
              onChange={(event) => setNewItemParams({ ...newItemParams, login: event.target.value })}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Пароль</label>
            <textarea
              required
              className="input-glass"
              rows="2"
              style={{ resize: 'vertical' }}
              value={newItemParams.value}
              onChange={(event) => setNewItemParams({ ...newItemParams, value: event.target.value })}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Комментарий</label>
            <textarea
              className="input-glass"
              rows="3"
              style={{ resize: 'vertical' }}
              value={newItemParams.description}
              onChange={(event) => setNewItemParams({ ...newItemParams, description: event.target.value })}
            />
          </div>
        </>
      )}

    </>
  )
}

function EquipmentPhoneFields({ newItemParams, setNewItemParams, employees }) {
  const selectedEmployee = findEmployeeById(employees, newItemParams.employee_id)
  const internalFromDirectory = selectedEmployee?.internal || ''
  const hasLockedInternal = Boolean(internalFromDirectory)

  return (
    <>
      <EmployeeSelectField
        label="Сотрудник"
        employees={employees}
        value={newItemParams.employee_id}
        onChange={(employeeId) => {
          if (!employeeId) {
            setNewItemParams((prev) => ({ ...prev, employee_id: '', fio: '', room: '' }))
            return
          }

          const employee = findEmployeeById(employees, employeeId)
          if (!employee) return
          setNewItemParams((prev) => ({
            ...applyEmployeeToItemForm(prev, employee, 'password'),
            title: employee.internal || ''
          }))
        }}
        allowEmptyLabel="Без канонической привязки"
      />

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Внутренний номер</label>
        <input
          type="text"
          className="input-glass"
          disabled={hasLockedInternal}
          placeholder={hasLockedInternal ? 'Берётся из телефонного справочника' : ''}
          value={hasLockedInternal ? internalFromDirectory : newItemParams.title}
          onChange={(event) => setNewItemParams({ ...newItemParams, title: event.target.value })}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>User / пользователи</label>
        <textarea
          className="input-glass"
          rows="3"
          style={{ resize: 'vertical' }}
          value={newItemParams.fio}
          onChange={(event) => setNewItemParams({ ...newItemParams, fio: event.target.value })}
          placeholder="Один пользователь или несколько через запятую / с новой строки"
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>IP-адрес</label>
        <input
          type="text"
          className="input-glass"
          value={newItemParams.description}
          onChange={(event) => setNewItemParams({ ...newItemParams, description: event.target.value })}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>MAC-адрес</label>
        <input
          type="text"
          className="input-glass"
          value={newItemParams.mac_address}
          onChange={(event) => setNewItemParams({ ...newItemParams, mac_address: event.target.value })}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Логин</label>
        <input
          type="text"
          className="input-glass"
          value={newItemParams.login}
          onChange={(event) => setNewItemParams({ ...newItemParams, login: event.target.value })}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Пароль</label>
        <input
          type="text"
          className="input-glass"
          value={newItemParams.value}
          onChange={(event) => setNewItemParams({ ...newItemParams, value: event.target.value })}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--text-muted)' }}>
        <input
          type="checkbox"
          checked={Boolean(newItemParams.user_matches_login)}
          onChange={(event) => setNewItemParams({ ...newItemParams, user_matches_login: event.target.checked })}
        />
        User и логин совпадают
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--text-muted)' }}>
        <input
          type="checkbox"
          checked={Boolean(newItemParams.is_draft)}
          onChange={(event) => setNewItemParams({ ...newItemParams, is_draft: event.target.checked })}
        />
        Пометить как черновик
      </label>
    </>
  )
}

function ItemEntityFields({ currentItemType, newItemParams, setNewItemParams, employees }) {
  if (currentItemType === 'password') {
    return <PasswordFields newItemParams={newItemParams} setNewItemParams={setNewItemParams} />
  }

  const hasSelectedEmployee = Boolean(newItemParams.employee_id)

  return (
    <>
      {(currentItemType === 'anydesk' || currentItemType === 'ecp') && (
        <EmployeeSelectField
          label="Сотрудник"
          employees={employees}
          value={newItemParams.employee_id}
          onChange={(employeeId) => {
            if (!employeeId) {
              setNewItemParams((prev) => ({ ...prev, employee_id: '', title: '', fio: '', room: '' }))
              return
            }

            const employee = findEmployeeById(employees, employeeId)
            if (!employee) return
            setNewItemParams((prev) => applyEmployeeToItemForm(prev, employee, currentItemType))
          }}
          allowEmptyLabel="Без привязки"
        />
      )}

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>
          {currentItemType === 'anydesk' ? 'Имя компьютера / Владелец' : currentItemType === 'ecp' ? 'ФИО / Организация' : 'Название'}
        </label>
        <input
          required
          type="text"
          className="input-glass"
          value={newItemParams.title}
          disabled={hasSelectedEmployee && (currentItemType === 'anydesk' || currentItemType === 'ecp')}
          onChange={(event) => setNewItemParams({ ...newItemParams, title: event.target.value })}
        />
      </div>

      {currentItemType === 'ecp' && (
        <>
          <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,191,73,0.08)', border: '1px solid rgba(255,191,73,0.18)' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Реквизиты ЭЦП</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>Дата, логин, пароль, открытый файл и ZIP закрытого ключа редактируются здесь.</div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Открытый ключ действует до</label>
            <input
              type="text"
              className="input-glass"
              placeholder="например, 22.03.26"
              value={newItemParams.valid_until}
              onChange={(event) => setNewItemParams({ ...newItemParams, valid_until: event.target.value })}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Логин</label>
            <input
              type="text"
              className="input-glass"
              value={newItemParams.login}
              onChange={(event) => setNewItemParams({ ...newItemParams, login: event.target.value })}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Файл открытой подписи</label>
            <input
              type="file"
              className="input-glass"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return

                try {
                  const [base64, buffer] = await Promise.all([
                    readFileAsBase64(file),
                    readFileAsArrayBuffer(file)
                  ])
                  const extractedValidUntil = await extractValidUntilFromCertificate(buffer)

                  setNewItemParams((prev) => ({
                    ...prev,
                    valid_until: extractedValidUntil || prev.valid_until,
                    file_name: file.name,
                    file_mime_type: file.type || 'application/octet-stream',
                    file_data: base64,
                    remove_public_file: false
                  }))
                } catch (error) {
                  console.error(error)
                  alert('Не удалось прочитать файл подписи')
                }
              }}
            />
            {newItemParams.file_name && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', wordBreak: 'break-all' }}>{newItemParams.file_name}</span>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '6px 10px' }}
                  onClick={() => setNewItemParams((prev) => ({
                    ...prev,
                    file_name: '',
                    file_mime_type: '',
                    file_data: '',
                    remove_public_file: true
                  }))}
                >
                  Скрыть файл
                </button>
              </div>
            )}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Архив закрытого ключа (.zip)</label>
            <input
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="input-glass"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return

                if (!file.name.toLowerCase().endsWith('.zip')) {
                  alert('Закрытый ключ нужно предварительно упаковать в ZIP')
                  event.target.value = ''
                  return
                }
                if (file.size > MAX_PRIVATE_KEY_ARCHIVE_BYTES) {
                  alert('ZIP-архив закрытого ключа не должен превышать 20 МБ')
                  event.target.value = ''
                  return
                }

                try {
                  const base64 = await readFileAsBase64(file)
                  setNewItemParams((prev) => ({
                    ...prev,
                    private_file_name: file.name,
                    private_file_mime_type: file.type || 'application/zip',
                    private_file_data: base64,
                    private_valid_until: '',
                    remove_private_file: false
                  }))
                } catch (error) {
                  console.error(error)
                  alert('Не удалось прочитать ZIP-архив закрытого ключа')
                }
              }}
            />
            <div style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Перед загрузкой упакуйте всю папку закрытого ключа в ZIP, максимум 20 МБ. Срок будет прочитан из header.key при сохранении.
            </div>
            {newItemParams.private_file_name && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', wordBreak: 'break-all' }}>{newItemParams.private_file_name}</span>
                  {newItemParams.private_valid_until && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Закрытый ключ действует до {newItemParams.private_valid_until}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '6px 10px' }}
                  onClick={() => setNewItemParams((prev) => ({
                    ...prev,
                    private_file_name: '',
                    private_file_mime_type: '',
                    private_file_data: '',
                    private_valid_until: '',
                    remove_private_file: true
                  }))}
                >
                  Скрыть архив
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <div style={{ marginBottom: (currentItemType === 'anydesk' || currentItemType === 'ecp') ? '15px' : '25px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>
          {currentItemType === 'anydesk' ? 'Номер AnyDesk' : currentItemType === 'ecp' ? 'Пароль' : 'Значение'}
        </label>
        <input
          required={currentItemType !== 'ecp'}
          type="text"
          className="input-glass"
          value={newItemParams.value}
          onChange={(event) => setNewItemParams({ ...newItemParams, value: event.target.value })}
        />
      </div>

      {currentItemType === 'anydesk' && (
        <>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Кабинет</label>
            <input
              type="text"
              className="input-glass"
              value={newItemParams.room}
              disabled={hasSelectedEmployee}
              onChange={(event) => setNewItemParams({ ...newItemParams, room: event.target.value })}
            />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Пароль доступа AnyDesk</label>
            <input
              type="text"
              className="input-glass"
              value={newItemParams.description}
              onChange={(event) => setNewItemParams({ ...newItemParams, description: event.target.value })}
            />
          </div>
        </>
      )}

      {currentItemType === 'ecp' && (
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Примечание</label>
          <textarea
            className="input-glass"
            rows="2"
            style={{ resize: 'none' }}
            value={newItemParams.description}
            onChange={(event) => setNewItemParams({ ...newItemParams, description: event.target.value })}
          />
        </div>
      )}
    </>
  )
}

function CartridgeTypeSelector({ newItemParams, setNewItemParams, availableCartridgeTypes }) {
  const normalizedTypes = availableCartridgeTypes || []
  const hasExistingType = normalizedTypes.includes(newItemParams.cartridge_type_name)
  const selectionValue = hasExistingType ? newItemParams.cartridge_type_name : '__new__'

  return (
    <>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Тип картриджа</label>
        <select
          className="input-glass"
          value={selectionValue}
          onChange={(event) => {
            const nextValue = event.target.value
            setNewItemParams({
              ...newItemParams,
              cartridge_type_name: nextValue === '__new__' ? '' : nextValue
            })
          }}
        >
          <option value="__new__">Новый тип</option>
          {normalizedTypes.map((typeName) => (
            <option key={typeName} value={typeName}>{typeName}</option>
          ))}
        </select>
      </div>

      {selectionValue === '__new__' && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Новый тип картриджа</label>
          <input
            required
            type="text"
            className="input-glass"
            value={newItemParams.cartridge_type_name}
            onChange={(event) => setNewItemParams({ ...newItemParams, cartridge_type_name: event.target.value })}
          />
        </div>
      )}
    </>
  )
}

export function ItemFormFields({
  modalEntityType,
  currentItemType,
  newItemParams,
  setNewItemParams,
  employees,
  availablePrinterModels,
  availableCartridgeTypes,
  phonebookOrganizations = [],
  phonebookDepartments = [],
  phonebookRooms = [],
  departments = [],
  locations = []
}) {
  if (modalEntityType === 'equipment_phone') {
    return (
      <EquipmentPhoneFields
        newItemParams={newItemParams}
        setNewItemParams={setNewItemParams}
        employees={employees}
      />
    )
  }

  if (modalEntityType === 'item') {
    return (
      <ItemEntityFields
        currentItemType={currentItemType}
        newItemParams={newItemParams}
        setNewItemParams={setNewItemParams}
        employees={employees}
      />
    )
  }

  if (modalEntityType === 'inventory') {
    return (
      <>
        <CartridgeTypeSelector
          newItemParams={newItemParams}
          setNewItemParams={setNewItemParams}
          availableCartridgeTypes={availableCartridgeTypes}
        />

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Название модификации</label>
          <input
            required
            type="text"
            className="input-glass"
            value={newItemParams.name}
            onChange={(event) => setNewItemParams({ ...newItemParams, name: event.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Заправленных</label>
            <input
              type="number"
              min="0"
              className="input-glass"
              value={newItemParams.refilled_count}
              onChange={(event) => setNewItemParams({ ...newItemParams, refilled_count: event.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Новых</label>
            <input
              type="number"
              min="0"
              className="input-glass"
              value={newItemParams.new_count}
              onChange={(event) => setNewItemParams({ ...newItemParams, new_count: event.target.value })}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Критический остаток</label>
          <input
            type="number"
            min="0"
            className="input-glass"
            value={newItemParams.critical_limit}
            onChange={(event) => setNewItemParams({ ...newItemParams, critical_limit: event.target.value })}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Примечание</label>
          <textarea
            className="input-glass"
            rows="2"
            style={{ resize: 'none' }}
            value={newItemParams.note}
            onChange={(event) => setNewItemParams({ ...newItemParams, note: event.target.value })}
          />
        </div>
      </>
    )
  }

  if (modalEntityType === 'printer') {
    const printerModels = availablePrinterModels || []
    const selectedPrinterModel = printerModels.find((entry) => entry.model_name === newItemParams.model_name)
    const printerSelectionValue = selectedPrinterModel ? selectedPrinterModel.model_name : '__new__'
    const hasSelectedEmployee = Boolean(newItemParams.employee_id)

    return (
      <>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ width: '100px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Кабинет</label>
            <input
              type="text"
              className="input-glass"
              value={newItemParams.room}
              disabled={hasSelectedEmployee}
              onChange={(event) => setNewItemParams({ ...newItemParams, room: event.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Владелец</label>
            <select
              className="input-glass"
              value={newItemParams.employee_id || EMPLOYEE_NONE_VALUE}
              onChange={(event) => {
                const employeeId = event.target.value
                if (!employeeId) {
                  setNewItemParams((prev) => ({ ...prev, employee_id: '', fio: '', room: '' }))
                  return
                }

                const employee = findEmployeeById(employees, employeeId)
                if (!employee) return
                setNewItemParams((prev) => applyEmployeeToPrinterForm(prev, employee))
              }}
            >
              <option value={EMPLOYEE_NONE_VALUE}>Общий принтер / без владельца</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}{employee.department ? ` · ${employee.department}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Выбор модели принтера</label>
          <select
            className="input-glass"
            value={printerSelectionValue}
            onChange={(event) => {
              const nextValue = event.target.value
              if (nextValue === '__new__') {
                setNewItemParams({
                  ...newItemParams,
                  model_name: '',
                  cartridge_type_name: ''
                })
                return
              }

              const matched = printerModels.find((entry) => entry.model_name === nextValue)
              setNewItemParams({
                ...newItemParams,
                model_name: matched?.model_name || nextValue,
                cartridge_type_name: matched?.cartridge_type_name || newItemParams.cartridge_type_name
              })
            }}
          >
            <option value="__new__">Новая модель принтера</option>
            {printerModels.map((entry) => (
              <option key={entry.model_name} value={entry.model_name}>
                {entry.model_name}
              </option>
            ))}
          </select>
        </div>

        {printerSelectionValue === '__new__' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Новая модель принтера</label>
            <input
              required
              type="text"
              className="input-glass"
              value={newItemParams.model_name}
              onChange={(event) => setNewItemParams({ ...newItemParams, model_name: event.target.value })}
            />
          </div>
        )}

        <CartridgeTypeSelector
          newItemParams={newItemParams}
          setNewItemParams={setNewItemParams}
          availableCartridgeTypes={availableCartridgeTypes}
        />
      </>
    )
  }

  const isExternalPhonebook = Boolean(newItemParams.is_external)
  const normalizedOrganizations = Array.from(new Set(
    phonebookOrganizations
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .filter((value) => value !== INTERNAL_PHONEBOOK_ORGANIZATION)
  )).sort((left, right) => left.localeCompare(right))
  const hasExistingOrganization =
    Boolean(newItemParams.organization) && normalizedOrganizations.includes(newItemParams.organization)
  const organizationSelectionValue = hasExistingOrganization ? newItemParams.organization : '__new__'
  const departmentOptions = departments.length
    ? departments
        .slice()
        .sort((left, right) => (left.canonical_name || '').localeCompare(right.canonical_name || '', 'ru-RU'))
    : normalizeSelectOptions(phonebookDepartments, newItemParams.department).map((department) => ({
        id: department,
        canonical_name: department
      }))
  const roomOptions = locations.length
    ? locations
        .slice()
        .sort((left, right) => (left.canonical_name || '').localeCompare(right.canonical_name || '', 'ru-RU', { numeric: true }))
    : normalizeSelectOptions(phonebookRooms, newItemParams.room).map((room) => ({
        id: room,
        canonical_name: room
      }))

  return (
    <>
      <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Раздел справочника
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${!isExternalPhonebook ? 'btn-primary' : ''}`}
            style={{ padding: '8px 12px' }}
            onClick={() => setNewItemParams((prev) => ({
              ...prev,
              department_id: '',
              location_id: '',
              is_external: false,
              organization: INTERNAL_PHONEBOOK_ORGANIZATION
            }))}
          >
            Внутренний
          </button>
          <button
            type="button"
            className={`btn ${isExternalPhonebook ? 'btn-primary' : ''}`}
            style={{ padding: '8px 12px' }}
            onClick={() => setNewItemParams((prev) => ({
              ...prev,
              employee_id: '',
              department_id: '',
              location_id: '',
              is_external: true,
              organization: prev.organization && prev.organization !== INTERNAL_PHONEBOOK_ORGANIZATION ? prev.organization : ''
            }))}
          >
            Внешний
          </button>
        </div>
      </div>

      {!isExternalPhonebook && (
        <EmployeeSelectField
          label="Сотрудник"
          employees={employees}
          value={newItemParams.employee_id}
          onChange={(employeeId) => {
            if (!employeeId) {
              setNewItemParams((prev) => ({ ...prev, employee_id: '' }))
              return
            }

            const employee = findEmployeeById(employees, employeeId)
            if (!employee) return
            setNewItemParams((prev) => ({
              ...applyEmployeeToPhonebookForm(prev, employee),
              organization: INTERNAL_PHONEBOOK_ORGANIZATION,
              is_external: false
            }))
          }}
          allowEmptyLabel="Новый сотрудник"
        />
      )}

      {isExternalPhonebook && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Организация</label>
            <select
              className="input-glass"
              value={organizationSelectionValue}
              onChange={(event) => {
                const nextValue = event.target.value
                setNewItemParams((prev) => ({
                  ...prev,
                  organization: nextValue === '__new__' ? prev.organization : nextValue
                }))
              }}
            >
              <option value="__new__">Новая организация...</option>
              {normalizedOrganizations.map((organization) => (
                <option key={organization} value={organization}>
                  {organization}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>
              {hasExistingOrganization ? 'Или новая организация' : 'Название организации'}
            </label>
            <input
              required
              type="text"
              className="input-glass"
              placeholder="Например, Ростелеком"
              value={newItemParams.organization}
              onChange={(event) => setNewItemParams((prev) => ({ ...prev, organization: event.target.value }))}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>
            {isExternalPhonebook ? 'Направление / отдел' : 'Отдел'}
          </label>
          {isExternalPhonebook ? (
            <input required type="text" className="input-glass" value={newItemParams.department} onChange={(event) => setNewItemParams({ ...newItemParams, department: event.target.value })} />
          ) : (
            <select
              required
              className="input-glass"
              value={newItemParams.department_id || ''}
              onChange={(event) => {
                const department = departmentOptions.find((item) => String(item.id) === String(event.target.value))
                setNewItemParams({
                  ...newItemParams,
                  department_id: event.target.value,
                  department: department?.canonical_name || ''
                })
              }}
            >
              <option value="">Выберите отдел</option>
              {departmentOptions.map((department) => (
                <option key={department.id} value={department.id}>{department.canonical_name}</option>
              ))}
            </select>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>ФИО</label>
          <input required type="text" className="input-glass" value={newItemParams.name} onChange={(event) => setNewItemParams({ ...newItemParams, name: event.target.value })} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Должность</label>
          <input type="text" className="input-glass" value={newItemParams.position} onChange={(event) => setNewItemParams({ ...newItemParams, position: event.target.value })} />
        </div>
        <div style={{ width: isExternalPhonebook ? '80px' : '130px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Кабинет</label>
          {isExternalPhonebook ? (
            <input type="text" className="input-glass" value={newItemParams.room} onChange={(event) => setNewItemParams({ ...newItemParams, room: event.target.value })} />
          ) : (
            <select
              className="input-glass"
              value={newItemParams.location_id || ''}
              onChange={(event) => {
                const location = roomOptions.find((item) => String(item.id) === String(event.target.value))
                setNewItemParams({
                  ...newItemParams,
                  location_id: event.target.value,
                  room: location?.canonical_name || ''
                })
              }}
            >
              <option value="">Без кабинета</option>
              {roomOptions.map((room) => (
                <option key={room.id} value={room.id}>{room.canonical_name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Эл. почта</label>
        <input type="text" className="input-glass" value={newItemParams.email} onChange={(event) => setNewItemParams({ ...newItemParams, email: event.target.value })} />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Гор. телефон</label>
          <input type="text" className="input-glass" value={newItemParams.phone} onChange={(event) => setNewItemParams({ ...newItemParams, phone: event.target.value })} />
        </div>
        <div style={{ width: '80px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Внутр.</label>
          <input type="text" className="input-glass" value={newItemParams.internal} onChange={(event) => setNewItemParams({ ...newItemParams, internal: event.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Моб. телефон</label>
          <input type="text" className="input-glass" value={newItemParams.mobile} onChange={(event) => setNewItemParams({ ...newItemParams, mobile: event.target.value })} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isExternalPhonebook ? '16px' : '25px', color: 'var(--text-muted)' }}>
        <input
          type="checkbox"
          checked={Boolean(newItemParams.accounting_flag)}
          onChange={(event) => setNewItemParams({ ...newItemParams, accounting_flag: event.target.checked })}
        />
        Учётчик
      </label>

      {isExternalPhonebook && (
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Примечание</label>
          <textarea
            className="input-glass"
            rows="4"
            style={{ resize: 'vertical', minWidth: 0, width: '100%' }}
            value={newItemParams.note}
            onChange={(event) => setNewItemParams({ ...newItemParams, note: event.target.value })}
          />
        </div>
      )}
    </>
  )
}
