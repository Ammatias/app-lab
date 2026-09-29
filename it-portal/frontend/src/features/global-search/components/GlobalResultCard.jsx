import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ExternalLink, FileArchive, Monitor, Pencil, Shield, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { CopyableText } from '../../../shared/ui/CopyableText'
import { ActionIconButton } from '../../../shared/ui/ActionIconButton'
import { connectAnyDesk } from '../../../shared/lib/anydesk'
import { downloadStoredFile } from '../../../shared/lib/files'
import { getDisplayValue } from '../../ecp/lib/ecpDates'
import { EcpExpiryBadge } from '../../ecp/components/EcpExpiryBadge'
import { getTypeLabel } from '../../records/lib/recordTypeMeta'
import { getPasswordSubtypeLabel, normalizePasswordSubtype } from '../../passwords/lib/passwordSubtypes'
import { downloadPrivateKeyArchive } from '../../../entities/items/api'

const hasText = (value) => Boolean(value?.trim())

const getEquipmentRowSpan = (item) => {
  const deviceCount = item.devices?.length || 0
  const badgeCount = item.deviceKinds?.length || 0
  const primaryTitleLength = item.primaryDevice?.title?.trim().length || 0
  const hasDenseContent = deviceCount > 2 || badgeCount > 4
  const hasLongPrimaryTitle = primaryTitleLength > 28

  return hasDenseContent || hasLongPrimaryTitle ? 4 : 3
}

const getCardLayoutStyle = (item) => {
  if (item.type === 'equipment') {
    const rowSpan = getEquipmentRowSpan(item)

    if (item.equipmentLayoutIndex === 0) {
      return {
        gridColumn: '5 / span 2',
        gridRow: `1 / span ${rowSpan}`,
        order: -30
      }
    }

    if (item.equipmentLayoutIndex === 1) {
      return {
        gridColumn: '3 / span 2',
        gridRow: `4 / span ${rowSpan}`,
        order: -29
      }
    }

    if (item.equipmentLayoutIndex === 2) {
      return {
        gridColumn: '5 / span 2',
        gridRow: `4 / span ${rowSpan}`,
        order: -28
      }
    }

    return {
      gridColumn: 'span 2',
      gridRow: `span ${rowSpan}`,
      order: 6
    }
  }

  if (item.type === 'password') {
    return {
      gridColumn: 'span 4'
    }
  }

  if (item.type === 'ecp') {
    return {
      gridRow: 'span 1',
      order: -10
    }
  }

  return {
    gridColumn: 'span 2'
  }
}

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

const copyTextSilently = async (value) => {
  if (!hasText(value) || !navigator?.clipboard?.writeText) return

  try {
    await navigator.clipboard.writeText(value.trim())
  } catch {
    // ignore clipboard failures and continue opening the link
  }
}

function PasswordResultAction({ item }) {
  const description = item.description?.trim()
  const link = getPasswordLinkData(description)

  if (!hasText(description)) return null

  if (isCopyOnlyEndpoint(description)) {
    return <CopyableText text={description} label="Endpoint:" />
  }

  if (link) {
    const handleOpen = (event) => {
      event.stopPropagation()
      window.open(link.href, '_blank', 'noopener,noreferrer')
      copyTextSilently(item.login)
    }

    return (
      <button
        type="button"
        className="global-password-link"
        onClick={handleOpen}
        title={hasText(item.login) ? 'Открыть ссылку и скопировать логин' : 'Открыть ссылку'}
      >
        <div className="global-password-link-copy">
          <span className="global-password-link-label">Ссылка</span>
          <strong className="global-password-link-title">{link.host}</strong>
          <span className="global-password-link-url">{link.href}</span>
        </div>
        <ExternalLink size={16} className="global-password-link-icon" />
      </button>
    )
  }

  return <div className="global-password-note">{description}</div>
}

const EquipmentResultPhoneCard = ({ phone }) => (
  <div className="equipment-device-card">
    <div className="equipment-device-topline">
      <span className="equipment-device-type">IP-телефон</span>
      {phone.internalNumber && (
        <span className="equipment-device-chip">
          Доб. {phone.internalNumber}
        </span>
      )}
    </div>

    <strong className="equipment-device-title">{phone.users || phone.displayTitle}</strong>

    <div className="equipment-device-meta">
      {phone.ipAddress && <span>IP: {phone.ipAddress}</span>}
      {phone.macAddress && <span>MAC: {phone.macAddress}</span>}
      {phone.login && <span>Логин: {phone.login}</span>}
    </div>

    {(phone.userMatchesLogin || phone.room) && (
      <div className="equipment-device-inline-pills">
        {phone.userMatchesLogin && (
          <span className="equipment-device-inline-pill equipment-device-inline-pill--accent">
            User = Логин
          </span>
        )}
        {phone.room && (
          <span className="equipment-device-inline-pill">
            Каб. {phone.room}
          </span>
        )}
      </div>
    )}
  </div>
)

