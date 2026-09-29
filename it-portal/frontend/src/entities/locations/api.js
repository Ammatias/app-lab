const getErrorMessage = async (response, fallbackMessage) => {
  const message = await response.text()
  return message || fallbackMessage
}

export async function fetchLocationsDirectory() {
  const response = await fetch('/api/locations')
  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось загрузить кабинеты'))
  return response.json()
}

export async function createLocationEntry(payload) {
  const response = await fetch('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось создать кабинет'))
  return response.json()
}

export async function updateLocationEntry(locationId, payload) {
  const response = await fetch(`/api/locations/${locationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось обновить кабинет'))
  return response.json()
}

export async function deleteLocationEntry(locationId) {
  const response = await fetch(`/api/locations/${locationId}`, {
    method: 'DELETE'
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось удалить кабинет'))
}

export async function createLocationAliasEntry(locationId, payload) {
  const response = await fetch(`/api/locations/${locationId}/aliases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось создать алиас'))
  return response.json()
}

export async function mergeLocationEntries(payload) {
  const response = await fetch('/api/locations/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось схлопнуть кабинеты'))
  return response.json()
}

export async function downloadTacticalAgentScript(locationId, arch = 'x64') {
  const params = new URLSearchParams({ arch })
  const response = await fetch(`/api/locations/${locationId}/tactical-agent-script?${params.toString()}`, {
    method: 'POST'
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось скачать скрипт TRMM-агента'))
  return response
}

export async function generateLocationAgentScript(locationId, arch = 'x64') {
  const response = await downloadTacticalAgentScript(locationId, arch)
  const disposition = response.headers.get('content-disposition') || ''
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1]
  const fileName = encodedName
    ? decodeURIComponent(encodedName)
    : plainName || `tactical-agent-location-${locationId}.ps1`

  return {
    blob: await response.blob(),
    fileName
  }
}

export async function updateLocationAliasEntry(aliasId, payload) {
  const response = await fetch(`/api/location-aliases/${aliasId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось обновить алиас'))
  return response.json()
}

export async function deleteLocationAliasEntry(aliasId) {
  const response = await fetch(`/api/location-aliases/${aliasId}`, {
    method: 'DELETE'
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось удалить алиас'))
}
