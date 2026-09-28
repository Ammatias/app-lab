import { createElement, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Command,
  Cpu,
  Database,
  Gauge,
  Headphones,
  LayoutDashboard,
  Menu,
  Monitor,
  Network,
  Phone,
  Search,
  Server,
  ShieldCheck,
  Users,
  Wrench,
  X
} from 'lucide-react'

const navItems = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { id: 'services', label: 'Сервисы', icon: Boxes },
  { id: 'equipment', label: 'Оборудование', icon: Monitor },
  { id: 'directory', label: 'Справочник', icon: Phone },
  { id: 'knowledge', label: 'База знаний', icon: BookOpen }
]

const fallbackSummary = {
  generated_at: new Date().toISOString(),
  services_online: 12,
  services_total: 12,
  managed_devices: 148,
  open_requests: 7,
  contacts: 24
}

const fallbackContacts = [
  { id: 1, name: 'Сотрудник 01', role: 'Координатор', department: 'Администрация', extension: '201', status: 'online' },
  { id: 2, name: 'Сотрудник 02', role: 'Специалист', department: 'Финансы', extension: '214', status: 'away' },
  { id: 3, name: 'Сотрудник 03', role: 'Руководитель группы', department: 'Проекты', extension: '227', status: 'online' },
  { id: 4, name: 'Сотрудник 04', role: 'Инженер', department: 'Эксплуатация', extension: '233', status: 'offline' }
]

const services = [
  { name: 'Единый вход', description: 'Доступ к рабочим системам', icon: ShieldCheck, tone: 'violet' },
  { name: 'Удалённая поддержка', description: 'Рабочие станции и серверы', icon: Headphones, tone: 'cyan' },
  { name: 'Учёт оборудования', description: 'Техника, расходники, выдача', icon: Cpu, tone: 'blue' },
  { name: 'Заявки и инструкции', description: 'Помощь и база знаний', icon: CircleHelp, tone: 'amber' }
]

const incidents = [
  { title: 'Обновление файлового сервиса', meta: 'Сегодня, 19:00–19:30', status: 'Запланировано' },
  { title: 'Проверка резервных копий', meta: 'Сегодня, 08:45', status: 'Выполнено' },
  { title: 'Профилактика переговорной', meta: 'Завтра, 12:00', status: 'Запланировано' }
]

function Metric({ icon: Icon, label, value, detail, accent }) {
  return (
    <article className={`metric metric--${accent}`}>
      <div className="metric__icon">{createElement(Icon, { size: 19 })}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  )
}

function SystemMap() {
  return (
    <article className="panel topology">
      <header className="panel__header">
        <div>
          <span className="eyebrow">Контур</span>
          <h2>Рабочая инфраструктура</h2>
        </div>
        <span className="status status--ok"><i /> Системы в норме</span>
      </header>
      <div className="topology__canvas" aria-label="Схема связей сервисов">
        <svg viewBox="0 0 720 310" role="img" aria-hidden="true">
          <defs>
            <linearGradient id="line" x1="0" x2="1"><stop stopColor="#76e6ff" /><stop offset="1" stopColor="#6675ff" /></linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <path className="topology__line" d="M111 69 C218 69 212 155 330 155" />
          <path className="topology__line" d="M111 240 C218 240 212 155 330 155" />
          <path className="topology__line" d="M388 155 C492 155 484 71 608 71" />
          <path className="topology__line" d="M388 155 C492 155 484 238 608 238" />
          <circle className="topology__pulse topology__pulse--one" cx="200" cy="101" r="4" />
          <circle className="topology__pulse topology__pulse--two" cx="500" cy="111" r="4" />
        </svg>
        <div className="node node--identity"><ShieldCheck /><span>Идентификация</span><small>Единый вход</small></div>
        <div className="node node--users"><Users /><span>Сотрудники</span><small>24 контакта</small></div>
        <div className="node node--core"><Network /><span>IT Portal</span><small>единая точка</small></div>
        <div className="node node--devices"><Monitor /><span>Устройства</span><small>148 под управлением</small></div>
        <div className="node node--data"><Database /><span>Данные</span><small>учёт и знания</small></div>
      </div>
      <footer className="topology__footer">
        <span><Activity size={15} /> API отвечает за 38 мс</span>
        <span><CheckCircle2 size={15} /> Последняя проверка только что</span>
      </footer>
    </article>
  )
}

function Overview({ summary }) {
  return (
    <>
      <section className="metrics" aria-label="Основные показатели">
        <Metric icon={Server} label="Сервисы" value={`${summary.services_online}/${summary.services_total}`} detail="в рабочем состоянии" accent="green" />
        <Metric icon={Monitor} label="Устройства" value={summary.managed_devices} detail="под управлением" accent="blue" />
        <Metric icon={Wrench} label="Заявки" value={summary.open_requests} detail="требуют внимания" accent="orange" />
        <Metric icon={Users} label="Справочник" value={summary.contacts} detail="демо-контакта" accent="violet" />
      </section>
      <section className="dashboard-grid">
        <SystemMap />
        <article className="panel activity-panel">
          <header className="panel__header"><div><span className="eyebrow">План</span><h2>Работы и события</h2></div></header>
          <div className="timeline">
            {incidents.map((item, index) => (
              <div className="timeline__item" key={item.title}>
                <span className={`timeline__marker ${index === 1 ? 'is-done' : ''}`} />
                <div><strong>{item.title}</strong><p>{item.meta}</p></div>
                <small>{item.status}</small>
              </div>
            ))}
          </div>
          <button className="text-action">Открыть журнал <ChevronRight size={16} /></button>
        </article>
      </section>
      <section className="services-grid">
        {services.map(({ name, description, icon: Icon, tone }) => (
          <button className="service-card" key={name}>
            <span className={`service-card__icon service-card__icon--${tone}`}>{createElement(Icon)}</span>
            <span><strong>{name}</strong><small>{description}</small></span>
            <ChevronRight size={18} />
          </button>
        ))}
      </section>
    </>
  )
}

