import { useCallback, useEffect, useMemo, useState } from 'react'
import { getUserScopedStorageKey } from '../../shared/lib/storage'

export const DEFAULT_PORTAL_NAV_ORDER = [
  'museum-map',
  'accountable',
  'file-storage',
  'outdoor-audio',
  'integrations',
  'ecp',
  'cartridges',
  'equipment',
  'password',
  'anydesk',
  'phonebook',
  'notes',
  'home'
]

const PORTAL_NAV_ORDER_STORAGE_KEY = 'itportal.portal-nav-order.v4'

const sanitizePortalNavOrder = (value) => {
  if (!Array.isArray(value)) {
    return DEFAULT_PORTAL_NAV_ORDER
  }

  const allowedTabs = new Set(DEFAULT_PORTAL_NAV_ORDER)
  const unique = value
    .map((item) => String(item || '').trim())
    .filter((item, index, array) => allowedTabs.has(item) && array.indexOf(item) === index)

  const result = [...unique]
  const missing = DEFAULT_PORTAL_NAV_ORDER.filter((item) => !result.includes(item))
  for (const item of missing) {
    if (item === 'file-storage') {
      const accountableIndex = result.indexOf('accountable')
      result.splice(accountableIndex >= 0 ? accountableIndex + 1 : 0, 0, item)
    } else if (item === 'museum-map') {
      result.unshift(item)
    } else {
      result.push(item)
    }
  }
  return result
}

export const usePortalNavOrder = ({ user, loadingUser }) => {
  const [navOrder, setNavOrder] = useState(DEFAULT_PORTAL_NAV_ORDER)
  const storageKey = useMemo(
    () => getUserScopedStorageKey(PORTAL_NAV_ORDER_STORAGE_KEY, user),
    [user]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) return

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        setNavOrder(DEFAULT_PORTAL_NAV_ORDER)
        return
      }

      setNavOrder(sanitizePortalNavOrder(JSON.parse(raw)))
    } catch (error) {
      console.warn('Failed to load portal nav order', error)
      setNavOrder(DEFAULT_PORTAL_NAV_ORDER)
    }
  }, [storageKey])

  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey || loadingUser) return

    window.localStorage.setItem(storageKey, JSON.stringify(navOrder))
  }, [loadingUser, navOrder, storageKey])

  const reorderNavItems = useCallback((sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return

    setNavOrder((prev) => {
      const sourceIndex = prev.findIndex((item) => item === sourceId)
      const targetIndex = prev.findIndex((item) => item === targetId)
      if (sourceIndex === -1 || targetIndex === -1) return prev

      const next = [...prev]
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
  }, [])

  const resetNavOrder = useCallback(() => {
    setNavOrder(DEFAULT_PORTAL_NAV_ORDER)
  }, [])

  return {
    navOrder,
    reorderNavItems,
    resetNavOrder
  }
}
