import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { saveHomeFavorites } from '../../../entities/home/api'
import {
  createFavoriteId,
  getUserScopedStorageKey,
  loadFavoriteLinks,
  sanitizeFavoriteLink
} from '../../../shared/lib/storage'
import { HOME_FAVORITES_STORAGE_KEY } from '../config/homeLinkGroups'

const mapFavoriteFromServer = (link) => {
  const favorite = sanitizeFavoriteLink({
    id: link?.id ? String(link.id) : createFavoriteId(link?.name, link?.href),
    name: link?.name,
    href: link?.href,
    desc: link?.description,
    sourceTitle: link?.source_title,
    isCustom: link?.is_custom
  })

  return favorite ? { ...favorite, sort_order: link?.sort_order } : null
}

const toServerFavoritePayload = (link) => ({
  name: link.name,
  href: link.href,
  description: link.desc || '',
  source_title: link.sourceTitle || '',
  is_custom: Boolean(link.isCustom)
})

const mergeUniqueFavorites = (links) => {
  const seen = new Set()
  const result = []

  for (const link of links) {
    const favorite = sanitizeFavoriteLink(link)
    if (!favorite) continue

    const key = `${favorite.name.toLowerCase()}::${favorite.href.toLowerCase()}`
    if (seen.has(key)) continue

    seen.add(key)
    result.push(favorite)
  }

  return result
}

export const useHomeFavorites = ({
  user,
  loadingUser,
  serverFavoriteLinks = [],
  onServerFavoritesChange
}) => {
  const [favoriteLinks, setFavoriteLinks] = useState([])
  const migratedStorageKeysRef = useRef(new Set())
  const favoriteStorageKey = useMemo(
    () => getUserScopedStorageKey(HOME_FAVORITES_STORAGE_KEY, user),
    [user]
  )

  const applyServerResponse = useCallback((response) => {
    const nextLinks = (response?.favorite_links || []).map(mapFavoriteFromServer).filter(Boolean)
    setFavoriteLinks(nextLinks)
    onServerFavoritesChange?.(response)
    return nextLinks
  }, [onServerFavoritesChange])

  const saveFavorites = useCallback(async (nextLinks) => {
    const sanitizedLinks = mergeUniqueFavorites(nextLinks)
    setFavoriteLinks(sanitizedLinks)

    const response = await saveHomeFavorites({
      links: sanitizedLinks.map(toServerFavoritePayload)
    })

    return applyServerResponse(response)
  }, [applyServerResponse])

  useEffect(() => {
    if (!Array.isArray(serverFavoriteLinks)) return
    const nextLinks = (serverFavoriteLinks || []).map(mapFavoriteFromServer).filter(Boolean)
    setFavoriteLinks(nextLinks)
  }, [serverFavoriteLinks])

  useEffect(() => {
    if (typeof window === 'undefined' || !favoriteStorageKey || loadingUser) return
    if (!Array.isArray(serverFavoriteLinks)) return
    if (favoriteLinks.length > 0) return
    if (migratedStorageKeysRef.current.has(favoriteStorageKey)) return

    const localFavorites = loadFavoriteLinks(favoriteStorageKey)
    if (localFavorites.length === 0) return

    migratedStorageKeysRef.current.add(favoriteStorageKey)
    saveFavorites(localFavorites)
      .then(() => {
        window.localStorage.removeItem(favoriteStorageKey)
      })
      .catch((error) => {
        console.warn('Failed to migrate home favorites to server storage', error)
      })
  }, [favoriteLinks.length, favoriteStorageKey, loadingUser, saveFavorites, serverFavoriteLinks])

  const isFavoriteLink = useCallback(
    (link) => favoriteLinks.some((favorite) => favorite.name === link.name && favorite.href === link.href),
    [favoriteLinks]
  )

  const addFavoriteLink = useCallback(async (link, sourceTitle = '') => {
    const favorite = sanitizeFavoriteLink({
      ...link,
      sourceTitle,
      id: link.id || createFavoriteId(link.name, link.href)
    })

    if (!favorite) return favoriteLinks

    const exists = favoriteLinks.some((item) => item.name === favorite.name && item.href === favorite.href)
    return exists ? favoriteLinks : saveFavorites([...favoriteLinks, favorite])
  }, [favoriteLinks, saveFavorites])

  const removeFavoriteLink = useCallback(async (link) => (
    saveFavorites(favoriteLinks.filter((item) => !(item.name === link.name && item.href === link.href)))
  ), [favoriteLinks, saveFavorites])

  const toggleFavoriteLink = useCallback(async (link, sourceTitle = '') => {
    const exists = favoriteLinks.some((favorite) => favorite.name === link.name && favorite.href === link.href)
    if (exists) {
      return saveFavorites(favoriteLinks.filter((item) => !(item.name === link.name && item.href === link.href)))
    }

    const favorite = sanitizeFavoriteLink({
      ...link,
      sourceTitle,
      id: link.id || createFavoriteId(link.name, link.href)
    })

    return favorite ? saveFavorites([...favoriteLinks, favorite]) : favoriteLinks
  }, [favoriteLinks, saveFavorites])

  return {
    favoriteLinks,
    setFavoriteLinks: saveFavorites,
    favoriteStorageKey,
    isFavoriteLink,
    addFavoriteLink,
    removeFavoriteLink,
    toggleFavoriteLink
  }
}
