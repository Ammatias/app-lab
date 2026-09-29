export function PasswordStats({ stats, compact = false }) {
  const entries = [
    {
      label: 'Основные',
      compactLabel: 'Осн.',
      value: stats.resource
    },
    {
      label: 'Wi-Fi',
      compactLabel: 'Wi-Fi',
      value: stats.wifi
    },
    {
      label: 'Почта сотрудников',
      compactLabel: 'Почта',
      value: stats.employeeEmail
    }
  ]

  if (compact) {
    return (
      <div className="password-toolbar-stats">
        {entries.map((entry) => (
          <div key={entry.label} className="glass-panel password-stat-pill" title={entry.label}>
            <span>{entry.compactLabel}</span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="password-stats-grid">
      {entries.map((entry) => (
        <div key={entry.label} className="glass-panel password-stat-card">
          <div className="password-stat-label">{entry.label}</div>
          <div className="password-stat-value">{entry.value}</div>
        </div>
      ))}
    </div>
  )
}
