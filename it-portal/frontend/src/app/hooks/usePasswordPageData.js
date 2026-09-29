import { useMemo } from 'react'
import { usePasswordViewModel } from '../../features/passwords/hooks/usePasswordViewModel'
import { normalizePasswordSubtype } from '../../features/passwords/lib/passwordSubtypes'

export function usePasswordPageData({
  active,
  items,
  searchQuery,
  primaryView,
  networkView,
  loadingData
}) {
  const passwordItems = useMemo(
    () => (
      active
        ? items.filter((item) => item.type === 'password').map((item) => ({ ...item, subtype: normalizePasswordSubtype(item.subtype) }))
        : []
    ),
    [active, items]
  )

  const passwordViewModel = usePasswordViewModel({
    items: passwordItems,
    searchQuery: active ? searchQuery : '',
    primaryView,
    networkView
  })

  return {
    passwordViewModel,
    passwordLoading: active && loadingData && items.length === 0
  }
}
