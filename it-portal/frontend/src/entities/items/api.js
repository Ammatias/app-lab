export async function fetchItems() {
  const response = await fetch('/api/items')
  if (!response.ok) throw new Error('Failed to fetch items')
  return response.json()
}

export async function createItem(payload) {
  const response = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return response
}

export async function updateItem(itemId, payload) {
  const response = await fetch(`/api/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return response
}

export async function deleteItem(itemId) {
  return fetch(`/api/items/${itemId}`, { method: 'DELETE' })
}

export async function downloadPrivateKeyArchive(itemId, fileName) {
  const response = await fetch(`/api/items/${itemId}/private-file`)
  if (!response.ok) throw new Error('Не удалось скачать архив закрытого ключа')

  const objectUrl = URL.createObjectURL(await response.blob())
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName || 'ecp-private-key.zip'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}