function Directory({ contacts }) {
  return (
    <article className="panel data-panel">
      <header className="panel__header">
        <div><span className="eyebrow">Команда</span><h2>Телефонный справочник</h2></div>
        <button className="primary-action"><Phone size={16} /> Добавить контакт</button>
      </header>
      <div className="directory-table" role="table">
        <div className="directory-row directory-row--head" role="row"><span>Сотрудник</span><span>Подразделение</span><span>Добавочный</span><span>Статус</span></div>
        {contacts.map((contact) => (
          <div className="directory-row" role="row" key={contact.id}>
            <span className="person"><i>{contact.name.split(' ').map((part) => part[0]).join('')}</i><span><strong>{contact.name}</strong><small>{contact.role}</small></span></span>
            <span>{contact.department}</span><span className="mono">{contact.extension}</span>
            <span className={`presence presence--${contact.status}`}><i />{contact.status === 'online' ? 'В сети' : contact.status === 'away' ? 'Отошёл' : 'Не в сети'}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function CatalogPage({ active }) {
  const content = {
    services: { eyebrow: 'Каталог', title: 'Рабочие сервисы', icon: Boxes, items: ['Единый вход', 'Удалённая поддержка', 'Файловое хранилище', 'Система заявок', 'Корпоративная связь', 'Резервное копирование'] },
    equipment: { eyebrow: 'Учёт', title: 'Оборудование', icon: Monitor, items: ['Рабочие станции', 'Ноутбуки', 'Мониторы', 'Принтеры', 'Сетевое оборудование', 'Расходные материалы'] },
    knowledge: { eyebrow: 'Инструкции', title: 'База знаний', icon: BookOpen, items: ['Первый день сотрудника', 'Подключение к рабочим сервисам', 'Удалённая работа', 'Печать и сканирование', 'Защита учётной записи', 'Как оформить заявку'] }
  }[active]
  const Icon = content.icon
  return (
    <article className="panel catalog">
      <header className="panel__header"><div><span className="eyebrow">{content.eyebrow}</span><h2>{content.title}</h2></div><button className="primary-action"><Command size={16} /> Быстрое действие</button></header>
      <div className="catalog__grid">
        {content.items.map((item, index) => <button key={item}><span>{createElement(Icon, { size: 19 })}</span><strong>{item}</strong><small>{index % 2 === 0 ? 'Доступно' : 'Обновлено недавно'}</small><ChevronRight size={17} /></button>)}
      </div>
    </article>
  )
}

export default function App() {
  const [active, setActive] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [summary, setSummary] = useState(fallbackSummary)
  const [contacts, setContacts] = useState(fallbackContacts)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetch('/api/summary', { signal: controller.signal }).then((response) => response.ok ? response.json() : fallbackSummary),
      fetch('/api/contacts', { signal: controller.signal }).then((response) => response.ok ? response.json() : fallbackContacts)
    ]).then(([nextSummary, nextContacts]) => {
      setSummary(nextSummary)
      setContacts(nextContacts)
    }).catch(() => {})
    return () => controller.abort()
  }, [])

  const filteredContacts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return contacts
    return contacts.filter((item) => `${item.name} ${item.role} ${item.department} ${item.extension}`.toLowerCase().includes(normalized))
  }, [contacts, query])

  const selectPage = (id) => { setActive(id); setMenuOpen(false) }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand"><span><Network /></span><div><strong>IT Portal</strong><small>рабочее пространство</small></div><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню"><X /></button></div>
        <nav aria-label="Основная навигация">
          <p>Рабочий стол</p>
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'is-active' : ''} onClick={() => selectPage(id)}>{createElement(Icon, { size: 19 })}<span>{label}</span>{active === id && <i />}</button>)}
        </nav>
        <div className="sidebar__health"><div><Gauge size={17} /><span>Состояние контура</span></div><strong><i /> Стабильно</strong><small>Демо-режим · синтетические данные</small></div>
        <div className="profile"><span>ИД</span><div><strong>ИТ-демо</strong><small>Администратор</small></div><ChevronRight size={16} /></div>
      </aside>
      {menuOpen && <button className="scrim" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню" />}
      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Открыть меню"><Menu /></button>
          <label className="search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти сотрудника, сервис или устройство" /><kbd>⌘ K</kbd></label>
          <div className="topbar__actions"><button aria-label="Поддержка"><Headphones /></button><button aria-label="Организация"><Building2 /></button></div>
        </header>
        <div className="workspace">
          <div className="page-heading"><div><span className="eyebrow">Внутренний сервис · публичная демонстрация</span><h1>{navItems.find((item) => item.id === active)?.label}</h1><p>{active === 'overview' ? 'Операционная картина ИТ-сервисов в одном рабочем пространстве.' : 'Синтетические данные показывают структуру интерфейса без раскрытия рабочей среды.'}</p></div><div className="timestamp"><span><Activity size={15} /> Контур доступен</span><small>Обновлено {new Date(summary.generated_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</small></div></div>
          {active === 'overview' && <Overview summary={summary} />}
          {active === 'directory' && <Directory contacts={filteredContacts} />}
          {['services', 'equipment', 'knowledge'].includes(active) && <CatalogPage active={active} />}
        </div>
      </main>
    </div>
  )
}

