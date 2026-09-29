async function readErrorMessage(response, fallbackMessage) {
  try {
    const text = await response.text()
    return text || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export async function fetchPresenceEntries() {
  const response = await fetch('/api/presence')

  if (response.status === 401) {
    return { entries: [], online_ttl_seconds: 90, authorized_ttl_seconds: 300 }
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось загрузить статусы присутствия'))
  }

  return response.json()
}

export async function sendPresenceHeartbeat(payload, options = {}) {
  const response = await fetch('/api/presence', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    keepalive: Boolean(options.keepalive)
  })

  if (response.status === 401) {
    return
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось обновить статус присутствия'))
  }
}
