import { lazy } from 'react'

export const PORTAL_DEFAULT_TAB = 'home'
export const PORTAL_DEFAULT_PATH = '/home'

export const portalRouteMeta = {
  home: {
    id: 'home',
    path: '/home',
    aliases: ['/'],
    showInMainNav: true
  },
  notes: {
    id: 'notes',
    path: '/notes',
    aliases: [],
    showInMainNav: true
  },
  password: {
    id: 'password',
    path: '/passwords',
    aliases: ['/password'],
    showInMainNav: true
  },
  anydesk: {
    id: 'anydesk',
    path: '/anydesk',
    aliases: [],
    showInMainNav: true
  },
  'outdoor-audio': {
    id: 'outdoor-audio',
    path: '/outdoor-audio',
    aliases: ['/audio', '/outdoor-audio-admin'],
    showInMainNav: true
  },
  equipment: {
    id: 'equipment',
    path: '/equipment',
    aliases: [],
    showInMainNav: true
  },
  'museum-map': {
    id: 'museum-map',
    path: '/museum-map',
    aliases: ['/map'],
    showInMainNav: true
  },
  accountable: {
    id: 'accountable',
    path: '/accountable',
    aliases: [],
    showInMainNav: true
  },
  'file-storage': {
    id: 'file-storage',
    path: '/file-storage',
    aliases: ['/documents'],
    showInMainNav: true
  },
  integrations: {
    id: 'integrations',
    path: '/integrations',
    aliases: [],
    showInMainNav: false
  },
  ecp: {
    id: 'ecp',
    path: '/ecp',
    aliases: [],
    showInMainNav: true
  },
  phonebook: {
    id: 'phonebook',
    path: '/phonebook',
    aliases: [],
    showInMainNav: true
  },
  cartridges: {
    id: 'cartridges',
    path: '/inventory',
    aliases: ['/cartridges'],
    showInMainNav: true
  },
  profile: {
    id: 'profile',
    path: '/profile',
    aliases: [],
    showInMainNav: false
  },
  notifications: {
    id: 'notifications',
    path: '/notifications',
    aliases: [],
    showInMainNav: false
  },
  employees: {
    id: 'employees',
    path: '/employees',
    aliases: [],
    showInMainNav: false
  },
  locations: {
    id: 'locations',
    path: '/locations',
    aliases: [],
    showInMainNav: false
  },
  departments: {
    id: 'departments',
    path: '/departments',
    aliases: [],
    showInMainNav: false
  },
  vacations: {
    id: 'vacations',
    path: '/vacations',
    aliases: [],
    showInMainNav: false
  },
  inventoryHistory: {
    id: 'inventoryHistory',
    path: '/inventory/history',
    aliases: [],
    parentTab: 'cartridges',
    showInMainNav: false
  },
  accountableImports: {
    id: 'accountableImports',
    path: '/accountable/imports',
    aliases: [],
    parentTab: 'accountable',
    showInMainNav: false
  },
  accountableWriteoff: {
    id: 'accountableWriteoff',
    path: '/accountable/writeoff',
    aliases: [],
    parentTab: 'accountable',
    showInMainNav: false
  }
}

export const tabPageRoutes = {
  home: lazy(() => import('../features/home/components/HomePage.jsx')),
  notes: lazy(() => import('../features/notes/components/NotesPage.jsx')),
  password: lazy(() => import('../features/passwords/components/PasswordsPage.jsx')),
  anydesk: lazy(() => import('../features/anydesk/components/AnyDeskPage.jsx')),
  'outdoor-audio': lazy(() => import('../features/outdoor-audio/components/OutdoorAudioPage.jsx')),
  equipment: lazy(() => import('../features/equipment/components/EquipmentPage.jsx')),
  'museum-map': lazy(() => import('../features/museum-map/components/MuseumMapPage.jsx')),
  accountable: lazy(() => import('../features/accountable-assets/components/AccountableAssetsPage.jsx')),
  'file-storage': lazy(() => import('../features/file-storage/components/FileStoragePage.jsx')),
  integrations: lazy(() => import('../features/integrations/components/IntegrationsPage.jsx')),
  ecp: lazy(() => import('../features/ecp/components/EcpPage.jsx')),
  phonebook: lazy(() => import('../features/phonebook/components/PhonebookPage.jsx')),
  cartridges: lazy(() => import('../features/inventory/components/InventoryPage.jsx')),
  profile: lazy(() => import('../features/profile/components/ProfilePage.jsx')),
  notifications: lazy(() => import('../features/notifications/components/NotificationsPage.jsx')),
  employees: lazy(() => import('../features/employees/components/EmployeesPage.jsx')),
  locations: lazy(() => import('../features/locations/components/LocationsPage.jsx')),
  departments: lazy(() => import('../features/departments/components/DepartmentsPage.jsx')),
  vacations: lazy(() => import('../features/vacations/components/VacationsPage.jsx')),
  inventoryHistory: lazy(() => import('../features/inventory/components/InventoryHistoryPage.jsx')),
  accountableImports: lazy(() => import('../features/accountable-assets/components/AccountableImportsPage.jsx')),
  accountableWriteoff: lazy(() => import('../features/accountable-assets/components/AccountableWriteoffPage.jsx'))
}

const routeEntries = Object.values(portalRouteMeta)

function normalizePathname(pathname) {
  const normalized = String(pathname || '/').trim() || '/'
  const sanitized = normalized.replace(/\/{2,}/g, '/')

  if (sanitized === '/') {
    return '/'
  }

  return sanitized.replace(/\/+$/, '').toLowerCase()
}

export function isPortalTab(tabId) {
  return Boolean(portalRouteMeta[tabId])
}

export function isMainPortalTab(tabId) {
  return Boolean(portalRouteMeta[tabId]?.showInMainNav !== false)
}

export function getPortalPath(tabId = PORTAL_DEFAULT_TAB) {
  return portalRouteMeta[tabId]?.path || PORTAL_DEFAULT_PATH
}

export function resolvePortalRoute(pathname) {
  const normalizedPath = normalizePathname(pathname)
  const matchedRoute = routeEntries.find((entry) => (
    entry.path === normalizedPath
    || entry.aliases.includes(normalizedPath)
  ))

  return matchedRoute || portalRouteMeta[PORTAL_DEFAULT_TAB]
}

export function buildPortalUrl(tabId, searchParams) {
  const path = getPortalPath(tabId)

  if (!searchParams) {
    return path
  }

  const search = searchParams instanceof URLSearchParams
    ? searchParams.toString()
    : String(searchParams || '').replace(/^\?/, '')

  return search ? `${path}?${search}` : path
}

export function shouldCanonicalizePortalPath(pathname) {
  const normalizedPath = normalizePathname(pathname)
  const resolvedRoute = resolvePortalRoute(normalizedPath)
  return resolvedRoute.path !== normalizedPath
}
