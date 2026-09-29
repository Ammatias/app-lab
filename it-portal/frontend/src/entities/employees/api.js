export async function fetchEmployees() {
  const response = await fetch('/api/employees')
  if (!response.ok) throw new Error('Failed to fetch employees')
  return response.json()
}

export async function fetchArchivedEmployees() {
  const response = await fetch('/api/employees/archive')
  if (!response.ok) throw new Error('Failed to fetch archived employees')
  return response.json()
}

export async function createEmployee(payload) {
  return fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function updateEmployee(employeeId, payload) {
  return fetch(`/api/employees/${employeeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function deleteEmployee(employeeId) {
  return fetch(`/api/employees/${employeeId}`, {
    method: 'DELETE'
  })
}

export async function archiveEmployee(employeeId, payload) {
  return fetch(`/api/employees/${employeeId}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export async function restoreEmployee(employeeId) {
  return fetch(`/api/employees/${employeeId}/restore`, {
    method: 'POST'
  })
}
