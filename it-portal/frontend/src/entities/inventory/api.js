export async function fetchInventory() {
  const response = await fetch('/api/inventory')
  if (!response.ok) throw new Error('Failed to fetch inventory')
  return response.json()
}

export async function fetchInventoryAliases() {
  const response = await fetch('/api/inventory/aliases')
  if (!response.ok) throw new Error('Failed to fetch inventory aliases')
  return response.json()
}

function buildQueryString(filters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      params.set(key, String(value).trim())
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function buildInventoryHistoryExportUrl(format = 'xlsx', filters = {}) {
  const basePath = format === 'csv'
    ? '/api/inventory/history/export.csv'
    : '/api/inventory/history/export'

  return `${basePath}${buildQueryString(filters)}`
}

export async function fetchInventoryHistory(filters = {}) {
  const response = await fetch(`/api/inventory/history${buildQueryString(filters)}`)
  if (!response.ok) throw new Error('Failed to fetch inventory history')
  return response.json()
}

export async function createInventoryItem(payload) {
  return fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateInventoryItem(itemId, payload) {
  return fetch(`/api/inventory/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteInventoryItem(itemId) {
  return fetch(`/api/inventory/${itemId}`, { method: 'DELETE' })
}

export async function installInventoryCartridge(payload) {
  return fetch('/api/inventory/install', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}
