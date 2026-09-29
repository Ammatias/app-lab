import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'

export function AccountableAssetModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  mode,
  form,
  setForm,
  employees
}) {
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      panelClassName="glass-panel modal-panel item-modal-panel"
      panelStyle={{
        padding: '28px',
        width: '100%',
        maxWidth: '720px',
        border: '1px solid rgba(138,43,226,0.45)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 0 25px rgba(138,43,226,0.25)',
        background: 'linear-gradient(160deg, rgba(20,20,32,0.92), rgba(12,16,28,0.9))'
      }}
      overlayStyle={{
        background: 'radial-gradient(circle at 30% 20%, rgba(138,43,226,0.22), rgba(0,0,0,0.82) 55%)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <form onSubmit={onSubmit} className="modal-form">
        <div className="modal-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'inline-flex', color: 'var(--accent)' }}>
              {mode === 'edit' ? <Pencil size={18} /> : <Plus size={18} />}
            </span>
            <h2 style={{ margin: 0 }}>{mode === 'edit' ? 'Редактировать позицию' : 'Новая позиция'}</h2>
          </div>
          <button type="button" className="btn" onClick={onClose} title="Закрыть">
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Инв. №</span>
              <input
                className="input-glass"
                value={form.inventory_number}
                onChange={(event) => updateField('inventory_number', event.target.value)}
                required
              />
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Количество</span>
              <input
                className="input-glass"
                value={form.quantity}
                onChange={(event) => updateField('quantity', event.target.value)}
              />
            </label>
          </div>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span>Наименование</span>
            <input
              className="input-glass"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              required
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Стоимость</span>
              <input
                className="input-glass"
                value={form.amount}
                onChange={(event) => updateField('amount', event.target.value)}
              />
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span>Размещения</span>
              <textarea
                className="input-glass"
                rows={3}
                value={form.locationsText}
                onChange={(event) => updateField('locationsText', event.target.value)}
                placeholder="Один кабинет на строку или через запятую"
                style={{ resize: 'vertical', minHeight: '88px' }}
              />
            </label>
          </div>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span>Ручная привязка к сотруднику</span>
            <select
              className="input-glass"
              value={form.linked_employee_id || ''}
              onChange={(event) => updateField('linked_employee_id', event.target.value)}
            >
              <option value="">Авто по инвентарнику</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}{employee.department ? ` · ${employee.department}` : ''}
                </option>
              ))}
            </select>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Если выбрать сотрудника, связь пойдет через его рабочее место и расположение подтянется из оборудования.
            </span>
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span>Примечание</span>
            <textarea
              className="input-glass"
              rows={3}
              value={form.note}
              onChange={(event) => updateField('note', event.target.value)}
              placeholder="Обычное служебное примечание по позиции"
              style={{ resize: 'vertical', minHeight: '88px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span>Отметка о списании</span>
            <textarea
              className="input-glass"
              rows={3}
              value={form.writeoff_note}
              onChange={(event) => updateField('writeoff_note', event.target.value)}
              placeholder="Если поле не пустое, запись считается списанной"
              style={{ resize: 'vertical', minHeight: '88px' }}
            />
          </label>
        </div>

        <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '20px' }}>
          <div>
            {mode === 'edit' ? (
              <button
                type="button"
                className="btn"
                onClick={onDelete}
                style={{ color: '#fecaca', borderColor: 'rgba(248,113,113,0.35)' }}
              >
                <Trash2 size={16} /> Удалить
              </button>
            ) : null}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn btn-primary">{mode === 'edit' ? 'Сохранить' : 'Добавить'}</button>
          </div>
        </div>
      </form>
    </ModalShell>
  )
}
