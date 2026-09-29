async function readErrorMessage(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      const payload = await response.json()
      if (payload?.message) return payload.message
      if (payload?.error) return payload.error
    } catch {
      return fallbackMessage
    }
  }

  try {
    const text = await response.text()
    return text || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export async function fetchSessionUser() {
  const response = await fetch('/api/me')
  if (!response.ok) {
    throw new Error('Unauthorized')
  }

  return response.json()
}

export async function fetchRuntimeInfo() {
  const response = await fetch('/api/runtime-info', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to fetch runtime info')
  }

  return response.json()
}

export async function loginWithBackupCode(code) {
  const response = await fetch('/api/auth/backup-2fa/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code })
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось войти по резервному коду'))
  }

  return response.json()
}

export async function fetchBackupTwoFactorConfig() {
  const response = await fetch('/api/auth/backup-2fa', {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось загрузить настройки резервного входа'))
  }

  return response.json()
}

export async function createBackupTwoFactorSetup() {
  const response = await fetch('/api/auth/backup-2fa/setup', {
    method: 'POST'
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось создать резервный секрет'))
  }

  return response.json()
}

export async function confirmBackupTwoFactorSetup(code) {
  const response = await fetch('/api/auth/backup-2fa/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code })
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось подтвердить резервный код'))
  }

  return response.json()
}

export async function deleteBackupTwoFactorSetup() {
  const response = await fetch('/api/auth/backup-2fa', {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Не удалось отключить резервный вход'))
  }

  return response.json()
}
