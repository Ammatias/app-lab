export async function fetchEquipment() {
  const response = await fetch('/api/equipment')
  if (!response.ok) throw new Error('Failed to fetch equipment')
  return response.json()
}

export async function createEquipmentRecord(payload) {
  const response = await fetch('/api/equipment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(message || 'Failed to create equipment record')
  }

  return response.json()
}

export async function fetchEquipmentPhones() {
  const response = await fetch('/api/equipment/phones')
  if (!response.ok) throw new Error('Failed to fetch equipment phones')
  return response.json()
}

export async function updateEquipmentRecord(recordId, payload) {
  const response = await fetch(`/api/equipment/${recordId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(message || 'Failed to update equipment record')
  }

  return response.json()
}

export async function deleteEquipmentRecord(recordId) {
  return fetch(`/api/equipment/${recordId}`, {
    method: 'DELETE'
  })
}

export async function createEquipmentPhoneRecord(payload) {
  const response = await fetch('/api/equipment/phones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(message || 'Failed to create equipment phone')
  }

  return response.json()
}

export async function updateEquipmentPhoneRecord(phoneId, payload) {
  const response = await fetch(`/api/equipment/phones/${phoneId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(message || 'Failed to update equipment phone')
  }

  return response.json()
}

export async function deleteEquipmentPhoneRecord(phoneId) {
  return fetch(`/api/equipment/phones/${phoneId}`, {
    method: 'DELETE'
  })
}
