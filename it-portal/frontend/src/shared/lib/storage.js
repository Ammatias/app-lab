export const createFavoriteId = (name, href) => `${String(name || '').trim()}::${String(href || '').trim().toLowerCase()}`

export const createBaseLinkId = (groupTitle, link) => (
  `${String(groupTitle || '').trim()}::${String(link?.name || '').trim()}::${String(link?.href || '').trim().toLowerCase()}`
)

export const getUserScopedStorageKey = (baseKey, user) => (
  user?.username
    ? `${baseKey}:${String(user.username).toLowerCase()}`
    : user?.email
      ? `${baseKey}:${String(user.email).toLowerCase()}`
      : user?.name
        ? `${baseKey}:${String(user.name).toLowerCase()}`
        : ''
)

export const normalizeFavoriteHref = (href) => {
  const normalized = String(href || '').trim()
  if (!normalized) return ''
  return /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`
}

export const sanitizeFavoriteLink = (link) => {
  const name = String(link?.name || '').trim()
  const href = normalizeFavoriteHref(link?.href)
  const desc = String(link?.desc || '').trim()
  if (!name || !href) return null

  return {
    id: String(link?.id || createFavoriteId(name, href)),
    name,
    href,
    desc,
    sourceTitle: String(link?.sourceTitle || '').trim(),
    isCustom: Boolean(link?.isCustom)
  }
}

export const sanitizeLinkOverride = (override) => {
  const name = String(override?.name || '').trim()
  const href = normalizeFavoriteHref(override?.href)
  const desc = String(override?.desc || '').trim()
  if (!name || !href) return null

  return { name, href, desc }
}

export const loadFavoriteLinks = (storageKey) => {
  if (typeof window === 'undefined' || !storageKey) return []

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(sanitizeFavoriteLink).filter(Boolean)
  } catch (error) {
    console.warn('Failed to load home favorites', error)
    return []
  }
}

export const loadLinkOverrides = (storageKey) => {
  if (typeof window === 'undefined' || !storageKey) return {}

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.entries(parsed).reduce((acc, [key, value]) => {
      const sanitized = sanitizeLinkOverride(value)
      if (sanitized) acc[key] = sanitized
      return acc
    }, {})
  } catch (error) {
    console.warn('Failed to load home link overrides', error)
    return {}
  }
}
