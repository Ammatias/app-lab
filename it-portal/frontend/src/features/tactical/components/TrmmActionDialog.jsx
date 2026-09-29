import { Power, RotateCw, X } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { getTrmmActionDialogConfig } from '../lib/trmmAction'

export function TrmmActionDialog({ contact, action, reason, busy, onReasonChange, onClose, onConfirm }) {
  const config = getTrmmActionDialogConfig(action)
  const Icon = action === 'wol' ? Power : RotateCw

  return (
    <ModalShell
      open={Boolean(contact && config)}
      onClose={busy ? () => {} : onClose}
      panelClassName="glass-panel trmm-action-dialog"
      panelStyle={{ width: 'min(460px, 100%)', padding: '22px' }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="trmm-action-dialog-title" className="trmm-action-dialog-content">
        <div className="trmm-action-dialog-head">
          <div><Icon size={18} /><span><strong id="trmm-action-dialog-title">{config?.title}</strong><small>{contact?.tactical_agent_hostname || contact?.name}</small></span></div>
          <button type="button" aria-label="Закрыть" disabled={busy} onClick={onClose}><X size={17} /></button>
        </div>
        <p className="trmm-action-dialog-description">{config?.description}</p>
        {config?.requiresReason && (
          <label className="trmm-action-reason">
            <span>Причина <b>обязательно</b></span>
            <textarea
              autoFocus
              rows={3}
              minLength={5}
              maxLength={500}
              value={reason}
              placeholder="Например: установка обновлений"
              onChange={(event) => onReasonChange(event.target.value)}
            />
          </label>
        )}
        <div className="trmm-action-dialog-actions">
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={onClose}>Отмена</button>
          <button
            type="button"
            className={action === 'reboot' ? 'btn btn-danger' : 'btn btn-primary'}
            autoFocus={!config?.requiresReason}
            disabled={busy || (config?.requiresReason && reason.trim().length < 5)}
            onClick={onConfirm}
          >
            <Icon size={14} /> {busy ? config?.pendingLabel : config?.confirmLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
