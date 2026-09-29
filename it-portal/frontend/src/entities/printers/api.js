export async function fetchPrinters() {
  const response = await fetch('/api/printers')
  if (!response.ok) throw new Error('Failed to fetch printers')
  return response.json()
}

export async function createPrinterLocation(payload) {
  return fetch('/api/printers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updatePrinterLocation(itemId, payload) {
  return fetch(`/api/printers/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deletePrinterLocation(itemId) {
  return fetch(`/api/printers/${itemId}`, { method: 'DELETE' })
}
