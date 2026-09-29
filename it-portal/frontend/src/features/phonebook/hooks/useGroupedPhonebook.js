import { useMemo } from 'react'
import { generateSearchVariations } from '../../../shared/lib/search'

const getOrderValue = (value) => Number.isFinite(Number(value)) ? Number(value) : 10000

export const useGroupedPhonebook = ({ phonebook, searchQuery, directoryView = 'internal' }) => useMemo(() => {
  const query = String(searchQuery || '').toLowerCase()
  const vars = generateSearchVariations(query)
  const groups = {}
  const showExternal = directoryView === 'external'

  phonebook.forEach((contact) => {
    const isExternal = Boolean(contact.is_external)
    if (showExternal !== isExternal) return

    const groupTitle = showExternal
      ? (contact.organization || 'Без организации')
      : (contact.department || 'Без отдела')

    if (!groups[groupTitle]) groups[groupTitle] = []
    groups[groupTitle].push(contact)
  })

  const result = []
  Object.entries(groups).forEach(([title, contacts]) => {
    const filtered = contacts.filter((contact) => {
      if (!searchQuery) return true
      const target = Object.values(contact).join(' ').toLowerCase()
      return vars.some((value) => target.includes(value))
    })

    if (filtered.length > 0) {
      const orderedContacts = filtered.slice().sort((left, right) => (
        getOrderValue(left.sort_order) - getOrderValue(right.sort_order) ||
        String(left.name || '').localeCompare(String(right.name || ''), 'ru-RU') ||
        getOrderValue(left.id) - getOrderValue(right.id)
      ))
      const groupSortOrder = orderedContacts.reduce(
        (min, contact) => Math.min(min, getOrderValue(contact.group_sort_order)),
        10000
      )

      result.push({ title, contacts: orderedContacts, groupSortOrder })
    }
  })

  result.sort((a, b) => (
    getOrderValue(a.groupSortOrder) - getOrderValue(b.groupSortOrder) ||
    a.title.localeCompare(b.title, 'ru-RU')
  ))
  return result
}, [phonebook, searchQuery, directoryView])
