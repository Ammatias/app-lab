import { useMemo } from 'react'
import { useGroupedInventory } from '../../features/inventory/hooks/useGroupedInventory'
import { useFilteredPrinters } from '../../features/inventory/hooks/useFilteredPrinters'

export function useInventoryPageData({
  active,
  inventory,
  printers,
  searchQuery,
  loadingData
}) {
  const groupedInventory = useGroupedInventory({
    inventory: active ? inventory : [],
    searchQuery: active ? searchQuery : ''
  })

  const filteredPrinters = useFilteredPrinters({
    printers: active ? printers : [],
    searchQuery: active ? searchQuery : ''
  })

  const availableCartridgeTypes = useMemo(() => (
    active
      ? Array.from(new Set([
        ...inventory.map((item) => item.cartridge_type_name).filter(Boolean),
        ...printers.map((item) => item.cartridge_type_name).filter(Boolean)
      ])).sort((left, right) => left.localeCompare(right))
      : []
  ), [active, inventory, printers])

  const availablePrinterModels = useMemo(() => {
    if (!active) {
      return []
    }

    const models = new Map()

    printers.forEach((item) => {
      if (!item.model_name || models.has(item.model_name)) return
      models.set(item.model_name, {
        model_name: item.model_name,
        cartridge_type_name: item.cartridge_type_name || ''
      })
    })

    return Array.from(models.values()).sort((left, right) => left.model_name.localeCompare(right.model_name))
  }, [active, printers])

  return {
    groupedInventory,
    filteredPrinters,
    availableCartridgeTypes,
    availablePrinterModels,
    inventoryLoading: active && loadingData && inventory.length === 0 && printers.length === 0
  }
}
