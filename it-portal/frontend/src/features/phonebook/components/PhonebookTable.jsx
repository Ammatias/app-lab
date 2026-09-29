import '../styles/phonebook-layout.css'
import { ArrowDown, ArrowUp, Gauge, ShieldBan, Monitor, Pencil, Power, RotateCw, ScreenShare, Wifi } from 'lucide-react'
import { useState } from 'react'
import { connectAnyDesk } from '../../../shared/lib/anydesk'
import { formatByteRate, getNetworkLimitMbps } from '../../../shared/lib/networkSpeed'
import { ActionIconButton } from '../../../shared/ui/ActionIconButton'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { getTrmmStatusMeta } from '../../tactical/lib/trmmStatus'
import { NetworkLimitModal } from './NetworkLimitModal'
import { DomainBlockModal } from './DomainBlockModal'

const TRMM_BASE_URL = 'https://rmm.demo.example.com'

const normalizeMatchValue = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, ' ')

const normalizeDigits = (value) => String(value || '').replace(/\D/g, '')

const hasAnyDeskId = (item) => Boolean(String(item?.value || '').replace(/\D/g, ''))

const findAnyDeskItemForContact = (contact, anydeskItems) => {
  const contactEmployeeId = Number(contact?.employee_id)
  const contactName = normalizeMatchValue(contact?.name)
  const contactRoom = normalizeMatchValue(contact?.room)
  const contactInternal = normalizeDigits(contact?.internal)
  const contactPhone = normalizeDigits(contact?.phone)
  const contactMobile = normalizeDigits(contact?.mobile)

  const candidates = (anydeskItems || []).filter(hasAnyDeskId)

  if (Number.isFinite(contactEmployeeId) && contactEmployeeId > 0) {
    const byEmployee = candidates.find((item) => Number(item.employee_id) === contactEmployeeId)
    if (byEmployee) return byEmployee
  }

  if (contactName) {
    const byName = candidates.find((item) => {
      const title = normalizeMatchValue(item.title)
      const fio = normalizeMatchValue(item.fio)
      return title === contactName || fio === contactName || title.includes(contactName) || contactName.includes(title)
    })
    if (byName) return byName
  }

  if (contactRoom) {
    const byRoom = candidates.find((item) => normalizeMatchValue(item.room) === contactRoom)
    if (byRoom) return byRoom
  }

  return candidates.find((item) => {
    const searchable = [
      item.title,
      item.fio,
      item.description,
      item.login,
      item.room
    ].map(normalizeMatchValue).join(' ')
    const searchableDigits = normalizeDigits(searchable)

    return Boolean(
      (contactRoom && searchable.includes(contactRoom))
      || (contactInternal && searchableDigits.includes(contactInternal))
      || (contactPhone && searchableDigits.includes(contactPhone))
      || (contactMobile && searchableDigits.includes(contactMobile))
    )
  }) || null
}


const formatIpList = (value) => String(value || '')
  .split(/[,\s]+/)
  .map((item) => item.trim())
  .filter(Boolean)
  .join(', ')

const buildTrmmTakeControlUrl = (contact) => {
  const agentId = String(contact?.tactical_agent_id || '').trim()
  if (!agentId) return null
  return `${TRMM_BASE_URL}/takecontrol/${encodeURIComponent(agentId)}`
}

const openPopup = (url, name) => {
  window.open(
    url,
    name,
    'popup=yes,scrollbars=no,location=no,status=no,toolbar=no,menubar=no,width=1600,height=900'
  )
}

