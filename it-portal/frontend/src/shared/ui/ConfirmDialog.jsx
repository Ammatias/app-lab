import { AlertTriangle } from 'lucide-react'
import { ModalShell } from './ModalShell'

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  confirmDisabled = false,
  cancelDisabled = false
}) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      overlayClassName="modal-overlay modal-overlay-danger"
      overlayStyle={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 200
      }}
      panelClassName="glass-panel modal-panel delete-modal-panel"
      panelStyle={{
        padding: '30px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        background: 'linear-gradient(160deg, rgba(30,20,32,0.95), rgba(12,16,28,0.95))',
        border: '1px solid rgba(248,113,113,0.3)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}
    >
      <AlertTriangle size={50} color="#f87171" style={{ marginBottom: '15px' }} />
      <h3 style={{ margin: '0 0 10px', fontSize: '1.4rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>{description}</p>
      <div className="modal-actions modal-actions-centered" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          className="btn"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={onClose}
          disabled={cancelDisabled}
        >
          {cancelLabel}
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444', boxShadow: '0 0 15px rgba(239,68,68,0.4)', justifyContent: 'center' }}
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  )
}
