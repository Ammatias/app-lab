const getErrorMessage = async (response, fallbackMessage) => {
  const message = await response.text()
  return message || fallbackMessage
}

export async function fetchDepartmentsDirectory() {
  const response = await fetch('/api/departments')
  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось загрузить отделы'))
  return response.json()
}

export async function createDepartmentEntry(payload) {
  const response = await fetch('/api/departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось создать отдел'))
  return response.json()
}

export async function updateDepartmentEntry(departmentId, payload) {
  const response = await fetch(`/api/departments/${departmentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось обновить отдел'))
  return response.json()
}

export async function deleteDepartmentEntry(departmentId) {
  const response = await fetch(`/api/departments/${departmentId}`, {
    method: 'DELETE'
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось удалить отдел'))
}

export async function createDepartmentAliasEntry(departmentId, payload) {
  const response = await fetch(`/api/departments/${departmentId}/aliases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось создать алиас'))
  return response.json()
}

export async function mergeDepartmentEntries(payload) {
  const response = await fetch('/api/departments/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось схлопнуть отделы'))
  return response.json()
}

export async function updateDepartmentAliasEntry(aliasId, payload) {
  const response = await fetch(`/api/department-aliases/${aliasId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось обновить алиас'))
  return response.json()
}

export async function deleteDepartmentAliasEntry(aliasId) {
  const response = await fetch(`/api/department-aliases/${aliasId}`, {
    method: 'DELETE'
  })

  if (!response.ok) throw new Error(await getErrorMessage(response, 'Не удалось удалить алиас'))
}