export function PhonebookTable({
  contacts,
  anydeskItems = [],
  onEdit,
  onToggleAccounting,
  togglingContactId = null,
  onApplyNetworkLimit,
  onClearNetworkLimit,
  limitingContactId = null,
  onTacticalAction,
  tacticalActionAgentId = null,
  isExternalView = false
}) {
  const [domainBlockContactId, setDomainBlockContactId] = useState(null)
  const domainBlockContact = contacts.find((contact) => contact.id === domainBlockContactId) || null
  const [networkLimitContactId, setNetworkLimitContactId] = useState(null)
  const networkLimitContact = contacts.find((contact) => contact.id === networkLimitContactId) || null

  const openEdit = (event, contact) => {
    event.stopPropagation()
    onEdit(event, contact)
  }

  const openTrmmTakeControl = (event, contact) => {
    event.preventDefault()
    event.stopPropagation()

    const url = buildTrmmTakeControlUrl(contact)
    if (url) openPopup(url, `trmm_take_control_${contact.tactical_agent_id}`)
  }

  const columns = isExternalView
    ? [
        { key: 'room', label: 'Каб.', width: '5%' },
        { key: 'name', label: 'Контакт', width: '14%' },
        { key: 'position', label: 'Должность', width: '13%' },
        { key: 'email', label: 'Эл. почта', width: '13%' },
        { key: 'phone', label: 'Телефон', width: '9%' },
        { key: 'internal', label: 'Внутр.', width: '6%' },
        { key: 'mobile', label: 'Мобильный', width: '10%' },
        { key: 'connect', label: 'Доступ', width: '8%' },
        { key: 'note', label: 'Примечание', width: '18%' },
        { key: 'actions', label: '', width: '4%' }
      ]
    : [
        { key: 'room', label: 'Каб.', width: '5%' },
        { key: 'name', label: 'ФИО', width: '13%' },
        { key: 'position', label: 'Должность', width: '12%' },
        { key: 'email', label: 'Эл. почта', width: '12%' },
        { key: 'phone', label: 'Телефон', width: '8%' },
        { key: 'internal', label: 'Внутр.', width: '6%' },
        { key: 'mobile', label: 'Мобильный', width: '9%' },
        { key: 'connect', label: 'Доступ', width: '7%' },
        { key: 'trmm', label: 'Компьютер · TRMM', width: '24%' },
        { key: 'actions', label: '', width: '4%' }
      ]

  const cellPadding = '12px clamp(6px, 0.55vw, 12px)'
  const edgePadding = 'clamp(16px, 1.3vw, 24px)'

  return (
    <>
      <div className="phonebook-table-wrap">
        <table
        className="phonebook-table"
        style={{
          width: '100%',
          maxWidth: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.95rem',
          tableLayout: 'fixed'
        }}
      >
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
        </colgroup>
        <thead>
          <tr className="phonebook-table-head" style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  padding: cellPadding,
                  paddingLeft: column.key === 'room' ? edgePadding : undefined,
                  paddingRight: column.key === 'actions' ? edgePadding : undefined,
                  color: 'var(--text-muted)',
                  fontWeight: '600',
                  textAlign: column.key === 'connect' || column.key === 'actions' ? 'center' : 'left'
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan={isExternalView ? 10 : 10} style={{ padding: 0 }}>
                <EmptyState panel={true} style={{ margin: 0, borderRadius: 0 }}>Ничего не найдено.</EmptyState>
              </td>
            </tr>
          ) : contacts.map((contact, index) => {
            const anydeskItem = findAnyDeskItemForContact(contact, anydeskItems)
            const trmmTakeControlUrl = buildTrmmTakeControlUrl(contact)
            const trmmStatus = getTrmmStatusMeta(contact)
            const trmmLocalIps = formatIpList(contact.tactical_agent_local_ips)
            const downloadRate = formatByteRate(contact.network_download_bps)
            const uploadRate = formatByteRate(contact.network_upload_bps)
            const networkLimit = getNetworkLimitMbps(contact)

            return (
            <tr key={contact.id || index} className="phonebook-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: '0.2s' }}>
              <td style={{ padding: cellPadding, paddingLeft: edgePadding, fontWeight: '500', verticalAlign: 'top' }}>
                <span className="editable-tag" role="button" tabIndex={0} onClick={(event) => openEdit(event, contact)} onKeyDown={(event) => event.key === 'Enter' && openEdit(event, contact)}>
                  {contact.room}
                </span>
              </td>
              <td style={{ padding: cellPadding, verticalAlign: 'top', overflowWrap: 'anywhere' }}>
                <span className="editable-tag" role="button" tabIndex={0} onClick={(event) => openEdit(event, contact)} onKeyDown={(event) => event.key === 'Enter' && openEdit(event, contact)}>
                  {contact.name}
                </span>
              </td>
              <td style={{ padding: cellPadding, color: 'var(--text-muted)', fontSize: '0.85rem', verticalAlign: 'top', overflowWrap: 'anywhere' }}>
                <span className="editable-tag" role="button" tabIndex={0} onClick={(event) => openEdit(event, contact)} onKeyDown={(event) => event.key === 'Enter' && openEdit(event, contact)}>
                  {contact.position}
                </span>
              </td>
              <td style={{ padding: cellPadding, verticalAlign: 'top', overflowWrap: 'anywhere' }}>
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{contact.email}</a>
                ) : null}
              </td>
              <td style={{ padding: cellPadding, verticalAlign: 'top', overflowWrap: 'anywhere' }}>{contact.phone}</td>
              <td style={{ padding: cellPadding, fontWeight: 'bold', verticalAlign: 'top', overflowWrap: 'anywhere' }}>
                <span className="editable-tag" role="button" tabIndex={0} onClick={(event) => openEdit(event, contact)} onKeyDown={(event) => event.key === 'Enter' && openEdit(event, contact)}>
                  {contact.internal}
                </span>
              </td>
              <td style={{ padding: cellPadding, verticalAlign: 'top', overflowWrap: 'anywhere' }}>{contact.mobile}</td>
              <td style={{ padding: '12px 10px', textAlign: 'center', verticalAlign: 'top' }}>
                <span className="phonebook-connect-actions">
                  <ActionIconButton
                    disabled={!anydeskItem}
                    onClick={(event) => {
                      event.stopPropagation()
                      if (anydeskItem) {
                        connectAnyDesk(anydeskItem.value, anydeskItem.description)
                      }
                    }}
                    title={anydeskItem ? `AnyDesk: ${anydeskItem.title || anydeskItem.value}` : 'AnyDesk для сотрудника не найден'}
                    hoverColor="var(--accent)"
                    rotate={0}
                    style={{ width: '34px', height: '28px' }}
                  >
                    <Monitor size={14} />
                  </ActionIconButton>
                  <ActionIconButton
                    disabled={!trmmTakeControlUrl}
                    onClick={(event) => openTrmmTakeControl(event, contact)}
                    title={trmmTakeControlUrl ? `TRMM Take Control: ${contact.tactical_agent_hostname || contact.name}` : 'TRMM агент не сопоставлен'}
                    hoverColor="#22c55e"
                    rotate={0}
                    style={{ width: '34px', height: '28px' }}
                  >
                    <ScreenShare size={14} />
                  </ActionIconButton>
                </span>
              </td>
              {!isExternalView ? (
                <td style={{ padding: cellPadding, verticalAlign: 'top' }}>
                  <div className="phonebook-trmm-card" title={trmmStatus.title}>
                    <div className="phonebook-trmm-status">
                      <span
                        className="phonebook-trmm-dot"
                        aria-label={trmmStatus.title}
                        style={{
                          background: trmmStatus.color,
                          boxShadow: `0 0 0 2px rgba(255,255,255,0.04), 0 0 8px ${trmmStatus.color}`
                        }}
                      />
                      <strong>{trmmStatus.label}</strong>
                    </div>
                    <div className="phonebook-trmm-host">
                      {contact.tactical_agent_hostname || 'агент не сопоставлен'}
                    </div>
                    <div className="phonebook-trmm-network-row">
                      <div className="phonebook-trmm-network">
                        <Wifi size={13} />
                        <span className="phonebook-trmm-ip">{trmmLocalIps || 'LAN IP не найден'}</span>
                      </div>
                      <button
                        type="button"
                        className={`phonebook-network-limit-trigger ${networkLimit ? 'is-active' : ''}`}
                        disabled={limitingContactId === contact.id || !contact.tactical_agent_local_ips}
                        onClick={() => setNetworkLimitContactId(contact.id)}
                        title={contact.tactical_agent_local_ips
                          ? networkLimit
                            ? `Лимит ${networkLimit} Мбит/с — изменить`
                            : 'Настроить ограничение скорости'
                          : 'Нет LAN IP для ограничения'}
                        aria-label={contact.tactical_agent_local_ips
                          ? networkLimit
                            ? `Изменить ограничение ${networkLimit} Мбит/с для ${contact.name}`
                            : `Настроить ограничение скорости для ${contact.name}`
                          : `Ограничение недоступно для ${contact.name}: нет LAN IP`}
                      >
                        <Gauge size={14} />
                        {networkLimit ? <span>{networkLimit}</span> : null}
                      </button>
                      <button type="button" className="phonebook-network-limit-trigger"
                        disabled={!contact.tactical_agent_local_ips}
                        title="Блокировка сайтов" aria-label="Блокировка сайтов"
                        onClick={() => setDomainBlockContactId(contact.id)}>
                        <ShieldBan size={14} />
                      </button>
                    </div>
                    <div className="phonebook-trmm-traffic">
                      {downloadRate && uploadRate ? (
                        <div className="phonebook-trmm-speed" title="Интернет-нагрузка за последние 5 секунд">
                          <span className="is-download"><ArrowDown size={12} />{downloadRate}</span>
                          <span className="is-upload"><ArrowUp size={12} />{uploadRate}</span>
                        </div>
                      ) : (
                        <div className="phonebook-trmm-network is-muted">Скорость: нет данных</div>
                      )}
                    </div>
                    {trmmStatus.key === 'online' && (
                      <button
                        type="button"
                        className="phonebook-trmm-action is-reboot"
                        disabled={tacticalActionAgentId === contact.tactical_agent_id}
                        aria-label={`Перезагрузить ${contact.tactical_agent_hostname || contact.name}`}
                        onClick={() => onTacticalAction?.(contact, 'reboot')}
                      >
                        <RotateCw size={12} /> Перезагрузить
                      </button>
                    )}
                    {trmmStatus.key === 'offline' && (
                      <button
                        type="button"
                        className="phonebook-trmm-action is-wol"
                        disabled={tacticalActionAgentId === contact.tactical_agent_id}
                        aria-label={`Разбудить ${contact.tactical_agent_hostname || contact.name}`}
                        onClick={() => onTacticalAction?.(contact, 'wol')}
                      >
                        <Power size={12} /> {tacticalActionAgentId === contact.tactical_agent_id ? 'Отправляю…' : 'Разбудить'}
                      </button>
                    )}
                  </div>
                </td>
              ) : null}
              {isExternalView ? (
                <td style={{ padding: cellPadding, color: 'var(--text-muted)', verticalAlign: 'top', overflowWrap: 'anywhere' }}>
                  <span className="editable-tag" role="button" tabIndex={0} onClick={(event) => openEdit(event, contact)} onKeyDown={(event) => event.key === 'Enter' && openEdit(event, contact)}>
                    {contact.note || '—'}
                  </span>
                </td>
              ) : null}
              <td style={{ padding: '12px 10px', paddingRight: edgePadding, textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                <ActionIconButton onClick={(event) => onEdit(event, contact)} title="Редактировать" rotate={-10}>
                  <Pencil size={16} />
                </ActionIconButton>
              </td>
            </tr>
            )
          })}
        </tbody>
        </table>
      </div>
      {domainBlockContact && <DomainBlockModal key={domainBlockContact.id} contact={domainBlockContact} onClose={() => setDomainBlockContactId(null)} />}
      <NetworkLimitModal
        contact={networkLimitContact}
        busy={Boolean(networkLimitContact && limitingContactId === networkLimitContact.id)}
        onApply={onApplyNetworkLimit}
        onClear={onClearNetworkLimit}
        onClose={() => setNetworkLimitContactId(null)}
      />
    </>
  )
}
