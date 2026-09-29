const STATUS_META = {
  online: { key: 'online', color: '#22c55e', label: 'ОНЛАЙН', priority: 0 },
  overdue: { key: 'overdue', color: '#f59e0b', label: 'НЕ ОТВЕЧАЕТ', priority: 2 },
  offline: { key: 'offline', color: '#ef4444', label: 'ВЫКЛЮЧЕН', priority: 3 },
  missing: { key: 'missing', color: 'rgba(148, 163, 184, 0.55)', label: 'НЕТ АГЕНТА', priority: 1 }
}

const formatLastSeen = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleString('ru-RU')
}

export function getTrmmStatusMeta(contact) {
  const rawStatus = String(contact?.tactical_agent_status || '').trim().toLowerCase()
  const key = !contact?.tactical_agent_id
    ? 'missing'
    : STATUS_META[rawStatus]
      ? rawStatus
      : 'overdue'
  const base = STATUS_META[key]
  const hostname = contact?.tactical_agent_hostname ? `: ${contact.tactical_agent_hostname}` : ''
  const lastSeen = formatLastSeen(contact?.tactical_agent_last_seen_at)
  const lastSeenText = lastSeen ? `, был ${lastSeen}` : ''
  const title = key === 'missing'
    ? 'TRMM агент не сопоставлен'
    : `TRMM ${base.label}${hostname}${lastSeenText}`

  return { ...base, title }
}

export function buildTrmmAttentionSummary(phonebook = []) {
  const items = phonebook
    .filter((contact) => !contact?.is_external)
    .map((contact) => ({ ...contact, trmmStatus: getTrmmStatusMeta(contact) }))
    .filter((contact) => contact.trmmStatus.key !== 'online')
    .sort((left, right) => (
      right.trmmStatus.priority - left.trmmStatus.priority
      || String(left.name || '').localeCompare(String(right.name || ''), 'ru-RU')
    ))

  const counts = items.reduce((result, contact) => {
    result[contact.trmmStatus.key] += 1
    result.total += 1
    return result
  }, { offline: 0, overdue: 0, missing: 0, total: 0 })

  return { counts, items }
}
