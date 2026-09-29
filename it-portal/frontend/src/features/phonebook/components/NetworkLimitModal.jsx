import '../styles/network-modals.css'
import { Check, Gauge, Wifi, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getNetworkLimitMbps } from '../../../shared/lib/networkSpeed'
import { ModalShell } from '../../../shared/ui/ModalShell'

const LIMIT_PRESETS = [1, 5, 10, 20, 50, 100]

export function NetworkLimitModal({
  contact,
  busy = false,
  onApply,
  onClear,
  onClose
}) {
  const activeLimit = getNetworkLimitMbps(contact)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft(activeLimit ? String(activeLimit) : '')
    setError('')
  }, [contact?.id, activeLimit])

  const closeModal = () => {
    if (!busy) onClose()
  }

  const submitLimit = async (event) => {
    event.preventDefault()
    if (busy) return
    const limit = Number(draft)

    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
      setError('Введите целое значение от 1 до 1000 Мбит/с.')
      return
    }

    setError('')
    await onApply?.(contact, limit)
    onClose()
  }

  const clearLimit = async () => {
    setError('')
    await onClear?.(contact)
    onClose()
  }

  const host = contact?.tactical_agent_hostname || 'Компьютер не сопоставлен'
  const ip = contact?.tactical_agent_local_ips || 'LAN IP не найден'

  return (
    <ModalShell
      open={Boolean(contact)}
      onClose={closeModal}
      panelClassName="glass-panel modal-panel network-limit-modal"
      panelStyle={{ width: 'min(460px, calc(100vw - 32px))' }}
    >
      <form
        className="network-limit-modal-content"
        onSubmit={submitLimit}
        onKeyDown={(event) => {
          if (event.key === 'Escape') closeModal()
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="network-limit-modal-title"
      >
        <button
          type="button"
          className="network-limit-modal-close"
          onClick={closeModal}
          disabled={busy}
          aria-label="Закрыть окно ограничения скорости"
        >
          <X size={17} />
        </button>

        <header className="network-limit-modal-header">
          <span className="network-limit-modal-icon" aria-hidden="true">
            <Gauge size={24} />
          </span>
          <div className="network-limit-modal-eyebrow">Ideco · скорость загрузки</div>
          <h2 id="network-limit-modal-title">Ограничение скорости</h2>
          <strong>{contact?.name || 'Контакт'}</strong>
          <div className="network-limit-modal-host">
            <span>{host}</span>
            <span><Wifi size={13} /> {ip}</span>
          </div>
        </header>

        <div className={`network-limit-modal-status ${activeLimit ? 'is-active' : ''}`}>
          <span>{activeLimit ? 'Текущий лимит' : 'Сейчас без ограничения'}</span>
          {activeLimit ? <strong>{activeLimit} Мбит/с</strong> : <strong>Полная скорость</strong>}
        </div>

        <fieldset className="network-limit-modal-presets" disabled={busy}>
          <legend>Быстрый выбор</legend>
          <div>
            {LIMIT_PRESETS.map((limit) => (
              <button
                key={limit}
                type="button"
                className={Number(draft) === limit ? 'is-selected' : ''}
                onClick={() => {
                  setDraft(String(limit))
                  setError('')
                }}
                aria-pressed={Number(draft) === limit}
              >
                {limit}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="network-limit-modal-field">
          <span>Скорость загрузки из интернета</span>
          <div>
            <input
              value={draft}
              type="number"
              inputMode="numeric"
              min="1"
              max="1000"
              step="1"
              placeholder="Например, 15"
              autoFocus
              disabled={busy}
              onChange={(event) => {
                setDraft(event.target.value)
                setError('')
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'network-limit-modal-error' : undefined}
            />
            <span>Мбит/с</span>
          </div>
        </label>

        {error ? (
          <p id="network-limit-modal-error" className="network-limit-modal-error" role="alert">
            {error}
          </p>
        ) : null}

        <footer className="network-limit-modal-actions">
          {activeLimit ? (
            <button
              type="button"
              className="network-limit-modal-remove"
              onClick={clearLimit}
              disabled={busy}
            >
              Снять лимит
            </button>
          ) : null}
          <button type="button" className="network-limit-modal-cancel" onClick={closeModal} disabled={busy}>
            Отмена
          </button>
          <button type="submit" className="network-limit-modal-apply" disabled={busy || !draft}>
            <Check size={15} /> {busy ? 'Применяю…' : activeLimit ? 'Изменить' : 'Применить'}
          </button>
        </footer>
      </form>
    </ModalShell>
  )
}
