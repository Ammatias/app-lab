import { useMemo } from 'react'
import { matchSearchValues, generateSearchVariations } from '../../../shared/lib/search'
import { buildHomeLinkSearchTarget, createHomeLinkUniqueKey } from '../../../shared/lib/homeLinks'
import { buildSearchableHomeLinks } from '../lib/resultAdapters'
import { getPasswordSearchTokens } from '../../passwords/lib/passwordSubtypes'
import {
  equipmentRecordMatchesSearch,
  prepareEquipmentIpPhones,
  prepareEquipmentRecords
} from '../../equipment/lib/equipmentAudit'

const ADMIN_SEARCH_STOP_WORDS = ['админ', 'admin', 'администратор', 'administrator']

const GLOBAL_RESULT_TYPE_PRIORITY = {
  equipment: 0,
  equipment_phone: 1,
  ecp: 2,
  password: 3,
  anydesk: 4,
  phonebook: 5,
  cartridges: 6,
  home: 7
}

const normalizeClusterText = (value) => String(value || '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .replace(/[^\p{L}\p{N}\s-]/gu, '')
  .trim()

const getResultClusterKey = (item) => {
  if (!item) return ''

  if (item.type === 'phonebook') {
    return normalizeClusterText(item.name || item.title)
  }

  if (item.type === 'equipment') {
    return normalizeClusterText(item.owner || item.title)
  }

  if (item.type === 'equipment_phone') {
    return normalizeClusterText(item.employeeName || item.users || item.title)
  }

  if (item.type === 'anydesk' || item.type === 'ecp') {
    return normalizeClusterText(item.fio || item.title)
  }

  return ''
}

const isBlockedAdminFragmentQuery = (query) => {
  const normalized = String(query || '').trim().toLowerCase()
  if (!normalized) return false
  if (ADMIN_SEARCH_STOP_WORDS.includes(normalized)) return false
  return ADMIN_SEARCH_STOP_WORDS.some((word) => word.includes(normalized))
}

const stripAdminStopWords = (value) => {
  if (value === null || value === undefined) return value

  return ADMIN_SEARCH_STOP_WORDS.reduce(
    (output, word) => output.replaceAll(word, ' '),
    String(value).toLowerCase()
  )
}

const matchGlobalSearchValues = (values, query) => {
  if (!isBlockedAdminFragmentQuery(query)) {
    return matchSearchValues(values, query)
  }

  return matchSearchValues(
    values.map((value) => stripAdminStopWords(value)),
    query
  )
}

const itemMatchesSearch = (item, query) => matchGlobalSearchValues([
  item.title,
  item.value,
  item.description,
  item.room,
  item.fio,
  item.login,
  item.valid_until,
  item.file_name,
  item.name,
  item.department,
  item.model_name,
  item.cartridge_type_name,
  item.cartridge_name,
  item.note,
  item.subtype,
  item.source_sheet,
  item.is_draft ? 'черновик' : ''
], query)

export const useGlobalSearchResults = ({
  query,
  items,
  phonebook,
  inventory,
  equipment,
  equipmentPhones,
  employees,
  favoriteLinks,
  homeGroups
}) => {
  const normalizedQuery = query.trim()
  const isOpen = normalizedQuery.length > 0
  const isReady = normalizedQuery.length >= 2

  const results = useMemo(() => {
    if (!isReady) return []

    const output = []
    const vars = generateSearchVariations(normalizedQuery)

    items.forEach((item) => {
      const matchesItem = item.type === 'password'
        ? matchGlobalSearchValues(getPasswordSearchTokens(item), normalizedQuery)
        : itemMatchesSearch(item, normalizedQuery)

      if (matchesItem) {
        output.push({ ...item, source: 'DB' })
      }
    })

    phonebook.forEach((contact) => {
      const target = Object.values(contact).join(' ').toLowerCase()
      const safeTarget = isBlockedAdminFragmentQuery(normalizedQuery) ? stripAdminStopWords(target) : target
      if (vars.some((value) => safeTarget.includes(value))) {
        output.push({
          ...contact,
          title: contact.name,
          value: contact.internal,
          source: 'Phonebook',
          type: 'phonebook'
        })
      }
    })

    inventory.forEach((item) => {
      if (itemMatchesSearch(item, normalizedQuery)) {
        output.push({ ...item, title: item.name, source: 'Inventory', type: 'cartridges' })
      }
    })

    const searchableEquipmentPhones = prepareEquipmentIpPhones(equipmentPhones, employees)
    const searchableEquipment = prepareEquipmentRecords(equipment, searchableEquipmentPhones)

    searchableEquipment.forEach((record) => {
      if (equipmentRecordMatchesSearch(record, normalizedQuery)) {
        output.push({
          ...record,
          source: 'Equipment',
          type: 'equipment'
        })
      }
    })

/* IP Phones are now rendered inside their parent Equipment card. */

    const seenHomeLinks = new Set()
    buildSearchableHomeLinks({ favoriteLinks, homeGroups }).forEach((link) => {
      const uniqueKey = createHomeLinkUniqueKey(link)
      if (seenHomeLinks.has(uniqueKey)) return
      seenHomeLinks.add(uniqueKey)

      const target = buildHomeLinkSearchTarget(link)
      const safeTarget = isBlockedAdminFragmentQuery(normalizedQuery) ? stripAdminStopWords(target) : target
      if (vars.some((value) => safeTarget.includes(value))) {
        output.push({
          ...link,
          title: link.name,
          value: link.href,
          description: link.desc || link.sourceTitle,
          source: 'Home',
          type: 'home'
        })
      }
    })

    const sorted = output.sort((left, right) => {
      const leftCluster = getResultClusterKey(left)
      const rightCluster = getResultClusterKey(right)
      if (leftCluster && rightCluster && leftCluster !== rightCluster) {
        return leftCluster.localeCompare(rightCluster, 'ru')
      }
      if (leftCluster && !rightCluster) return -1
      if (!leftCluster && rightCluster) return 1

      const priorityDelta = (GLOBAL_RESULT_TYPE_PRIORITY[left.type] ?? 99) - (GLOBAL_RESULT_TYPE_PRIORITY[right.type] ?? 99)
      if (priorityDelta !== 0) return priorityDelta

      const leftTitle = String(left.title || '')
      const rightTitle = String(right.title || '')
      return leftTitle.localeCompare(rightTitle, 'ru')
    })

    let equipmentLayoutIndex = 0

    return sorted.map((item) => {
      if (item.type !== 'equipment') {
        return item
      }

      const nextItem = {
        ...item,
        equipmentLayoutIndex
      }
      equipmentLayoutIndex += 1
      return nextItem
    })
  }, [employees, equipment, equipmentPhones, favoriteLinks, homeGroups, inventory, isReady, items, normalizedQuery, phonebook])

  return {
    normalizedQuery,
    isOpen,
    isReady,
    results
  }
}
