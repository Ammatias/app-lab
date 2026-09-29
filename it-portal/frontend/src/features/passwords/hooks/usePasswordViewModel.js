import { useMemo } from 'react'
import { matchSearchValues } from '../../../shared/lib/search'
import {
  normalizePasswordSubtype,
  PASSWORD_PRIMARY_VIEWS,
  PASSWORD_SUBTYPE_META,
  getPasswordSearchTokens
} from '../lib/passwordSubtypes'

const sortPasswordItems = (items) => items.slice().sort((a, b) => (a.title || '').localeCompare(b.title || ''))

export function usePasswordViewModel({
  items,
  searchQuery,
  primaryView,
  networkView
}) {
  return useMemo(() => {
    const normalizedItems = items.map((item) => ({
      ...item,
      subtype: normalizePasswordSubtype(item.subtype)
    }))

    const bySubtype = {
      resource: normalizedItems.filter((item) => item.subtype === 'resource'),
      wifi: normalizedItems.filter((item) => item.subtype === 'wifi'),
      employee_email: normalizedItems.filter((item) => item.subtype === 'employee_email')
    }

    const activeSubtype = primaryView === PASSWORD_PRIMARY_VIEWS.network
      ? normalizePasswordSubtype(networkView)
      : primaryView === PASSWORD_PRIMARY_VIEWS.employeeMail
        ? 'employee_email'
        : 'resource'
    const visibleItems = sortPasswordItems(
      bySubtype[activeSubtype].filter((item) => matchSearchValues(getPasswordSearchTokens(item), searchQuery)),
      activeSubtype
    )

    return {
      activeSubtype,
      activeHint: PASSWORD_SUBTYPE_META[activeSubtype].hint,
      visibleItems,
      stats: {
        resource: bySubtype.resource.length,
        wifi: bySubtype.wifi.length,
        employeeEmail: bySubtype.employee_email.length
      }
    }
  }, [items, networkView, primaryView, searchQuery])
}
