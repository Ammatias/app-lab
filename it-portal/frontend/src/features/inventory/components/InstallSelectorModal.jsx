import { Package } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'

export function InstallSelectorModal({ installSelector, onClose, onSelect }) {
  return (
    <ModalShell
      open={installSelector.show}
      onClose={onClose}
      overlayStyle={{ zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
      panelClassName="glass-panel modal-panel install-modal-panel"
      panelStyle={{ width: '400px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <Package size={42} color="var(--accent)" style={{ marginBottom: '15px', opacity: 0.9 }} />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Выберите модель</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>
          Для типа <strong>{installSelector.cartridgeName}</strong> доступно несколько модификаций:
        </p>
      </div>
      <div className="install-options" style={{ display: 'grid', gap: '12px' }}>
        {installSelector.options.map((option) => {
          const availableCount = installSelector.stockType === 'new' ? option.new_count : option.refilled_count
          const stockLabel = installSelector.stockType === 'new' ? 'нов.' : 'зап.'

          return (
          <button
            key={option.id}
            className="btn btn-secondary"
            style={{ justifyContent: 'space-between', padding: '18px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}
            onClick={() => onSelect(option)}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{option.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {option.note || `Доступно ${availableCount} ${stockLabel}`}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                {availableCount}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                {stockLabel}
              </span>
            </div>
          </button>
          )
        })}
      </div>
      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '25px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', cursor: 'pointer' }}
        onClick={onClose}
      >
        Отмена
      </button>
    </ModalShell>
  )
}
