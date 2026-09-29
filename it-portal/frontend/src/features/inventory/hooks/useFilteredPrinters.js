import { useMemo } from 'react'
import { generateSearchVariations } from '../../../shared/lib/search'

export const useFilteredPrinters = ({ printers, searchQuery }) => useMemo(() => {
  const query = String(searchQuery || '').toLowerCase()
  const vars = generateSearchVariations(query)

  return printers
    .filter((printer) => {
      if (!searchQuery) return true
      const target = `${printer.model_name || ''} ${printer.cartridge_type_name || ''} ${printer.cartridge_name || ''} ${printer.location_name || ''} ${printer.room || ''} ${printer.fio || ''}`.toLowerCase()
      return vars.some((value) => target.includes(value))
    })
    .sort((a, b) =>
      (a.model_name || '').localeCompare(b.model_name || '') ||
      (a.location_name || a.room || '').localeCompare(b.location_name || b.room || '') ||
      (a.fio || '').localeCompare(b.fio || '')
    )
}, [printers, searchQuery])
