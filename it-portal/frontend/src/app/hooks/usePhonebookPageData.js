import { useMemo } from 'react'
import { useGroupedPhonebook } from '../../features/phonebook/hooks/useGroupedPhonebook'

export function usePhonebookPageData({
  active,
  phonebook,
  searchQuery,
  directoryView,
  loadingData
}) {
  const groupedPhonebook = useGroupedPhonebook({
    phonebook: active ? phonebook : [],
    searchQuery: active ? searchQuery : '',
    directoryView
  })

  const phonebookOrderGroups = useGroupedPhonebook({
    phonebook: active ? phonebook : [],
    searchQuery: '',
    directoryView
  })

  const phonebookOrganizations = useMemo(() => (
    active
      ? Array.from(new Set(
        phonebook
          .map((contact) => String(contact.organization || '').trim())
          .filter(Boolean)
      )).sort((left, right) => left.localeCompare(right))
      : []
  ), [active, phonebook])

  const phonebookDepartments = useMemo(() => (
    active
      ? Array.from(new Set(
        phonebook
          .filter((contact) => !contact.is_external)
          .map((contact) => String(contact.department || '').trim())
          .filter(Boolean)
      )).sort((left, right) => left.localeCompare(right, 'ru-RU'))
      : []
  ), [active, phonebook])

  const phonebookRooms = useMemo(() => (
    active
      ? Array.from(new Set(
        phonebook
          .filter((contact) => !contact.is_external)
          .map((contact) => String(contact.room || '').trim())
          .filter(Boolean)
      )).sort((left, right) => left.localeCompare(right, 'ru-RU', { numeric: true }))
      : []
  ), [active, phonebook])

  return {
    groupedPhonebook,
    phonebookOrderGroups,
    phonebookOrganizations,
    phonebookDepartments,
    phonebookRooms,
    phonebookLoading: active && loadingData && phonebook.length === 0
  }
}
