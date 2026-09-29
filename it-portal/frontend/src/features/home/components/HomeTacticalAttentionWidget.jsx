import { AlertTriangle, MonitorOff } from 'lucide-react'
import { useMemo } from 'react'
import { buildTrmmAttentionSummary } from '../../tactical/lib/trmmStatus'

export function HomeTacticalAttentionWidget({ phonebook = [] }) {
  const summary = useMemo(() => buildTrmmAttentionSummary(phonebook), [phonebook])

  if (summary.counts.total === 0) {
    return <div className="home-widget-empty">Все компьютеры на связи</div>
  }

  return (
    <div className="home-tactical-attention-widget">
      <div className="home-tactical-attention-counts" aria-label="Сводка Tactical RMM">
        <span className="is-offline"><MonitorOff size={14} /> Выключены: {summary.counts.offline}</span>
        <span className="is-overdue"><AlertTriangle size={14} /> Не отвечают: {summary.counts.overdue}</span>
        <span className="is-missing">Без агента: {summary.counts.missing}</span>
      </div>
      <ul className="home-tactical-attention-list">
        {summary.items.slice(0, 4).map((contact) => (
          <li key={`trmm-attention-${contact.id}`}>
            <i style={{ background: contact.trmmStatus.color }} />
            <span><strong>{contact.name}</strong><small>{contact.tactical_agent_hostname || contact.room || 'агент не сопоставлен'}</small></span>
            <em>{contact.trmmStatus.label}</em>
          </li>
        ))}
      </ul>
      <a className="home-tactical-attention-link" href="/phonebook">Открыть справочник</a>
    </div>
  )
}
