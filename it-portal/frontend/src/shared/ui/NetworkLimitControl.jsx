import { Gauge, X } from 'lucide-react'
import { useState } from 'react'
import { getNetworkLimitMbps } from '../lib/networkSpeed'

export function NetworkLimitControl({
  contact,
  compact = false,
  iconOnly = false,
  busy = false,
  onApply,
  onClear
}) {
  const activeLimit = getNetworkLimitMbps(contact)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const submitLimit = async (event) => {
    event.preventDefault()
    const limit = Number(draft)
    if (!Number.isInteger(limit) || limit < 1) {
      alert('Введите целое число Мбит/с, например 1 или 5')
      return
    }

    await onApply?.(contact, limit)
    setEditing(false)
    setDraft('')
  }

  if (activeLimit) {
    return (
      <div className={`network-limit-control ${compact ? 'is-compact' : ''} is-active`}>
        <span className="network-limit-badge" title={`Ограничено до ${activeLimit} Мбит/с`}>
          <Gauge size={12} />
          {activeLimit} Мбит/с
        </span>
        <button
          type="button"
          className="network-limit-button is-cancel"
          disabled={busy}
          title="Отменить ограничение скорости"
          onClick={() => onClear?.(contact)}
        >
          <X size={12} />
          <span>Отменить</span>
        </button>
      </div>
    )
  }

  if (!editing) {
    return (
      <button
        type="button"
        className={`network-limit-button ${compact ? 'is-compact' : ''} ${iconOnly ? 'is-icon' : ''}`}
        disabled={busy || !contact?.tactical_agent_local_ips}
        onClick={() => {
          setDraft('')
          setEditing(true)
        }}
        title={contact?.tactical_agent_local_ips ? 'Ограничить скорость загрузки через Ideco' : 'Нет LAN IP для ограничения'}
        aria-label={contact?.tactical_agent_local_ips ? 'Ограничить скорость' : 'Ограничение недоступно: нет LAN IP'}
      >
        <Gauge size={iconOnly ? 14 : 12} />
        {iconOnly ? null : <span>Ограничить скорость</span>}
      </button>
    )
  }

  return (
    <form className={`network-limit-control ${compact ? 'is-compact' : ''}`} onSubmit={submitLimit}>
      <input
        value={draft}
        type="number"
        inputMode="numeric"
        min="1"
        max="1000"
        step="1"
        placeholder="5"
        autoFocus
        disabled={busy}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Скорость в Мбит/с"
      />
      <button type="submit" className="network-limit-button is-apply" disabled={busy}>
        <span>Ограничить</span>
      </button>
      <button
        type="button"
        className="network-limit-button is-icon"
        disabled={busy}
        onClick={() => {
          setEditing(false)
          setDraft('')
        }}
        aria-label="Отменить ввод ограничения"
      >
        <X size={12} />
      </button>
    </form>
  )
}
