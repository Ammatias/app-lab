export async function fetchPhonebook() {
  const response = await fetch('/api/phonebook')
  if (!response.ok) throw new Error('Failed to fetch phonebook')
  return response.json()
}

export async function createPhonebookContact(payload) {
  return fetch('/api/phonebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updatePhonebookContact(itemId, payload) {
  return fetch(`/api/phonebook/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deletePhonebookContact(itemId) {
  return fetch(`/api/phonebook/${itemId}`, { method: 'DELETE' })
}

export async function reorderPhonebookContacts(items) {
  return fetch('/api/phonebook/order', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  })
}

export async function applyPhonebookNetworkLimit(contactId, limitMbps) {
  return fetch(`/api/phonebook/${contactId}/network-limit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit_mbps: limitMbps })
  })
}

export async function clearPhonebookNetworkLimit(contactId) {
  return fetch(`/api/phonebook/${contactId}/network-limit`, { method: 'DELETE' })
}


export async function getPhonebookTacticalAgentCommand(contactId, arch = 'x64') {
  const params = new URLSearchParams({ arch })
  const response = await fetch(`/api/phonebook/${contactId}/tactical-agent-script?${params.toString()}`, {
    method: 'POST'
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Не удалось подготовить команду установки TRMM-агента')
  }

  return response.json()
}

export async function generatePhonebookAgentScript(contactId, arch = 'x64') {
  const payload = await getPhonebookTacticalAgentCommand(contactId, arch)
  const command = String(payload?.command || '').trim()
  if (!command) {
    throw new Error('Tactical RMM вернул пустую команду установки')
  }

  const safeId = String(contactId || 'contact').replace(/[^a-zA-Z0-9_-]/g, '')
  const fileName = `install-trmm-agent-${safeId}.ps1`
  return {
    blob: new Blob([`${command}\r\n`], { type: 'text/plain;charset=utf-8' }),
    fileName
  }
}
