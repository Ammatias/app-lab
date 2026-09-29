export async function fetchNotes() {
  const response = await fetch('/api/notes')
  if (!response.ok) throw new Error('Failed to fetch notes')
  return response.json()
}

export async function createNote(payload) {
  return fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateNote(noteId, payload) {
  return fetch(`/api/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteNote(noteId) {
  return fetch(`/api/notes/${noteId}`, {
    method: 'DELETE'
  })
}

export async function fetchZones() {
  const response = await fetch('/api/notes/zones')
  if (!response.ok) throw new Error('Failed to fetch board zones')
  return response.json()
}

export async function createZone(payload) {
  return fetch('/api/notes/zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateZone(zoneId, payload) {
  return fetch(`/api/notes/zones/${zoneId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteZone(zoneId) {
  return fetch(`/api/notes/zones/${zoneId}`, {
    method: 'DELETE'
  })
}
