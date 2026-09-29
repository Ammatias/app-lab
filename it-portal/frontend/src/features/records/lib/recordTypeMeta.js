import { createElement } from 'react'
import { Key, List, Monitor, Phone, Printer, Server, Shield } from 'lucide-react'

export const getTypeLabel = (type) => {
  if (type === 'phonebook') return 'Справочник'
  if (type === 'password') return 'Пароль'
  if (type === 'anydesk') return 'AnyDesk'
  if (type === 'ecp') return 'ЭЦП'
  if (type === 'equipment') return 'Оборудование'
  if (type === 'equipment_phone') return 'IP-телефон'
  if (type === 'cartridges' || type === 'inventory') return 'Склад'
  if (type === 'printers' || type === 'printer') return 'Принтер'
  if (type === 'home') return 'Home'
  if (type === 'list') return 'Список'
  return 'База'
}

export const resolveEntityType = (itemType) => (
  itemType === 'phonebook'
    ? 'phonebook'
    : itemType === 'equipment'
      ? 'equipment'
    : itemType === 'equipment_phone'
      ? 'equipment_phone'
    : (itemType === 'cartridges' || itemType === 'inventory')
      ? 'inventory'
      : (itemType === 'printers' || itemType === 'printer')
        ? 'printer'
        : 'item'
)

export const getTypeIcon = (type) => {
  const sharedProps = { size: 20, style: { flexShrink: 0 } }

  if (type === 'password') return createElement(Key, { ...sharedProps, color: 'var(--accent)' })
  if (type === 'anydesk') return createElement(Server, { ...sharedProps, color: 'var(--text-muted)' })
  if (type === 'ecp') return createElement(Shield, { ...sharedProps, color: 'var(--accent)' })
  if (type === 'equipment') return createElement(Monitor, { ...sharedProps, color: '#cfe2ff' })
  if (type === 'equipment_phone') return createElement(Phone, { ...sharedProps, color: '#cfe2ff' })
  if (type === 'cartridges') return createElement(Printer, { ...sharedProps, color: 'var(--accent)' })
  if (type === 'printers') return createElement(Printer, { ...sharedProps, color: 'var(--text-muted)' })
  return createElement(List, { ...sharedProps, color: 'var(--text-muted)' })
}
