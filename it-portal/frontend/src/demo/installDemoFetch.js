const originalFetch = window.fetch.bind(window)

const jsonResponse = (payload, init = {}) => new Response(JSON.stringify(payload), {
  status: init.status || 200,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    ...(init.headers || {})
  }
})

const demoLinks = [
  ['СЭД Демо', 'https://docs.demo.example.com', 'Электронный документооборот'],
  ['Гостевой сайт', 'https://public.demo.example.com/editor', 'Управление публичным сайтом'],
  ['Ресурс администратора', 'https://admin.demo.example.com', 'Служебный раздел'],
  ['База знаний', 'https://knowledge.demo.example.com', 'Инструкции и регламенты'],
  ['Почта и домены', 'https://mail.demo.example.com/users', 'Управление пользователями'],
  ['Виртуальная АТС', 'https://phone.demo.example.com', 'Корпоративная телефония'],
  ['Документооборот', 'https://documents.demo.example.com', 'Рабочие документы'],
  ['ЛК сотрудника', 'https://account.demo.example.com', 'Сервисы для сотрудников'],
  ['Web-смета', 'https://budget.demo.example.com', 'Планирование бюджета'],
  ['OpenWRT', 'https://router.demo.example.com', 'Сетевая инфраструктура'],
  ['Мониторинг', 'https://monitor.demo.example.com', 'Состояние сервисов'],
  ['Заявки', 'https://support.demo.example.com', 'Поддержка пользователей'],
  ['Облачное хранилище', 'https://cloud.demo.example.com', 'Командные файлы']
].map(([name, href, description], index) => ({
  id: index + 1,
  owner_username: 'demo.admin',
  name,
  href,
  description,
  source_title: 'Домашняя',
  is_custom: false,
  sort_order: (index + 2) * 10,
  created_at: null,
  updated_at: null
}))

const groupSpecs = [
  ['Сеть и инфраструктура', 9],
  ['Мониторинг и инструменты', 4],
  ['ИИ и помощники', 9],
  ['Гос. сервисы', 11],
  ['Рабочие сервисы', 18],
  ['Связь и коммуникации', 7],
  ['Сетевой шлюз', 3],
  ['Другое', 1]
]

const demoGroups = groupSpecs.map(([title, count], groupIndex) => ({
  id: groupIndex + 1,
  title,
  parent_id: null,
  sort_order: (groupIndex + 1) * 10,
  links: Array.from({ length: count }, (_, index) => ({
    id: (groupIndex + 1) * 100 + index + 1,
    group_id: groupIndex + 1,
    name: `${title} · ${String(index + 1).padStart(2, '0')}`,
    href: `https://service-${groupIndex + 1}-${index + 1}.demo.example.com`,
    description: 'Демонстрационный сервис',
    sort_order: (index + 1) * 10,
    created_at: null,
    updated_at: null
  })),
  children: []
}))

const demoPhonebook = [
  ['Сотрудник 01', 'Администрация', '201', 72000, 560000],
  ['Сотрудник 02', 'Финансы', '214', 0, 24000],
  ['Сотрудник 03', 'Проекты', '227', 0, 16000],
  ['Сотрудник 04', 'Эксплуатация', '233', 0, 8000],
  ['Сотрудник 05', 'Документооборот', '235', 0, 5224],
  ['Сотрудник 06', 'Технический отдел', '241', 600, 4064]
].map(([name, department, room, upload, download], index) => ({
  id: index + 1,
  name,
  department,
  room,
  position: 'Специалист',
  email: `employee${String(index + 1).padStart(2, '0')}@demo.example.com`,
  phone: '+7 000 000-00-00',
  internal: String(200 + index + 1),
  mobile: '',
  is_external: false,
  tactical_agent_local_ips: [`192.0.2.${index + 10}`],
  tactical_agent_status: index < 4 ? 'online' : 'offline',
  network_upload_bps: upload,
  network_download_bps: download,
  network_speed_updated_at: new Date().toISOString(),
  network_limit_mbps: null
}))

const homeCatalog = {
  groups: demoGroups,
  widgets: [{
    id: 101,
    owner_username: 'demo.admin',
    scope_key: 'favorites',
    group_id: null,
    widget_type: 'network_top',
    title: 'Сетевая загрузка',
    width_mode: 'wide',
    settings_json: '{}',
    sort_order: 10,
    created_at: null,
    updated_at: null
  }],
  favorite_links: demoLinks,
  favorite_item_order: ['widget:101', ...demoLinks.map((link) => `link:${link.id}`)]
}

const notificationOverview = {
  unread_count: 0,
  summary: { total_active: 0, active_critical: 0, active_warning: 0, active_info: 0 },
  preferences: {
    username: 'demo.admin',
    toast_enabled: true,
    sound_enabled: false,
    sound_volume: 50,
    toast_sound: 'aurora',
    digest_enabled: false,
    ecp_enabled: true,
    inventory_enabled: true,
    notes_enabled: true,
    vacation_enabled: false,
    updated_at: null
  },
  rules: [],
  notifications: [],
  history: []
}

const demoUser = {
  username: 'demo.admin',
  display_name: 'Демо Администратор',
  permissions: ['portal.full'],
  allowed_tabs: [
    'museum-map', 'accountable', 'file-storage', 'outdoor-audio', 'ecp',
    'cartridges', 'equipment', 'password', 'anydesk', 'phonebook', 'notes', 'home'
  ]
}

const resolveDemoPayload = (url, method) => {
  if (url.pathname === '/api/me') return demoUser
  if (url.pathname === '/api/runtime-info') return { runtime_instance_id: 'demo-runtime' }
  if (url.pathname === '/api/home/catalog') return homeCatalog
  if (url.pathname === '/api/phonebook') return demoPhonebook
  if (url.pathname === '/api/inventory') return []
  if (url.pathname === '/api/inventory/aliases') return []
  if (url.pathname === '/api/employees') return []
  if (url.pathname === '/api/locations') return []
  if (url.pathname === '/api/departments') return []
  if (url.pathname === '/api/notifications') return notificationOverview
  if (url.pathname === '/api/vacations/me') {
    return { profiles: [], profile: null, current_username: 'demo.admin', yearly_limit: 0, periods: [], access_denied: false }
  }
  if (url.pathname === '/api/presence') return []
  if (url.pathname === '/api/home/calendar-entries') return []
  if (url.pathname === '/api/proxy/ping') {
    const target = url.searchParams.get('url') || ''
    const online = /knowledge|account|budget|router|rmm/.test(target)
    return { status: online ? 'online' : 'offline', latency: online ? 24 + (target.length % 93) : 0 }
  }

  if (method === 'GET') return []
  return { ok: true }
}

window.fetch = (input, init = {}) => {
  const rawUrl = typeof input === 'string' ? input : input?.url
  const url = new URL(rawUrl, window.location.origin)

  if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) {
    return originalFetch(input, init)
  }

  const method = String(init.method || (typeof input === 'object' ? input.method : '') || 'GET').toUpperCase()
  return Promise.resolve(jsonResponse(resolveDemoPayload(url, method)))
}
