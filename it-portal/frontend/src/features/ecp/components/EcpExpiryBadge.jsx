import {
  formatEcpDate,
  getEcpDateBadgeStyle,
  getEcpEffectiveValidUntil,
  parseEcpDate
} from '../lib/ecpDates'

export function EcpExpiryBadge({ item, compact = false }) {
  const publicValue = parseEcpDate(item.valid_until) ? item.valid_until : ''
  const privateValue = parseEcpDate(item.private_valid_until) ? item.private_valid_until : ''
  const effectiveValue = getEcpEffectiveValidUntil(publicValue, privateValue)
  const values = [
    publicValue && { label: 'Открытый ключ', value: publicValue },
    privateValue && { label: 'Закрытый ключ', value: privateValue }
  ].filter(Boolean)

  return (
    <div style={{
      ...getEcpDateBadgeStyle(effectiveValue),
      minWidth: compact ? '210px' : undefined,
      padding: compact ? '11px 13px' : '14px 16px'
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Срок действия
      </span>
      <div style={{ display: 'flex', gap: compact ? '14px' : '20px', flexWrap: 'wrap' }}>
        {(values.length ? values : [{ label: 'Открытый ключ', value: '' }]).map((entry) => (
          <div key={entry.label} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{entry.label}</span>
            <span style={{ fontWeight: 800, fontSize: compact ? '1.15rem' : '1.45rem', lineHeight: 1 }}>
              {formatEcpDate(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
