import { memo } from 'react'
import { HardDrive, Monitor, Pencil, Printer, Trash2, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { ActionIconButton } from '../../../shared/ui/ActionIconButton'
import { CopyableText } from '../../../shared/ui/CopyableText'
import { LoadingState } from '../../../shared/ui/LoadingState'
import { containerVariants } from '../../../shared/lib/motion'

const DeviceBadgeIcon = ({ label }) => {
  const lower = label.toLowerCase()

  if (lower.includes('монитор')) return <Monitor size={14} />
  if (lower.includes('принтер') || lower.includes('мфу')) return <Printer size={14} />
  if (lower.includes('телефон')) return <Phone size={14} />
  return <HardDrive size={14} />
}

const formatEquipmentLocation = (locationName, rawValue) => {
  const canonical = String(locationName || '').trim()
  const raw = String(rawValue || '').trim()

  if (!canonical && !raw) return ''
  if (!canonical || canonical === raw) return canonical || raw
  return canonical
}

const formatEquipmentLocations = (record) => {
  const locations = Array.isArray(record.locations) ? record.locations : []
  if (locations.length > 0) {
    return locations
      .map((location) => String(location.locationName || '').trim())
      .filter(Boolean)
      .join(' · ')
  }

  return formatEquipmentLocation(record.locationName, record.cabinet)
}

const formatCabinetLabel = (value) => {
  const normalized = String(value || '').trim()
  if (!normalized) return ''
  if (/^(каб\.?|кабинет)\s+/i.test(normalized)) {
    return normalized
  }

  return `Каб. ${normalized}`
}

const EquipmentDeviceCard = ({ device }) => (
  <article className="equipment-device-card">
    <div className="equipment-device-topline">
      <span className="equipment-device-type">{device.type}</span>
      {(device.serial || device.inventoryNumber) && (
        <span className="equipment-device-chip">
          {device.inventoryNumber || device.serial}
        </span>
      )}
    </div>

    <strong className="equipment-device-title">{device.title}</strong>

    <div className="equipment-device-meta">
      {device.serial && <span>SN: {device.serial}</span>}
      {device.inventoryNumber && <span>Инв.: {device.inventoryNumber}</span>}
      {device.suppliedAt && <span>Учёт: {device.suppliedAt}</span>}
    </div>

    {device.linkedPrinter && (
      <div className="equipment-device-inline-pills">
        <span className="equipment-device-inline-pill equipment-device-inline-pill--accent">
          {device.linkedPrinter.cartridgeTypeName ? `Картридж ${device.linkedPrinter.cartridgeTypeName}` : 'Картридж не указан'}
        </span>
        <span className="equipment-device-inline-pill">
          Н {device.linkedPrinter.availableNewCount} · З {device.linkedPrinter.availableRefilledCount}
        </span>
      </div>
    )}

    {device.linkedPrinter && (
      <div className="equipment-device-meta equipment-device-meta--secondary">
        <span>
          {[
            device.linkedPrinter.fio || 'Общий принтер',
            formatEquipmentLocation(device.linkedPrinter.locationName, device.linkedPrinter.room)
              ? formatCabinetLabel(formatEquipmentLocation(device.linkedPrinter.locationName, device.linkedPrinter.room))
              : '',
            device.linkedPrinter.department
          ].filter(Boolean).join(' · ')}
        </span>
      </div>
    )}
  </article>
)

const EquipmentLinkedPhoneCard = ({ phone, compact = false, onEdit, onDelete }) => (
  <article className={`equipment-ip-phone-card ${compact ? 'is-compact' : ''}`}>
    <div className="equipment-ip-phone-header">
      <div>
        <div className="equipment-ip-phone-eyebrow">IP-телефон</div>
        <strong>{phone.displayTitle}</strong>
      </div>
      {!compact && (onEdit || onDelete) && (
        <div className="equipment-record-actions">
          {onEdit && (
            <ActionIconButton onClick={(event) => onEdit(event, phone)} title="Редактировать" rotate={-10} whileTap={{ scale: 0.92 }}>
              <Pencil size={16} />
            </ActionIconButton>
          )}
          {onDelete && (
            <ActionIconButton onClick={(event) => onDelete(event, phone)} title="Удалить" hoverColor="#f87171" rotate={10} whileTap={{ scale: 0.92 }}>
              <Trash2 size={16} />
            </ActionIconButton>
          )}
        </div>
      )}
    </div>

    <div className="equipment-ip-phone-grid">
      {phone.internalNumber && (
        <div className="equipment-ip-phone-field">
          <span>Внутренний</span>
          <strong>{phone.internalNumber}</strong>
        </div>
      )}
      {phone.users && (
        <div className="equipment-ip-phone-field equipment-ip-phone-field--wide">
          <span>User</span>
          <strong>{phone.users}</strong>
        </div>
      )}
      {phone.ipAddress && <CopyableText text={phone.ipAddress} label="IP:" />}
      {phone.macAddress && <CopyableText text={phone.macAddress} label="MAC:" />}
      {phone.login && <CopyableText text={phone.login} label="Логин:" />}
      {phone.password && <CopyableText text={phone.password} hidden={true} label="Пароль:" />}
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
  </article>
)

const EquipmentPhoneDeviceCard = ({ phone }) => (
  <article className="equipment-device-card">
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
  </article>
)

const EquipmentRecordCard = ({ record, onEdit, onDelete }) => (
  <article className="glass-panel equipment-record-card">
    <div className="equipment-record-header">
      <div>
        <div className="equipment-record-eyebrow">
          <span className="editable-tag" role="button" tabIndex={0} onClick={(event) => onEdit(event, record)} onKeyDown={(event) => event.key === 'Enter' && onEdit(event, record)}>{record.department}</span>
          {record.assignmentKind === 'shared' && <span className="equipment-inline-badge editable-tag" role="button" tabIndex={0} onClick={(event) => onEdit(event, record)} onKeyDown={(event) => event.key === 'Enter' && onEdit(event, record)}>Общее</span>}
        </div>
        <h3>{record.title}</h3>
        {record.subtitle && <p>{record.subtitle}</p>}
      </div>

        <div className="equipment-record-pills">
        {formatEquipmentLocations(record) && <span className="equipment-pill editable-tag" role="button" tabIndex={0} onClick={(event) => onEdit(event, record)} onKeyDown={(event) => event.key === 'Enter' && onEdit(event, record)}>{formatCabinetLabel(formatEquipmentLocations(record))}</span>}
        <span className="equipment-pill equipment-pill--accent editable-tag" role="button" tabIndex={0} onClick={(event) => onEdit(event, record)} onKeyDown={(event) => event.key === 'Enter' && onEdit(event, record)}>
          {record.primaryDevice?.type || record.deviceKinds[0]?.type || 'Без устройства'}
        </span>
        <div className="equipment-record-actions">
          <ActionIconButton onClick={(event) => onEdit(event, record)} title="Редактировать" rotate={-10} whileTap={{ scale: 0.92 }}>
            <Pencil size={16} />
          </ActionIconButton>
          <ActionIconButton onClick={(event) => onDelete(event, record)} title="Удалить" hoverColor="#f87171" rotate={10} whileTap={{ scale: 0.92 }}>
            <Trash2 size={16} />
          </ActionIconButton>
        </div>
      </div>
    </div>

    <div className="equipment-record-stats">
      {record.ram && (
        <div className="equipment-stat-tile">
          <span>ОЗУ</span>
          <strong>{record.ram}</strong>
        </div>
      )}
      {record.system && (
        <div className="equipment-stat-tile">
          <span>Система</span>
          <strong>{record.system}</strong>
        </div>
      )}
      {record.cpu && (
        <div className="equipment-stat-tile equipment-stat-tile--wide">
          <span>Процессор</span>
          <strong>{record.cpu}</strong>
        </div>
      )}
      {!record.ram && !record.system && !record.cpu && (
        <div className="equipment-empty-note">Для этой карточки пока не заполнена базовая конфигурация.</div>
      )}
    </div>

    <div className="equipment-device-badges">
      {record.deviceKinds.map((entry) => (
        <span key={`${record.id}-${entry.type}`} className="equipment-device-badge editable-tag" role="button" tabIndex={0} onClick={(event) => onEdit(event, record)} onKeyDown={(event) => event.key === 'Enter' && onEdit(event, record)}>
          <DeviceBadgeIcon label={entry.label} />
          {entry.label}
        </span>
      ))}
    </div>

    <div className="equipment-device-grid">
      {(record.devices.length > 0 || record.ipPhones?.length > 0) ? (
        <>
          {record.devices.map((device) => <EquipmentDeviceCard key={device.id} device={device} />)}
          {record.ipPhones?.map((phone) => (
            <EquipmentPhoneDeviceCard key={phone.id} phone={phone} />
          ))}
        </>
      ) : (
        <div className="equipment-empty-note">Для этой карточки пока не заполнен список устройств.</div>
      )}
    </div>
  </article>
)

const EquipmentPhoneGroup = ({ group, onEditPhone, onDeletePhone }) => (
  <section className="equipment-department-section">
    <div className="section-title-row equipment-section-title">
      <div>
        <h3>{group.name}</h3>
        <p>{group.items.length} IP-телефонов</p>
      </div>
    </div>

    <div className="equipment-ip-phone-list">
      {group.items.map((phone) => (
        <EquipmentLinkedPhoneCard
          key={phone.id}
          phone={phone}
          onEdit={onEditPhone}
          onDelete={onDeletePhone}
        />
      ))}
    </div>
  </section>
)

const EquipmentPageComponent = ({
  view,
  departments,
  phoneGroups,
  loading,
  searchQuery,
  onEdit,
  onDelete,
  onEditPhone,
  onDeletePhone
}) => {
  const isPhonesView = view === 'phones'
  const isEmpty = isPhonesView ? phoneGroups.length === 0 : departments.length === 0

  if (loading) {
    return (
      <div className="content-stack">
        <LoadingState />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="content-stack">
        <EmptyState panel={true}>
          {searchQuery
            ? `По запросу "${searchQuery}" ничего не найдено ${isPhonesView ? 'в IP-телефонах' : 'в оборудовании'}.`
            : isPhonesView
              ? 'IP-телефоны пока не добавлены. Создайте первую запись через кнопку в правом верхнем углу.'
              : 'Рабочие места пока не добавлены. Создайте первую карточку оборудования через кнопку в правом верхнем углу.'}
        </EmptyState>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="content-stack equipment-page"
    >
      {isPhonesView
        ? phoneGroups.map((group) => (
          <EquipmentPhoneGroup
            key={group.id}
            group={group}
            onEditPhone={onEditPhone}
            onDeletePhone={onDeletePhone}
          />
        ))
        : departments.map((department) => (
          <section key={department.id} className="equipment-department-section">
            <div className="section-title-row equipment-section-title">
              <div>
                <h3>{department.name}</h3>
                <p>{department.records.length} карточек · {department.deviceCount} устройств</p>
              </div>
              <div className="equipment-department-summary">
                <span className="equipment-pill">{department.records.length} мест</span>
                <span className="equipment-pill">{department.deviceCount} устройств</span>
              </div>
            </div>

            <div className="equipment-record-grid">
              {department.records.map((record) => (
                <EquipmentRecordCard
                  key={record.id}
                  record={record}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </section>
        ))}
    </motion.div>
  )
}

export default memo(EquipmentPageComponent)
