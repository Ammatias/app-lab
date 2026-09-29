import { Activity, ArrowDown, ArrowUp } from 'lucide-react'
import { useMemo } from 'react'
import { formatByteRate, getNetworkLimitMbps, getNetworkRate } from '../../../shared/lib/networkSpeed'
import { NetworkLimitControl } from '../../../shared/ui/NetworkLimitControl'

const TOP_LIMIT = 6

export function HomeNetworkTopWidget({
  phonebook = [],
  onApplyNetworkLimit,
  onClearNetworkLimit,
  limitingContactId = null
}) {
  const leaders = useMemo(() => (
    (() => {
      const limitedContacts = phonebook
        .filter((contact) => !contact.is_external && getNetworkLimitMbps(contact))
        .slice()
        .sort((left, right) => (
          String(left.name || '').localeCompare(String(right.name || ''), 'ru-RU')
        ))
      const limitedIds = new Set(limitedContacts.map((contact) => contact.id))
      const activeContacts = phonebook
        .filter((contact) => !contact.is_external && getNetworkRate(contact, 'network_download_bps') > 0)
        .filter((contact) => !limitedIds.has(contact.id))
        .slice()
        .sort((left, right) => (
          getNetworkRate(right, 'network_download_bps') - getNetworkRate(left, 'network_download_bps')
          || String(left.name || '').localeCompare(String(right.name || ''), 'ru-RU')
        ))
        .slice(0, Math.max(0, TOP_LIMIT - limitedContacts.length))

      return [...activeContacts, ...limitedContacts]
    })()
  ), [phonebook])

  const highestRate = leaders.length > 0
    ? getNetworkRate(leaders[0], 'network_download_bps')
    : 0

  if (leaders.length === 0) {
    return (
      <div className="home-widget-empty home-network-top-empty">
        <Activity size={18} /> Сейчас активной загрузки нет
      </div>
    )
  }

  return (
    <div className="home-network-top-widget">
      <ol className="home-network-top-list">
        {leaders.map((contact, index) => {
          const downloadRate = getNetworkRate(contact, 'network_download_bps')
          const uploadRate = Math.max(0, getNetworkRate(contact, 'network_upload_bps'))
          const width = highestRate > 0 ? Math.max(3, (downloadRate / highestRate) * 100) : 0

          return (
            <li key={`network-leader-${contact.id}`} className="home-network-top-row">
              <span className="home-network-top-rank">{index + 1}</span>
              <div className="home-network-top-person">
                <strong>{contact.name}</strong>
                <span>{[contact.department, contact.room ? `каб. ${contact.room}` : ''].filter(Boolean).join(' · ')}</span>
                <i style={{ width: `${width}%` }} />
              </div>
              <div className="home-network-top-side">
                <div className="network-live-rates" title="Интернет-нагрузка за последние 5 секунд">
                  <strong><ArrowDown size={12} />{formatByteRate(downloadRate)}</strong>
                  <span><ArrowUp size={11} />{formatByteRate(uploadRate)}</span>
                </div>
                <NetworkLimitControl
                  contact={contact}
                  compact={true}
                  busy={limitingContactId === contact.id}
                  onApply={onApplyNetworkLimit}
                  onClear={onClearNetworkLimit}
                />
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
