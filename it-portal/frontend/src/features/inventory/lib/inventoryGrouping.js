function getInventoryGroupName(item) {
  return String(item.cartridge_type_name || item.name || '').trim()
}

export function groupInventoryModels(inventory, { searchQuery = '', searchVariations = [] } = {}) {
  const groups = new Map()

  for (const item of inventory || []) {
    const groupName = getInventoryGroupName(item)
    const target = `${item.name || ''} ${groupName} ${item.note || ''} ${item.refilled_count ?? ''} ${item.new_count ?? ''} ${item.critical_limit ?? ''}`.toLowerCase()

    if (searchQuery && !searchVariations.some((value) => target.includes(value))) {
      continue
    }

    const group = groups.get(groupName) || {
      name: groupName,
      models: [],
      total_refilled: 0,
      total_new: 0,
      printer_count: 0
    }

    group.models.push(item)
    group.total_refilled += Number(item.refilled_count || 0)
    group.total_new += Number(item.new_count || 0)
    group.printer_count = Math.max(group.printer_count, Number(item.printer_count || 0))
    groups.set(groupName, group)
  }

  return [...groups.values()].sort((left, right) => left.name.localeCompare(right.name, 'ru-RU'))
}