const EquipmentResultDeviceCard = ({ device }) => (
  <div className="equipment-device-card">
    <div className="equipment-device-topline">
      <span className="equipment-device-type">{device.type}</span>
      {(device.serial || device.inventoryNumber) && (
        <span className="equipment-device-chip">{device.inventoryNumber || device.serial}</span>
      )}
    </div>
    <strong className="equipment-device-title">{device.title}</strong>
    <div className="equipment-device-meta">
      {device.serial && <span>SN: {device.serial}</span>}
      {device.inventoryNumber && <span>Инв.: {device.inventoryNumber}</span>}
      {device.suppliedAt && <span>Учёт: {device.suppliedAt}</span>}
    </div>
  </div>
)

export function GlobalResultCard({ item, onOpenEdit, onDelete }) {
  const [isTitleExpanded, setIsTitleExpanded] = useState(false)
  const [isPasswordTitleClamped, setIsPasswordTitleClamped] = useState(false)
  const titleRef = useRef(null)
  const passwordSubtype = item.type === 'password' ? normalizePasswordSubtype(item.subtype) : null
  const hasPasswordLogin = item.type === 'password' && hasText(item.login)
  const hasPasswordValue = item.type === 'password' && hasText(item.value)
  const hasPasswordCredentials = hasPasswordLogin || hasPasswordValue
  const hasPasswordSide = item.type === 'password' && hasText(item.description)
  const hidePasswordValue = item.type === 'password'
    ? (passwordSubtype !== 'wifi' || !/без пароля/i.test(item.value || '')) && Boolean(item.value)
    : false
  const canExpandPasswordTitle = item.type === 'password' && isPasswordTitleClamped
  const shouldClampPasswordTitle = item.type === 'password' && !isTitleExpanded

  useEffect(() => {
    if (item.type !== 'password') return undefined

    const updateClampState = () => {
      const node = titleRef.current
      if (!node) return

      setIsPasswordTitleClamped(node.scrollHeight - node.clientHeight > 1)
    }

    const frameId = window.requestAnimationFrame(updateClampState)
    window.addEventListener('resize', updateClampState)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updateClampState)
    }
  }, [item.title, item.type, isTitleExpanded])

  const handleOpenEditFromTag = (event) => {
    if (item.type === 'home') return
    event.stopPropagation()
    onOpenEdit(event, item)
  }

  const cardLayoutStyle = getCardLayoutStyle(item)

  return (
    <div
      className={`glass-panel item-card global-result-card global-result-card--${item.type || 'default'}`}
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        ...cardLayoutStyle
      }}
    >
      <div className="global-result-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="global-result-title-wrap">
          <h3 ref={titleRef} className={`global-result-title ${shouldClampPasswordTitle ? 'is-clamped' : ''}`}>{item.title}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className={item.type === 'home' ? '' : 'editable-tag'} role={item.type === 'home' ? undefined : 'button'} tabIndex={item.type === 'home' ? undefined : 0} onClick={item.type === 'home' ? undefined : handleOpenEditFromTag} onKeyDown={item.type === 'home' ? undefined : (event) => event.key === 'Enter' && handleOpenEditFromTag(event)} style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.02em', padding: '4px 10px', borderRadius: '8px', background: 'rgba(151,47,255,0.28)', border: '1px solid rgba(203,162,255,0.24)', color: '#d8b4ff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)', flexShrink: 0 }}>
            {getTypeLabel(item.type)}
          </span>
          {item.type === 'password' && (
            <span
              className="editable-tag global-password-header-tag"
              role="button"
              tabIndex={0}
              onClick={handleOpenEditFromTag}
              onKeyDown={(event) => event.key === 'Enter' && handleOpenEditFromTag(event)}
            >
              {getPasswordSubtypeLabel(passwordSubtype)}
            </span>
          )}
          {item.type === 'home' ? (
            <motion.a
              href={item.value}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', color: 'var(--text-muted)' }}
              whileHover={{ scale: 1.12, rotate: -8, color: 'var(--accent)' }}
            >
              <ExternalLink size={16} />
            </motion.a>
          ) : (
            <>
              <ActionIconButton onClick={(event) => onOpenEdit(event, item)} title="Редактировать" rotate={-8}>
                <Pencil size={16} />
              </ActionIconButton>
              {item.type !== 'phonebook' && (
                <ActionIconButton onClick={(event) => onDelete(event, item)} title="Удалить" hoverColor="#f87171" rotate={8}>
                  <Trash2 size={16} />
                </ActionIconButton>
              )}
            </>
          )}
        </div>
      </div>

      <div className="global-result-card-body" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {item.type === 'phonebook' ? (
          <div className="global-phonebook-layout">
            <div className="global-phonebook-main">
              {item.position && (
                <div className="global-phonebook-position">
                  <span className="editable-tag global-phonebook-position-tag" role="button" tabIndex={0} onClick={handleOpenEditFromTag} onKeyDown={(event) => event.key === 'Enter' && handleOpenEditFromTag(event)}>
                    {item.position}
                  </span>
                </div>
              )}
              {item.room && (
                <span className="global-phonebook-pill editable-tag" role="button" tabIndex={0} onClick={handleOpenEditFromTag} onKeyDown={(event) => event.key === 'Enter' && handleOpenEditFromTag(event)}>
                  Каб. {item.room}
                </span>
              )}
            </div>

            <div className="global-phonebook-side">
              {item.internal && (
                <div className="global-phonebook-contact-tile">
                  <span className="global-phonebook-contact-label">Внутр</span>
                  <span className="editable-tag global-phonebook-contact-value" role="button" tabIndex={0} onClick={handleOpenEditFromTag} onKeyDown={(event) => event.key === 'Enter' && handleOpenEditFromTag(event)}>
                    {item.internal}
                  </span>
                </div>
              )}
              {item.mobile && (
                <div className="global-phonebook-mobile">
                  <CopyableText text={item.mobile} label="Моб:" large={true} />
                </div>
              )}
            </div>
          </div>
        ) : item.type === 'password' ? (
          <div className="global-password-search-card">
            {(item.is_draft || canExpandPasswordTitle) && (
              <div className="global-password-meta">
                {item.is_draft && (
                  <span className="editable-tag" role="button" tabIndex={0} onClick={handleOpenEditFromTag} onKeyDown={(event) => event.key === 'Enter' && handleOpenEditFromTag(event)} style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.02em', padding: '4px 10px', borderRadius: '8px', background: 'rgba(251,191,36,0.16)', border: '1px solid rgba(251,191,36,0.22)', color: '#ffe18d' }}>
                    Черновик
                  </span>
                )}
                {canExpandPasswordTitle && (
                  <button
                    type="button"
                    className={`global-result-expand ${isTitleExpanded ? 'is-open' : ''}`}
                    onClick={() => setIsTitleExpanded((value) => !value)}
                  >
                    <ChevronDown size={14} />
                    {isTitleExpanded ? 'Свернуть' : 'Развернуть'}
                  </button>
                )}
              </div>
            )}
            <div className={`global-password-layout ${hasPasswordSide ? 'has-side' : ''} ${hasPasswordCredentials ? 'has-credentials' : 'no-credentials'}`}>
              {hasPasswordCredentials && (
                <div className="global-password-credentials">
                  {hasPasswordLogin && <CopyableText text={item.login} label="Логин:" />}
                  {hasPasswordValue && <CopyableText text={item.value} hidden={hidePasswordValue} label="Пароль:" />}
                </div>
              )}
              {hasPasswordSide && (
                <div className="global-password-side">
                  <PasswordResultAction item={item} />
                </div>
              )}
            </div>
          </div>
/* Removed standalone equipment_phone rendering branch */
        ) : item.type === 'equipment' ? (
          <div className="global-equipment-card">
            <div className="global-equipment-meta">
              {item.department && <span className="equipment-pill editable-tag" role="button" tabIndex={0} onClick={handleOpenEditFromTag} onKeyDown={(event) => event.key === 'Enter' && handleOpenEditFromTag(event)}>{item.department}</span>}
              {item.cabinet && <span className="equipment-pill editable-tag" role="button" tabIndex={0} onClick={handleOpenEditFromTag} onKeyDown={(event) => event.key === 'Enter' && handleOpenEditFromTag(event)}>Каб. {item.cabinet}</span>}
              <span className="equipment-pill equipment-pill--accent editable-tag" role="button" tabIndex={0} onClick={handleOpenEditFromTag} onKeyDown={(event) => event.key === 'Enter' && handleOpenEditFromTag(event)}>
                {item.assignmentKind === 'shared' ? 'Общая техника' : 'Рабочее место'}
              </span>
            </div>

            <div className="global-equipment-panel global-equipment-panel--primary">
              <span>Опорное устройство</span>
              <strong>{item.primaryDevice?.title || 'Не указано'}</strong>
              <span>{item.primaryDevice?.type || 'Без базовой конфигурации'}</span>
            </div>

            <div className="global-equipment-stats">
              <div className="equipment-stat-tile">
                <span>ОЗУ</span>
                <strong>{item.ram || '—'}</strong>
              </div>
              <div className="equipment-stat-tile">
                <span>Система</span>
                <strong>{item.system || '—'}</strong>
              </div>
              <div className="equipment-stat-tile">
                <span>Процессор</span>
                <strong>{item.cpu || '—'}</strong>
              </div>
            </div>

            {item.gpu && (
              <div className="global-equipment-panel">
                <span>Видеосистема</span>
                <strong>{item.gpu}</strong>
              </div>
            )}

            <div className="global-equipment-device-badges">
              {item.deviceKinds.map((entry) => (
                <span key={`${item.id}-${entry.type}`} className="equipment-device-badge editable-tag" role="button" tabIndex={0} onClick={handleOpenEditFromTag} onKeyDown={(event) => event.key === 'Enter' && handleOpenEditFromTag(event)}>{entry.label}</span>
              ))}
            </div>

            <div className="global-equipment-device-list">
              {item.devices.map((device) => (
                <EquipmentResultDeviceCard key={device.id} device={device} />
              ))}
              {item.ipPhones?.map((phone) => (
                <EquipmentResultPhoneCard key={phone.id} phone={phone} />
              ))}
            </div>
          </div>
        ) : item.type === 'anydesk' ? (
          <div className="global-anydesk-layout">
            {item.room && <div className="global-anydesk-room"><strong>Кабинет:</strong> {item.room}</div>}
            <div className="global-anydesk-row">
              <CopyableText text={item.value} label="ID:" large={true} />
              <button
                className="btn btn-primary global-anydesk-connect"
                onClick={(event) => {
                  event.stopPropagation()
                  connectAnyDesk(item.value, item.description)
                }}
                title="Подключиться и скопировать пароль"
              >
                <Monitor size={16} style={{ marginRight: '8px' }} /> Connect
              </button>
            </div>
          </div>
        ) : item.type === 'ecp' ? (
          <div className="global-ecp-layout">
            <div className="global-ecp-credentials">
              <CopyableText text={getDisplayValue(item.login)} label="Логин:" />
              <CopyableText text={getDisplayValue(item.value)} hidden={getDisplayValue(item.value) !== 'Нет'} label="Пароль:" />
            </div>
            <div className="global-ecp-side">
              <div className="global-ecp-expiry"><EcpExpiryBadge item={item} compact /></div>
              {item.file_visible && item.file_data && (
                <button
                  className="btn btn-primary global-ecp-download"
                  onClick={(event) => {
                    event.stopPropagation()
                    downloadStoredFile(item.file_name, item.file_mime_type, item.file_data)
                  }}
                  title={item.file_name || 'Скачать сертификат'}
                >
                  <Shield size={16} style={{ marginRight: '8px' }} /> Открытый ключ
                </button>
              )}
              {item.private_file_visible && item.private_file_name && (
                <button
                  className="btn global-ecp-download"
                  onClick={(event) => {
                    event.stopPropagation()
                    downloadPrivateKeyArchive(item.id, item.private_file_name).catch((error) => {
                      console.error(error)
                      alert(error.message)
                    })
                  }}
                  title={item.private_file_name}
                >
                  <FileArchive size={16} style={{ marginRight: '8px' }} /> Закрытый ключ ZIP
                </button>
              )}
            </div>
          </div>
        ) : item.type === 'cartridges' ? (
          <>
            <div style={{ padding: '14px 16px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(151,47,255,0.22), rgba(86,33,255,0.2))', border: '1px solid rgba(203,162,255,0.26)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 28px rgba(90,44,190,0.14)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Модификация картриджа</div>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.15, color: '#fff', wordBreak: 'break-word' }}>{item.title}</div>
              {item.cartridge_type_name && (
                <div className="editable-tag" role="button" tabIndex={0} onClick={handleOpenEditFromTag} onKeyDown={(event) => event.key === 'Enter' && handleOpenEditFromTag(event)} style={{ marginTop: '8px', display: 'inline-flex', padding: '4px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', color: '#eef2ff', fontSize: '0.8rem', fontWeight: 700 }}>
                  Тип: {item.cartridge_type_name}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div className="copyable-item" style={{ cursor: 'default', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Заправленных:</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{item.refilled_count ?? 0}</span>
                </div>
              </div>
              <div className="copyable-item" style={{ cursor: 'default', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Новых:</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{item.new_count ?? 0}</span>
                </div>
              </div>
            </div>
            {item.note && <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.95rem' }}>{item.note}</div>}
          </>
        ) : item.type === 'home' ? (
          <>
            <CopyableText text={item.value} label="URL:" />
            {item.description && <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.85rem' }}>{item.description}</div>}
          </>
        ) : (
          <CopyableText text={item.value} />
        )}
      </div>
    </div>
  )
}
