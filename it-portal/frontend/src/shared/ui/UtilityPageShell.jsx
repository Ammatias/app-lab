import { ArrowLeft } from 'lucide-react'

export function UtilityPageShell({
  eyebrow,
  title,
  description,
  actions = null,
  onBack = null,
  children,
  maxWidth = '1280px',
  compact = false
}) {
  const containerGap = compact ? '10px' : '20px'
  const shellPadding = compact ? '11px 14px' : '22px 24px'
  const shellGap = compact ? '8px' : '14px'
  const headerGap = compact ? '10px' : '16px'
  const titleColumnGap = compact ? '6px' : '10px'
  const titleRowGap = compact ? '10px' : '12px'
  const actionsGap = compact ? '8px' : '10px'
  const titleFontSize = compact ? '1.28rem' : '1.85rem'
  const descriptionLineHeight = compact ? 1.45 : 1.55
  const bottomPadding = compact ? '14px' : '28px'

  return (
    <div style={{ width: '100%', paddingBottom: bottomPadding }}>
      <div
        style={{
          width: 'min(100%, 100%)',
          maxWidth,
          margin: '0 auto',
          display: 'grid',
          gap: containerGap
        }}
      >
        <section
          className="glass-panel"
          style={{
            padding: shellPadding,
            display: 'grid',
            gap: shellGap
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: headerGap,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'grid', gap: titleColumnGap }}>
              {eyebrow ? (
                <div className="portal-profile-modal-eyebrow">{eyebrow}</div>
              ) : null}

              <div style={{ display: 'flex', alignItems: 'center', gap: titleRowGap, flexWrap: 'wrap' }}>
                {onBack ? (
                  <button type="button" className="btn" onClick={onBack}>
                    <ArrowLeft size={16} /> Назад
                  </button>
                ) : null}
                <h1 style={{ margin: 0, fontSize: titleFontSize, lineHeight: 1.1 }}>{title}</h1>
              </div>

              {description ? (
                <div style={{ color: 'var(--text-muted)', maxWidth: '820px', lineHeight: descriptionLineHeight }}>
                  {description}
                </div>
              ) : null}
            </div>

            {actions ? (
              <div style={{ display: 'flex', gap: actionsGap, alignItems: 'center', flexWrap: 'wrap' }}>
                {actions}
              </div>
            ) : null}
          </div>
        </section>

        {children}
      </div>
    </div>
  )
}
