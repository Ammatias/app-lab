import { useEffect, useMemo, useState } from 'react'
import { loadLinkOverrides } from '../../../shared/lib/storage'
import { HOME_LINK_OVERRIDES_STORAGE_KEY } from '../config/homeLinkGroups'

export const useHomeLinkOverrides = () => {
  const [linkOverrides, setLinkOverrides] = useState({})
  const linkOverridesStorageKey = useMemo(() => HOME_LINK_OVERRIDES_STORAGE_KEY, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setLinkOverrides(loadLinkOverrides(linkOverridesStorageKey))
  }, [linkOverridesStorageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(linkOverridesStorageKey, JSON.stringify(linkOverrides))
  }, [linkOverrides, linkOverridesStorageKey])

  return {
    linkOverrides,
    setLinkOverrides,
    linkOverridesStorageKey
  }
}
