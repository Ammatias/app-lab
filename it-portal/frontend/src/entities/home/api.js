export async function fetchHomeCatalog() {
  const response = await fetch('/api/home/catalog')
  if (!response.ok) throw new Error('Failed to fetch home catalog')
  return response.json()
}

async function readErrorMessage(response, fallbackMessage) {
  try {
    const text = await response.text()
    return text || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export async function createHomeGroup(payload) {
  return fetch('/api/home/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
}

export async function createHomeLink(payload) {
  return fetch('/api/home/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
}

export async function updateHomeLink(linkId, payload) {
  return fetch(`/api/home/links/${linkId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
}

export async function deleteHomeLink(linkId) {
  return fetch(`/api/home/links/${linkId}`, {
    method: 'DELETE'
  })
}

export async function saveHomeFavorites(payload) {
  const response = await fetch('/api/home/favorites', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось сохранить Домашнюю'))
  }

  return response.json()
}

export async function reorderHomeFavorites(payload) {
  const response = await fetch('/api/home/favorites/reorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось переставить элементы Домашней'))
  }
}

export async function createHomeWidget(payload) {
  const response = await fetch('/api/home/widgets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось создать виджет'))
  }

  return response.json()
}

export async function deleteHomeWidget(widgetId) {
  const response = await fetch(`/api/home/widgets/${widgetId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось удалить виджет'))
  }
}

export async function updateHomeWidget(widgetId, payload) {
  const response = await fetch(`/api/home/widgets/${widgetId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось обновить виджет'))
  }

  return response.json()
}

export async function reorderHomeItems(payload) {
  const response = await fetch('/api/home/reorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось переставить элементы на главной'))
  }
}

export async function fetchHomeCalendarEntries(month) {
  const response = await fetch(`/api/home/calendar-entries?month=${encodeURIComponent(month)}`)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось загрузить записи календаря'))
  }

  return response.json()
}

export async function createHomeCalendarEntry(payload) {
  const response = await fetch('/api/home/calendar-entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось создать запись календаря'))
  }

  return response.json()
}

export async function updateHomeCalendarEntry(entryId, payload) {
  const response = await fetch(`/api/home/calendar-entries/${entryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось обновить запись календаря'))
  }

  return response.json()
}

export async function deleteHomeCalendarEntry(entryId) {
  const response = await fetch(`/api/home/calendar-entries/${entryId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось удалить запись календаря'))
  }
}
