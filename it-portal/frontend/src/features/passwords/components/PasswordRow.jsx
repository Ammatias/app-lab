import { Pencil, Trash2 } from 'lucide-react'
import { CopyableText } from '../../../shared/ui/CopyableText'
import { ActionIconButton } from '../../../shared/ui/ActionIconButton'
import { getPasswordSubtypeLabel, normalizePasswordSubtype } from '../lib/passwordSubtypes'
import { PasswordTitle } from './PasswordTitle'

const hasText = (value) => Boolean(value?.trim())

const getPasswordLinkData = (value) => {
  const text = value?.trim()
  if (!text || /\s/.test(text)) return null

  try {
    const url = new URL(text)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return { href: url.toString(), host: url.host.replace(/^www\./i, '') }
  } catch {
    return null
  }
}

const isCopyOnlyEndpoint = (value) => {
  const text = value?.trim()
  return Boolean(text) && /^(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?$/.test(text)
}

const PasswordRowDescription = ({ value }) => {
  const link = getPasswordLinkData(value)

  if (!value) return null

  if (isCopyOnlyEndpoint(value)) {
    return <CopyableText text={value.trim()} label="Endpoint:" />
  }

  if (link) {
    return (
      <a
        className="password-link-block password-link-block--row"
        href={link.href}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => event.stopPropagation()}
        title={link.href}
      >
        <div className="password-link-copy">
          <div className="password-link-topline">
            <span className="password-link-label">Ссылка</span>
            <strong className="password-link-title">{link.host}</strong>
          </div>
          <span className="password-link-url">{link.href}</span>
        </div>
      </a>
    )
  }

  return <div className="password-note-block">{value}</div>
}

export function PasswordRow({ item, onEdit, onDelete }) {
  const subtype = normalizePasswordSubtype(item.subtype)
  const hideWifiSecret = subtype !== 'wifi' || !/без пароля/i.test(item.value || '')
  const handleEditFromBadge = (event) => {
    event.stopPropagation()
    onEdit(event, item)
  }

  return (
    <article className={`glass-panel password-row password-row--${subtype} ${item.is_draft ? 'is-draft' : ''}`}>
      <div className="password-row-main">
        <div className="password-row-topline">
          <div className="password-card-badges">
            <span className="password-kind-badge editable-tag" role="button" tabIndex={0} onClick={handleEditFromBadge} onKeyDown={(event) => event.key === 'Enter' && handleEditFromBadge(event)}>
              {getPasswordSubtypeLabel(subtype)}
            </span>
            {item.is_draft && (
              <span className="password-kind-badge password-kind-badge--draft editable-tag" role="button" tabIndex={0} onClick={handleEditFromBadge} onKeyDown={(event) => event.key === 'Enter' && handleEditFromBadge(event)}>
                Черновик
              </span>
            )}
          </div>
          <PasswordTitle title={item.title} />
        </div>

        <div className="password-row-details">
          {hasText(item.login) && <CopyableText text={item.login} label="Логин:" />}
          {hasText(item.value) && <CopyableText text={item.value} hidden={hideWifiSecret} label="Пароль:" />}
          <PasswordRowDescription value={item.description} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <ActionIconButton onClick={(event) => onEdit(event, item)} title="Редактировать" rotate={-8}>
          <Pencil size={16} />
        </ActionIconButton>
        <ActionIconButton onClick={(event) => onDelete(event, item)} title="Удалить" hoverColor="#f87171" rotate={8}>
          <Trash2 size={16} />
        </ActionIconButton>
      </div>
    </article>
  )
}
