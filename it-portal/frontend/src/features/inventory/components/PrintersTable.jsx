import { Pencil, Printer, Trash2 } from 'lucide-react'
import { ActionIconButton } from '../../../shared/ui/ActionIconButton'

function renderPrinterLocation(printer) {
  const canonical = String(printer.location_name || '').trim()
  const raw = String(printer.room || '').trim()

  if (!canonical && !raw) return '—'
  if (!canonical || canonical === raw) return canonical || raw
  return canonical
}

export function PrintersTable({ filteredPrinters, onInstall, installingCartridgeKey = '', onEditPrinter, onDeletePrinter }) {
  const openEdit = (event, printer) => {
    event.stopPropagation()
    onEditPrinter(event, printer)
  }

  return (
    <div className="printers-main-list glass-panel" style={{ padding: '24px' }}>
      <div className="panel-header" style={{ justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Printer size={22} color="var(--accent)" />
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Размещение</h3>
            <div className="inventory-panel-subtitle">Кому установлен принтер, какая модель используется и какой тип картриджа нужен.</div>
          </div>
        </div>
      </div>
      <div className="printers-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: '72px', textAlign: 'center' }}>Каб.</th>
              <th style={{ width: '190px' }}>Владелец</th>
              <th style={{ width: '240px' }}>Модель оргтехники</th>
              <th style={{ width: '150px' }}>Тип картриджа</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Установить</th>
              <th style={{ width: '70px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredPrinters.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  По текущему запросу размещения принтеров не найдены.
                </td>
              </tr>
            ) : filteredPrinters.map((printer, index) => {
              const newInstallKey = `${printer.id}:new`
              const refilledInstallKey = `${printer.id}:refilled`
              const isInstallingNew = installingCartridgeKey === newInstallKey
              const isInstallingRefilled = installingCartridgeKey === refilledInstallKey

              return (
              <tr key={printer.id ?? index} className="printer-row-item">
                <td style={{ textAlign: 'center' }}>
                  <span className="printer-room-badge editable-tag" role="button" tabIndex={0} onClick={(event) => openEdit(event, printer)} onKeyDown={(event) => event.key === 'Enter' && openEdit(event, printer)}>{renderPrinterLocation(printer)}</span>
                </td>
                <td className="printer-owner-cell">
                  {printer.fio ? (
                    <span className="printer-owner-name">{printer.fio}</span>
                  ) : (
                    <span className="printer-owner-muted">Общий принтер</span>
                  )}
                </td>
                <td className="printer-model-cell">
                  <span className="printer-model-name">{printer.model_name}</span>
                </td>
                <td>
                  <span className="printer-cartridge-badge editable-tag" role="button" tabIndex={0} onClick={(event) => openEdit(event, printer)} onKeyDown={(event) => event.key === 'Enter' && openEdit(event, printer)}>{printer.cartridge_type_name || printer.cartridge_name}</span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div className="printer-install-actions">
                    <button
                      className="btn btn-primary compact printer-install-btn"
                      onClick={() => onInstall(printer.cartridge_type_name || printer.cartridge_name, printer.id, 'new')}
                      disabled={isInstallingNew || isInstallingRefilled}
                      title="Новый (в коробках)"
                    >
                      {isInstallingNew ? '...' : 'Новый'}
                    </button>
                    <button
                      className="btn btn-secondary compact printer-install-btn printer-install-btn-secondary"
                      onClick={() => onInstall(printer.cartridge_type_name || printer.cartridge_name, printer.id, 'refilled')}
                      disabled={isInstallingNew || isInstallingRefilled}
                      title="Заправленный картридж"
                    >
                      {isInstallingRefilled ? '...' : 'Заправ.'}
                    </button>
                  </div>
                </td>
                <td style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div className="printer-row-actions">
                    <ActionIconButton onClick={(event) => onEditPrinter(event, printer)} title="Редактировать" rotate={-8} scale={1.15}>
                      <Pencil size={14} />
                    </ActionIconButton>
                    <ActionIconButton onClick={(event) => onDeletePrinter(event, printer)} title="Удалить" hoverColor="#f87171" rotate={8} scale={1.15}>
                      <Trash2 size={14} />
                    </ActionIconButton>
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
