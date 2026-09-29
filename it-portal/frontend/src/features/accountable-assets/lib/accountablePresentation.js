export function getAccountableWriteoffStatus(item) {
  if (item?.writeoff_status === 'pending') {
    return { label: 'На списании', mode: 'pending' }
  }

  if (item?.is_written_off) {
    return { label: 'Списано в XLSX', mode: 'written_off' }
  }

  return { label: 'Активно', mode: 'active' }
}

export function getSelectableWriteoffAssets(assets) {
  return (assets || []).filter((item) => !item.is_written_off && item.writeoff_status !== 'pending')
}

function isWithoutLocation(item) {
  const hasLocations = Array.isArray(item.locations) && item.locations.length > 0
  return !hasLocations && !String(item.location_text || '').trim()
}

export function buildAccountableSummary(assets, completedWriteoffs) {
  const currentAssets = assets || []

  return {
    total: currentAssets.length,
    pending: currentAssets.filter((item) => item.writeoff_status === 'pending').length,
    completed: (completedWriteoffs || []).length,
    importedWrittenOff: currentAssets.filter((item) => item.is_written_off).length,
    withoutLocation: currentAssets.filter(isWithoutLocation).length
  }
}
