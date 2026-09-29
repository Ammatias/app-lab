import { Plus, Trash2, X } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { findEmployeeById, EMPLOYEE_NONE_VALUE, applyEmployeeToEquipmentForm } from '../../employees/lib/employeeDirectory'
import { createEmptyEquipmentDevice } from '../lib/equipmentForm'

export function EquipmentModal({
  open,
  onClose,
  onSubmit,
  modalMode,
  form,
  setForm,
  employees,
  ipPhones = [],
  onRequestEditPhone
}) {
  const handleEmployeeChange = (value) => {
    if (!value) {
      setForm((prev) => ({ ...prev, employee_id: '', department: '', cabinetsText: '', owner: '', position: '' }))
      return
    }

    const employee = findEmployeeById(employees, value)
    if (!employee) return
    setForm((prev) => applyEmployeeToEquipmentForm(prev, employee))
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const hasLinkedEmployee = form.assignmentKind === 'personal' && Boolean(form.employee_id)

  const updateDevice = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      devices: prev.devices.map((device, deviceIndex) => {
        if (deviceIndex !== index) {
          return field === 'is_primary' && value
            ? { ...device, is_primary: false }
            : device
        }

        return {
          ...device,
          [field]: field === 'is_primary' ? value : value
        }
      })
    }))
  }

  const addDevice = () => {
    setForm((prev) => ({
      ...prev,
      devices: [...prev.devices, createEmptyEquipmentDevice()]
    }))
  }

  const removeDevice = (index) => {
    setForm((prev) => ({
      ...prev,
      devices: prev.devices.filter((_, deviceIndex) => deviceIndex !== index)
    }))
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      panelClassName="glass-panel modal-panel equipment-modal"
      panelStyle={{ width: 'min(1180px, calc(100vw - 32px))' }}
    >
      <form onSubmit={onSubmit} className="equipment-modal-layout">
        <div className="equipment-modal-header">
          <div>
            <div className="equipment-modal-eyebrow">Оборудование</div>
            <h2>{modalMode === 'edit' ? 'Редактирование рабочего места' : 'Новое рабочее место'}</h2>
          </div>
          <button
            type="button"
            className="btn equipment-modal-close"
            onClick={onClose}
            title="Закрыть"
          >
            <X size={16} />
          </button>
        </div>

        <div className="equipment-modal-body">
          <section className="equipment-modal-section">
            <div className="equipment-modal-section-title">Карточка рабочего места</div>
            <div className="equipment-modal-grid equipment-modal-grid--meta">
              <label className="equipment-field">
                <span>Отдел</span>
                <input
                  type="text"
                  className="input-glass"
                  value={form.department}
                  disabled={hasLinkedEmployee}
                  onChange={(event) => updateField('department', event.target.value)}
                  required
                />
              </label>

              <label className="equipment-field">
                <span>Кабинеты</span>
                <textarea
                  className="input-glass"
                  value={form.cabinetsText}
                  disabled={hasLinkedEmployee}
                  onChange={(event) => updateField('cabinetsText', event.target.value)}
                  rows={3}
                  placeholder="Один кабинет на строку или через запятую"
                />
              </label>

              <label className="equipment-field">
                <span>Тип карточки</span>
                <select
                  className="input-glass"
                  value={form.assignmentKind}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setForm((prev) => ({
                      ...prev,
                      assignmentKind: nextValue,
                      employee_id: nextValue === 'shared' ? '' : prev.employee_id
                    }))
                  }}
                >
                  <option value="personal">Рабочее место</option>
                  <option value="shared">Общая техника</option>
                </select>
              </label>

              {form.assignmentKind === 'personal' && (
                <label className="equipment-field">
                  <span>Сотрудник</span>
                  <select
                    className="input-glass"
                    value={form.employee_id || EMPLOYEE_NONE_VALUE}
                    onChange={(event) => handleEmployeeChange(event.target.value)}
                  >
                    <option value={EMPLOYEE_NONE_VALUE}>Без привязки</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name}{employee.department ? ` · ${employee.department}` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="equipment-field">
                <span>{form.assignmentKind === 'shared' ? 'Ответственный / название' : 'Сотрудник'}</span>
                <input
                  type="text"
                  className="input-glass"
                  value={form.owner}
                  disabled={hasLinkedEmployee}
                  onChange={(event) => updateField('owner', event.target.value)}
                />
              </label>

              <label className="equipment-field equipment-field--wide">
                <span>Должность / описание</span>
                <input
                  type="text"
                  className="input-glass"
                  value={form.position}
                  disabled={hasLinkedEmployee}
                  onChange={(event) => updateField('position', event.target.value)}
                />
              </label>
            </div>
          </section>

          {hasLinkedEmployee && ipPhones.length > 0 && (
            <section className="equipment-modal-section">
              <div className="equipment-modal-section-title">Связанные IP-телефоны</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ipPhones.map((phone) => (
                  <div key={phone.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{phone.users || phone.employeeName || 'IP-телефон'}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {[phone.internalNumber ? `Доб. ${phone.internalNumber}` : '', phone.ipAddress ? `IP: ${phone.ipAddress}` : ''].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => onRequestEditPhone(phone)}
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      Открыть карточку
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="equipment-modal-section">
            <div className="equipment-modal-section-bar">
              <div className="equipment-modal-section-title">Устройства</div>
              <button
                type="button"
                className="btn"
                onClick={addDevice}
              >
                <Plus size={16} /> Устройство
              </button>
            </div>

            <div className="equipment-device-editor-list">
              {form.devices.map((device, index) => (
                <article key={`equipment-device-${index + 1}`} className="equipment-device-editor glass-panel">
                  <div className="equipment-device-editor-header">
                    <div>
                      <strong>Устройство {index + 1}</strong>
                      <span>Основная техника, монитор, МФУ, периферия и другое</span>
                    </div>
                    <div className="equipment-device-editor-actions">
                      <label className="equipment-checkbox">
                        <input
                          type="checkbox"
                          checked={Boolean(device.is_primary)}
                          onChange={(event) => updateDevice(index, 'is_primary', event.target.checked)}
                        />
                        <span>Основное</span>
                      </label>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => removeDevice(index)}
                        disabled={form.devices.length === 1}
                        title="Удалить устройство"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="equipment-modal-grid equipment-modal-grid--device">
                    <label className="equipment-field">
                      <span>Тип</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.type_name}
                        onChange={(event) => updateDevice(index, 'type_name', event.target.value)}
                        required
                      />
                    </label>

                    <label className="equipment-field">
                      <span>Заголовок</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.title}
                        onChange={(event) => updateDevice(index, 'title', event.target.value)}
                        placeholder="Можно оставить пустым"
                      />
                    </label>

                    <label className="equipment-field">
                      <span>Производитель</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.manufacturer}
                        onChange={(event) => updateDevice(index, 'manufacturer', event.target.value)}
                      />
                    </label>

                    <label className="equipment-field">
                      <span>Модель</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.model}
                        onChange={(event) => updateDevice(index, 'model', event.target.value)}
                      />
                    </label>

                    <label className="equipment-field">
                      <span>Серийный номер</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.serial}
                        onChange={(event) => updateDevice(index, 'serial', event.target.value)}
                      />
                    </label>

                    <label className="equipment-field">
                      <span>Инвентарный номер</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.inventory_number}
                        onChange={(event) => updateDevice(index, 'inventory_number', event.target.value)}
                      />
                    </label>

                    <label className="equipment-field">
                      <span>Учёт / поставка</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.supplied_at}
                        onChange={(event) => updateDevice(index, 'supplied_at', event.target.value)}
                      />
                    </label>

                    <label className="equipment-field">
                      <span>ОЗУ</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.ram}
                        onChange={(event) => updateDevice(index, 'ram', event.target.value)}
                      />
                    </label>

                    <label className="equipment-field equipment-field--wide">
                      <span>Процессор</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.cpu}
                        onChange={(event) => updateDevice(index, 'cpu', event.target.value)}
                      />
                    </label>

                    <label className="equipment-field">
                      <span>Система</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.system}
                        onChange={(event) => updateDevice(index, 'system', event.target.value)}
                      />
                    </label>

                    <label className="equipment-field equipment-field--wide">
                      <span>Видеосистема</span>
                      <input
                        type="text"
                        className="input-glass"
                        value={device.gpu}
                        onChange={(event) => updateDevice(index, 'gpu', event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="equipment-field-note">
                    Для принтеров и МФУ связь с картриджами подбирается автоматически по модели, сотруднику и кабинету.
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="equipment-modal-footer">
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary">
            {modalMode === 'edit' ? 'Сохранить изменения' : 'Создать карточку'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
