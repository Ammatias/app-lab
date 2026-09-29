export function EmptyState({ children, panel = false, style = {} }) {
  if (panel) {
    return (
      <div className="glass-panel section-empty-panel" style={{ padding: '22px', textAlign: 'center', ...style }}>
        {children}
      </div>
    )
  }

  return (
    <p className="section-empty" style={style}>
      {children}
    </p>
  )
}
