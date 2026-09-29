export const DEFAULT_VACATIONS_OVERVIEW = {
  profiles: [],
  profile: null,
  current_username: '',
  yearly_limit: 0,
  periods: [],
  access_denied: false
}

export async function fetchMyVacations() {
  const response = await fetch('/api/vacations/me')
  if (response.status === 403) {
    return { ...DEFAULT_VACATIONS_OVERVIEW, access_denied: true }
  }
  if (!response.ok) throw new Error(await response.text() || 'Failed to fetch vacations')
  return response.json()
}

export async function createVacationPeriod(payload) {
  const response = await fetch('/api/vacations/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to create vacation')
  return response.json()
}

export async function updateVacationPeriod(vacationId, payload) {
  const response = await fetch(`/api/vacations/me/${vacationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to update vacation')
  return response.json()
}

export async function deleteVacationPeriod(vacationId) {
  const response = await fetch(`/api/vacations/me/${vacationId}`, {
    method: 'DELETE'
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to delete vacation')
}

export async function fetchVacationCalendar(year) {
  const response = await fetch(`/api/vacations/calendar?year=${encodeURIComponent(year)}`)
  if (response.status === 403) {
    throw new Error('Vacations are available only to portal admins')
  }
  if (!response.ok) throw new Error(await response.text() || 'Failed to fetch vacation calendar')
  return response.json()
}

function toBase64(bytes) {
  let binary = ''
  const chunkSize = 0x8000

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return window.btoa(binary)
}

export async function importVacationScheduleDocx(file) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const response = await fetch('/api/vacations/import-docx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_name: file.name,
      content_base64: toBase64(bytes)
    })
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to import vacation schedule')
  return response.json()
}

export async function exportVacationScheduleDocx(year) {
  const response = await fetch(`/api/vacations/export-docx?year=${encodeURIComponent(year)}`)
  if (!response.ok) throw new Error(await response.text() || 'Failed to export vacation schedule')

  const disposition = response.headers.get('content-disposition') || ''
  const match = disposition.match(/filename=\"([^\"]+)\"/)

  return {
    blob: await response.blob(),
    fileName: match?.[1] || `grafik_otpuskov_it_otdela_${year}.docx`
  }
}
