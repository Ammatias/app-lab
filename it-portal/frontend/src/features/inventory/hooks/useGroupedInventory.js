import { useMemo } from 'react'
import { generateSearchVariations } from '../../../shared/lib/search'
import { groupInventoryModels } from '../lib/inventoryGrouping'

export const useGroupedInventory = ({ inventory, searchQuery }) => useMemo(() => {
  const normalizedSearch = String(searchQuery || '').toLowerCase()

  return groupInventoryModels(inventory, {
    searchQuery: normalizedSearch,
    searchVariations: generateSearchVariations(normalizedSearch)
  })
}, [inventory, searchQuery])
