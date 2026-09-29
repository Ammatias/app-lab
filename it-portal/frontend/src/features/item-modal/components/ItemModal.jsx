import { Pencil, Plus } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { ItemFormFields } from './ItemFormFields'

export function ItemModal({
  open,
  onClose,
  onSubmit,
  modalMode,
  modalEntityType,
  currentItemType,
  newItemParams,
  setNewItemParams,
  employees,
  availablePrinterModels,
  availableCartridgeTypes,
  phonebookOrganizations,
  phonebookDepartments,
  phonebookRooms,
  departments,
  locations
}) {
  const phonebookExternalMode = modalEntityType === 'phonebook' && Boolean(newItemParams.is_external)
  const isEquipmentPhoneMode = modalEntityType === 'equipment_phone'
  const modalTitle = isEquipmentPhoneMode
    ? (modalMode === 'edit' ? 'Редактировать IP-телефон' : 'Добавить IP-телефон')
    : modalMode === 'edit'
      ? 'Редактировать запись'
      : 'Добавить запись'

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      panelClassName="glass-panel modal-panel item-modal-panel"
      panelStyle={{
        padding: '28px',
        width: '100%',
        maxWidth: phonebookExternalMode ? '760px' : (isEquipmentPhoneMode ? '520px' : '460px'),
        maxHeight: 'calc(100dvh - 32px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(138,43,226,0.45)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 0 25px rgba(138,43,226,0.25)',
        background: 'linear-gradient(160deg, rgba(20,20,32,0.92), rgba(12,16,28,0.9))'
      }}
      overlayStyle={{
        background: 'radial-gradient(circle at 30% 20%, rgba(138,43,226,0.22), rgba(0,0,0,0.82) 55%)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className="modal-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ display: 'inline-flex', color: 'var(--accent)' }}>
          {modalMode === 'edit' ? <Pencil size={18} /> : <Plus size={18} />}
        </span>
        <h2 style={{ margin: 0 }}>{modalTitle}</h2>
      </div>
      <form onSubmit={onSubmit} className="modal-form" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
        <div style={{ minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', scrollbarGutter: 'stable', paddingRight: '8px' }}>
          <ItemFormFields
            modalEntityType={modalEntityType}
            currentItemType={currentItemType}
            newItemParams={newItemParams}
            setNewItemParams={setNewItemParams}
            employees={employees}
            availablePrinterModels={availablePrinterModels}
            availableCartridgeTypes={availableCartridgeTypes}
            phonebookOrganizations={phonebookOrganizations}
            phonebookDepartments={phonebookDepartments}
            phonebookRooms={phonebookRooms}
            departments={departments}
            locations={locations}
          />
        </div>
        <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0, paddingTop: '14px' }}>
          <button type="button" className="btn" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn btn-primary">{modalMode === 'edit' ? 'Сохранить' : 'Добавить'}</button>
        </div>
      </form>
    </ModalShell>
  )
}
