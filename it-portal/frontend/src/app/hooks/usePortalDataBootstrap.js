import { useEffect } from 'react'

export const SHARED_DATASET_KEYS = ['employees', 'locations', 'departments']
export const GLOBAL_SEARCH_DATASET_KEYS = ['items', 'home', 'phonebook', 'inventory', 'equipment', 'equipmentPhones']
export const ROUTE_DATASET_KEYS = {
  home: ['home', 'phonebook', 'inventory'],
  notes: ['notes'],
  password: ['items'],
  anydesk: ['items'],
  equipment: ['equipment', 'equipmentPhones'],
  accountable: [],
  'file-storage': [],
  integrations: [],
  ecp: ['items'],
  phonebook: ['phonebook', 'items'],
  cartridges: ['inventory', 'inventoryAliases', 'printers'],
  'outdoor-audio': []
}

function hasPortalWideAccess(user) {
  return Array.isArray(user?.permissions) && user.permissions.includes('portal.full')
}

function isRouteAllowedForUser(user, activeTab) {
  const allowedTabs = Array.isArray(user?.allowed_tabs) ? user.allowed_tabs : []
  return allowedTabs.length === 0 || allowedTabs.includes(activeTab)
}

export function usePortalDataBootstrap({
  user,
  activeTab,
  globalSearchQuery,
  getMissingDatasetKeys,
  ensureSharedAppData,
  ensureRouteData,
  ensureGlobalSearchData,
  setLoadingData,
  onInitialRouteReady
}) {
  useEffect(() => {
    if (!user) return
    if (!isRouteAllowedForUser(user, activeTab)) return

    const requiredDatasetKeys = [
      ...(hasPortalWideAccess(user) ? SHARED_DATASET_KEYS : []),
      ...(ROUTE_DATASET_KEYS[activeTab] || [])
    ]
    const missingDatasetKeys = getMissingDatasetKeys(requiredDatasetKeys)
    if (missingDatasetKeys.length === 0) {
      onInitialRouteReady?.()
      return
    }

    let cancelled = false

    const loadRouteData = async () => {
      setLoadingData(true)
      try {
        if (hasPortalWideAccess(user)) {
          await ensureSharedAppData()
        }
        await ensureRouteData(activeTab)
        onInitialRouteReady?.()
      } catch (error) {
        console.error(`Failed to fetch route data for ${activeTab}`, error)
      } finally {
        if (!cancelled) {
          setLoadingData(false)
        }
      }
    }

    loadRouteData()
    return () => {
      cancelled = true
    }
  }, [activeTab, ensureRouteData, ensureSharedAppData, getMissingDatasetKeys, onInitialRouteReady, setLoadingData, user])

  useEffect(() => {
    if (!user || !String(globalSearchQuery || '').trim()) return
    if (!hasPortalWideAccess(user)) return

    const missingDatasetKeys = getMissingDatasetKeys(GLOBAL_SEARCH_DATASET_KEYS)
    if (missingDatasetKeys.length === 0) {
      return
    }

    let cancelled = false

    const loadGlobalSearchData = async () => {
      setLoadingData(true)
      try {
        await ensureSharedAppData()
        await ensureGlobalSearchData()
      } catch (error) {
        console.error('Failed to expand global search dataset', error)
      } finally {
        if (!cancelled) {
          setLoadingData(false)
        }
      }
    }

    loadGlobalSearchData()
    return () => {
      cancelled = true
    }
  }, [ensureGlobalSearchData, ensureSharedAppData, getMissingDatasetKeys, globalSearchQuery, setLoadingData, user])
}
