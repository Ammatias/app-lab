import { useCallback, useEffect, useMemo } from 'react'
import { FAVORITES_GROUP_KEY } from '../../features/home/config/homeLinkGroups'
import { PASSWORD_NETWORK_VIEWS, PASSWORD_PRIMARY_VIEWS } from '../../features/passwords/lib/passwordSubtypes'
import { buildPortalUrl, getPortalPath, isMainPortalTab, resolvePortalRoute, shouldCanonicalizePortalPath } from '../routes'

export function usePortalRouteState({ portalLocation, navigatePortal }) {
  const activeRoute = useMemo(
    () => resolvePortalRoute(portalLocation.pathname),
    [portalLocation.pathname]
  )
  const activeRouteId = activeRoute.id
  const activeTab = activeRoute.parentTab || activeRoute.id
  const activeNavTab = activeRoute.showInMainNav === false
    ? (activeRoute.parentTab || null)
    : activeRoute.id
  const isUtilityRoute = activeRoute.showInMainNav === false
  const routeSearchParams = useMemo(
    () => new URLSearchParams(portalLocation.search || ''),
    [portalLocation.search]
  )

  const homeViewMode = routeSearchParams.get('view') === 'classic' ? 'classic' : 'neon'
  const activeHomeGroup = String(routeSearchParams.get('group') || '').trim() || FAVORITES_GROUP_KEY
  const isHomeEditMode = routeSearchParams.get('edit') === '1'
  const viewMode = routeSearchParams.get('view') === 'list' ? 'list' : 'grid'
  const phonebookDirectoryView = routeSearchParams.get('directory') === 'external' ? 'external' : 'internal'
  const passwordPrimaryView = routeSearchParams.get('primary') === PASSWORD_PRIMARY_VIEWS.network
    ? PASSWORD_PRIMARY_VIEWS.network
    : routeSearchParams.get('primary') === PASSWORD_PRIMARY_VIEWS.employeeMail
      ? PASSWORD_PRIMARY_VIEWS.employeeMail
      : PASSWORD_PRIMARY_VIEWS.resources
  const passwordNetworkView = routeSearchParams.get('network') === PASSWORD_NETWORK_VIEWS.wifi
    ? PASSWORD_NETWORK_VIEWS.wifi
    : PASSWORD_NETWORK_VIEWS.wifi
  const equipmentSubview = routeSearchParams.get('subview') === 'phones' ? 'phones' : 'stations'

  const updateRouteSearch = useCallback((mutateSearchParams, { routeId = activeRouteId, replace = false, preserveExisting = true } = {}) => {
    const nextSearchParams = new URLSearchParams(
      preserveExisting && routeId === activeRouteId ? portalLocation.search || '' : ''
    )

    mutateSearchParams(nextSearchParams)
    navigatePortal(buildPortalUrl(routeId, nextSearchParams), { replace })
  }, [activeRouteId, navigatePortal, portalLocation.search])

  const switchTab = useCallback((nextTab) => {
    if (!isMainPortalTab(nextTab)) {
      return
    }

    navigatePortal(getPortalPath(nextTab))
  }, [navigatePortal])

  const setHomeViewMode = useCallback((nextMode) => {
    updateRouteSearch((params) => {
      if (nextMode === 'classic') {
        params.set('view', 'classic')
      } else {
        params.delete('view')
      }
    }, { routeId: 'home' })
  }, [updateRouteSearch])

  const setActiveHomeGroup = useCallback((nextGroupKey) => {
    updateRouteSearch((params) => {
      const normalizedGroupKey = String(nextGroupKey || '').trim()
      if (!normalizedGroupKey || normalizedGroupKey === FAVORITES_GROUP_KEY) {
        params.delete('group')
      } else {
        params.set('group', normalizedGroupKey)
      }
    }, { routeId: 'home' })
  }, [updateRouteSearch])

  const setHomeEditMode = useCallback((nextValue) => {
    updateRouteSearch((params) => {
      if (nextValue) {
        params.set('edit', '1')
      } else {
        params.delete('edit')
      }
    }, { routeId: 'home' })
  }, [updateRouteSearch])

  const setSectionViewMode = useCallback((nextMode) => {
    updateRouteSearch((params) => {
      if (nextMode === 'list') {
        params.set('view', 'list')
      } else {
        params.delete('view')
      }
    })
  }, [updateRouteSearch])

  const setPhonebookDirectoryRouteView = useCallback((nextMode) => {
    updateRouteSearch((params) => {
      if (nextMode === 'external') {
        params.set('directory', 'external')
      } else {
        params.delete('directory')
      }
    }, { routeId: 'phonebook' })
  }, [updateRouteSearch])

  const setPasswordPrimaryRouteView = useCallback((nextMode) => {
    updateRouteSearch((params) => {
      if (nextMode === PASSWORD_PRIMARY_VIEWS.network) {
        params.set('primary', PASSWORD_PRIMARY_VIEWS.network)
        params.set('network', PASSWORD_NETWORK_VIEWS.wifi)
      } else if (nextMode === PASSWORD_PRIMARY_VIEWS.employeeMail) {
        params.set('primary', PASSWORD_PRIMARY_VIEWS.employeeMail)
        params.delete('network')
      } else {
        params.delete('primary')
        params.delete('network')
      }
    }, { routeId: 'password' })
  }, [updateRouteSearch])

  const setPasswordNetworkRouteView = useCallback((nextMode) => {
    updateRouteSearch((params) => {
      params.set('primary', PASSWORD_PRIMARY_VIEWS.network)
      params.set('network', nextMode === PASSWORD_NETWORK_VIEWS.wifi ? PASSWORD_NETWORK_VIEWS.wifi : PASSWORD_NETWORK_VIEWS.wifi)
    }, { routeId: 'password' })
  }, [updateRouteSearch])

  const setEquipmentSubviewRoute = useCallback((nextMode) => {
    updateRouteSearch((params) => {
      if (nextMode === 'phones') {
        params.set('subview', 'phones')
      } else {
        params.delete('subview')
      }
    }, { routeId: 'equipment' })
  }, [updateRouteSearch])

  useEffect(() => {
    if (shouldCanonicalizePortalPath(portalLocation.pathname)) {
      navigatePortal(buildPortalUrl(activeRouteId, routeSearchParams), { replace: true })
    }
  }, [activeRouteId, navigatePortal, portalLocation.pathname, routeSearchParams])

  return {
    activeRoute,
    activeRouteId,
    activeTab,
    activeNavTab,
    isUtilityRoute,
    routeSearchParams,
    homeViewMode,
    activeHomeGroup,
    isHomeEditMode,
    viewMode,
    phonebookDirectoryView,
    passwordPrimaryView,
    passwordNetworkView,
    equipmentSubview,
    switchTab,
    setHomeViewMode,
    setActiveHomeGroup,
    setHomeEditMode,
    setSectionViewMode,
    setPhonebookDirectoryRouteView,
    setPasswordPrimaryRouteView,
    setPasswordNetworkRouteView,
    setEquipmentSubviewRoute
  }
}
