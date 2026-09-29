import { Building2, Hash, Mail, Phone, Search, Smartphone, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { parseHomeWidgetSettings, stringifyHomeWidgetSettings } from '../lib/homeWidgetSettings'

const MAX_FAVORITE_CONTACTS = 12

function normalizeSearchValue(value) {
  return String(value || '').trim().toLowerCase()
}

function toTelHref(value) {
  const normalized = String(value || '').replace(/[^\d+]/g, '')
  return normalized ? `tel:${normalized}` : ''
}

function buildContactMeta(parts) {
  return parts.map((item) => String(item || '').trim()).filter(Boolean).join(' · ')
}

export function HomeFavoriteContactsWidget({
  widget,
  employees = [],
  phonebook = [],
  isHomeEditMode,
  onUpdateHomeWidget
}) {
  const [query, setQuery] = useState('')
  const settings = useMemo(() => parseHomeWidgetSettings(widget), [widget])

  const allOptions = useMemo(() => {
    const employeeOptions = (employees || []).map((employee) => ({
      key: `employee:${employee.id}`,
      kind: 'employee',
      id: employee.id,
      title: employee.full_name,
      subtitle: employee.position || employee.department || 'Сотрудник',
      meta: buildContactMeta([employee.department, employee.room]),
      internal: employee.internal,
      phone: employee.phone,
      mobile: employee.mobile,
      email: employee.email,
      searchValue: normalizeSearchValue([
        employee.full_name,
        employee.position,
        employee.department,
        employee.room,
        employee.internal,
        employee.phone,
        employee.mobile,
        employee.email
      ].join(' '))
    }))

    const phonebookOptions = (phonebook || [])
      .filter((contact) => contact.is_external || !contact.employee_id)
      .map((contact) => ({
        key: `phonebook:${contact.id}`,
        kind: 'phonebook',
        id: contact.id,
        title: contact.name,
        subtitle: contact.position || contact.organization || contact.department || 'Контакт',
        meta: buildContactMeta([
          contact.is_external ? contact.organization : contact.department,
          contact.room,
          contact.note
        ]),
        internal: contact.internal,
        phone: contact.phone,
        mobile: contact.mobile,
        email: contact.email,
        searchValue: normalizeSearchValue([
          contact.name,
          contact.position,
          contact.organization,
          contact.department,
          contact.room,
          contact.note,
          contact.internal,
          contact.phone,
          contact.mobile,
          contact.email
        ].join(' '))
      }))

    return [...employeeOptions, ...phonebookOptions]
      .sort((left, right) => left.title.localeCompare(right.title, 'ru-RU'))
  }, [employees, phonebook])

  const optionMap = useMemo(
    () => new Map(allOptions.map((item) => [item.key, item])),
    [allOptions]
  )

  const selectedContacts = useMemo(
    () => settings.contacts
      .map((item) => optionMap.get(`${item.kind}:${item.id}`))
      .filter(Boolean),
    [optionMap, settings.contacts]
  )

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query)
    if (!normalizedQuery) return allOptions.slice(0, 18)
    return allOptions
      .filter((item) => item.searchValue.includes(normalizedQuery))
      .slice(0, 18)
  }, [allOptions, query])

  const hasDirectoryContacts = allOptions.length > 0
  const limitReached = settings.contacts.length >= MAX_FAVORITE_CONTACTS

  const updateContacts = (nextContacts) => (
    onUpdateHomeWidget(widget, {
      settings_json: stringifyHomeWidgetSettings(widget.widget_type, { contacts: nextContacts })
    })
  )

  const toggleContact = (option) => {
    const exists = settings.contacts.some((item) => item.kind === option.kind && item.id === option.id)
    if (!exists && limitReached) return
    const nextContacts = exists
      ? settings.contacts.filter((item) => !(item.kind === option.kind && item.id === option.id))
      : [...settings.contacts, { kind: option.kind, id: option.id }]
    updateContacts(nextContacts)
  }

  return (
    <div className="home-contact-widget">
      {selectedContacts.length > 0 ? (
        <div className="home-contact-ribbon">
          {selectedContacts.map((contact) => (
            <article key={contact.key} className="home-contact-card">
              <div className="home-contact-card-copy">
                <strong>{contact.title}</strong>
                <span>{contact.subtitle}</span>
                {contact.meta ? <small>{contact.meta}</small> : null}
              </div>

              <div className="home-contact-card-actions">
                {contact.internal ? (
                  <a className="home-contact-chip" href={toTelHref(contact.internal)} title={`Позвонить: ${contact.internal}`}>
                    <Hash size={12} /> {contact.internal}
                  </a>
                ) : null}
                {contact.phone ? (
                  <a className="home-contact-chip" href={toTelHref(contact.phone)} title={`Позвонить: ${contact.phone}`}>
                    <Phone size={12} /> {contact.phone}
                  </a>
                ) : null}
                {contact.mobile ? (
                  <a className="home-contact-chip" href={toTelHref(contact.mobile)} title={`Позвонить: ${contact.mobile}`}>
                    <Smartphone size={12} /> {contact.mobile}
                  </a>
                ) : null}
                {contact.email ? (
                  <a className="home-contact-chip" href={`mailto:${contact.email}`} title={`Написать: ${contact.email}`}>
                    <Mail size={12} /> {contact.email}
                  </a>
                ) : null}
                {!contact.internal && !contact.phone && !contact.mobile && !contact.email ? (
                  <span className="home-contact-chip is-muted">
                    <Building2 size={12} /> Нет контакта
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="home-widget-empty">
          {hasDirectoryContacts
            ? 'В ленте пока никого нет. Переключите Home в режим редактирования и соберите быстрый доступ к нужным людям.'
            : 'Справочник пока пуст. Когда появятся сотрудники или контакты, их можно будет закрепить в этой ленте.'}
        </div>
      )}

      {isHomeEditMode ? (
        <div className="home-widget-config-panel">
          <div className="home-widget-config-head">
            <strong>Настроить ленту</strong>
            <span>
              {selectedContacts.length > 0
                ? `Выбрано: ${selectedContacts.length} из ${MAX_FAVORITE_CONTACTS}`
                : `Выберите до ${MAX_FAVORITE_CONTACTS} человек`}
            </span>
          </div>

          <label className="home-widget-search">
            <Search size={14} />
            <input
              type="text"
              className="input-glass"
              placeholder="Поиск по имени, отделу, телефону"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="home-widget-option-list">
            {!hasDirectoryContacts ? (
              <div className="home-widget-empty">
                Контактов для выбора пока нет.
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="home-widget-empty">
                Ничего не найдено. Попробуйте имя, отдел, кабинет или номер.
              </div>
            ) : filteredOptions.map((option) => {
              const isActive = settings.contacts.some((item) => item.kind === option.kind && item.id === option.id)
              const isDisabled = !isActive && limitReached

              return (
                <button
                  key={option.key}
                  type="button"
                  className={`home-widget-option-row ${isActive ? 'is-active' : ''} ${isDisabled ? 'is-disabled' : ''}`}
                  onClick={() => toggleContact(option)}
                  disabled={isDisabled}
                >
                  <span className="home-widget-option-row-copy">
                    <strong>{option.title}</strong>
                    <span>{buildContactMeta([option.subtitle, option.meta]) || 'Без дополнительных данных'}</span>
                  </span>
                  <span className="home-widget-option-row-state">
                    {isActive ? 'Выбран' : isDisabled ? 'Лимит' : 'Добавить'}
                  </span>
                </button>
              )
            })}
          </div>

          {limitReached ? (
            <div className="home-widget-config-note">
              Лента уже заполнена. Уберите один контакт, чтобы добавить нового.
            </div>
          ) : null}

          {settings.contacts.length > 0 ? (
            <div className="home-widget-config-actions">
              <button
                type="button"
                className="btn"
                onClick={() => updateContacts([])}
              >
                <X size={14} /> Очистить ленту
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
