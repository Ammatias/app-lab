const HIDDEN_PORTAL_ACCOUNT_KEYS = new Set(['codex'])

export function normalizePortalAccountValue(value) {
  return String(value || '').trim().toLowerCase()
}

export function isHiddenPortalAccount(account) {
  const values = [
    account?.username,
    account?.name,
    account?.display_name,
    account?.displayName,
    account?.email,
    account?.owner_username,
    account?.owner_name
  ]

  return values.some((value) => {
    const normalized = normalizePortalAccountValue(value)
    if (!normalized) return false

    const emailLocalPart = normalized.includes('@') ? normalized.split('@')[0] : normalized
    return [...HIDDEN_PORTAL_ACCOUNT_KEYS].some((key) => (
      normalized === key
      || emailLocalPart === key
      || normalized.includes(key)
      || emailLocalPart.includes(key)
    ))
  })
}

export function isHiddenPortalUsername(username) {
  return isHiddenPortalAccount({ username })
}

export function filterVisiblePortalAccounts(accounts = []) {
  return (accounts || []).filter((account) => !isHiddenPortalAccount(account))
}

export function getPortalAccountDisplayName(account, fallback = 'Служебная авторизация') {
  if (isHiddenPortalAccount(account)) return fallback
  return account?.name || account?.display_name || account?.displayName || account?.username || fallback
}
