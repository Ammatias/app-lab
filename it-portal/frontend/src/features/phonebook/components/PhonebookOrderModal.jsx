import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, X } from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'

const cloneGroups = (groups) => groups.map((group) => ({
  title: group.title,
  groupSortOrder: group.groupSortOrder,
  contacts: group.contacts.map((contact) => ({ ...contact }))
}))

const moveItem = (items, index, direction) => {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= items.length) return items

  const next = items.slice()
  const current = next[index]
  next[index] = next[nextIndex]
  next[nextIndex] = current
  return next
}

export function PhonebookOrderModal({
  open,
  groupedPhonebook,
  directoryView = 'internal',
  saving = false,
  onClose,
  onSave
}) {
  const [draftGroups, setDraftGroups] = useState([])
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)

  useEffect(() => {
    if (!open) return
    setDraftGroups(cloneGroups(groupedPhonebook || []))
    setSelectedGroupIndex(0)
  }, [groupedPhonebook, open])

  const selectedGroup = draftGroups[selectedGroupIndex] || null
  const isExternalView = directoryView === 'external'
  const title = isExternalView ? 'Порядок организаций' : 'Порядок отделов'

  const orderPayload = useMemo(() => draftGroups.flatMap((group, groupIndex) => (
    group.contacts
      .filter((contact) => Number.isFinite(Number(contact.id)))
      .map((contact, contactIndex) => ({
        id: Number(contact.id),
        group_sort_order: (groupIndex + 1) * 10,
        sort_order: (contactIndex + 1) * 10
      }))
  )), [draftGroups])

  const moveGroup = (index, direction) => {
    setDraftGroups((current) => moveItem(current, index, direction))
    setSelectedGroupIndex((current) => {
      if (current === index) return current + direction
      if (current === index + direction) return index
      return current
    })
  }

  const moveContact = (index, direction) => {
    setDraftGroups((current) => current.map((group, groupIndex) => (
      groupIndex === selectedGroupIndex
        ? { ...group, contacts: moveItem(group.contacts, index, direction) }
        : group
    )))
  }

  const handleSave = () => {
    onSave(orderPayload)
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      panelClassName="glass-panel modal-panel phonebook-order-modal"
      panelStyle={{ width: 'min(1120px, 96vw)', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Телефонный справочник
          </div>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.35rem' }}>{title}</h2>
        </div>
        <button type="button" className="btn" onClick={onClose} title="Закрыть">
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', padding: '18px', minHeight: 0, overflow: 'auto' }}>
        <section style={{ minHeight: 0, overflow: 'auto', paddingRight: '4px' }}>
          {draftGroups.map((group, index) => (
            <div
              key={group.title}
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                padding: '6px',
                border: `1px solid ${selectedGroupIndex === index ? 'rgba(125, 211, 252, 0.65)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.035)'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedGroupIndex(index)}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: 'inherit',
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {group.title}
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{group.contacts.length}</span>
              <span style={{ display: 'inline-flex', gap: '4px' }}>
                <button type="button" className="btn compact" onClick={() => moveGroup(index, -1)} disabled={index === 0 || saving} title="Выше">
                  <ArrowUp size={14} />
                </button>
                <button type="button" className="btn compact" onClick={() => moveGroup(index, 1)} disabled={index === draftGroups.length - 1 || saving} title="Ниже">
                  <ArrowDown size={14} />
                </button>
              </span>
            </div>
          ))}
        </section>

        <section style={{ minHeight: 0, overflow: 'auto', paddingRight: '4px' }}>
          {selectedGroup ? (
            <>
              <div style={{ marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {selectedGroup.title}
              </div>
              {selectedGroup.contacts.map((contact, index) => (
                <div
                  key={contact.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '76px 1fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '10px 12px',
                    marginBottom: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.035)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{contact.room || '-'}</span>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.name}</span>
                  <span style={{ display: 'inline-flex', gap: '4px' }}>
                    <button type="button" className="btn compact" onClick={() => moveContact(index, -1)} disabled={index === 0 || saving} title="Выше">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" className="btn compact" onClick={() => moveContact(index, 1)} disabled={index === selectedGroup.contacts.length - 1 || saving} title="Ниже">
                      <ArrowDown size={14} />
                    </button>
                  </span>
                </div>
              ))}
            </>
          ) : null}
        </section>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button type="button" className="btn" onClick={onClose} disabled={saving}>Отмена</button>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving || orderPayload.length === 0}>
          {saving ? 'Сохранение...' : 'Сохранить порядок'}
        </button>
      </div>
    </ModalShell>
  )
}
