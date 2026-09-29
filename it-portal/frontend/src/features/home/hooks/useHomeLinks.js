import { useMemo } from 'react'
import { generateSearchVariations, matchSearchValues } from '../../../shared/lib/search'
import { FAVORITES_GROUP_KEY, FAVORITES_GROUP_TITLE } from '../config/homeLinkGroups'
import { homeGroupIcons } from '../config/homeGroupIcons'
import { HOME_WIDGET_DEFINITION_MAP } from '../config/homeWidgets'

const matchesHomeLinkQuery = (link, query) => {
  if (!query) return true
  const vars = generateSearchVariations(query)
  const target = `${link.name} ${link.desc || ''} ${link.href}`.toLowerCase()
  return vars.some((value) => target.includes(value))
}

const groupMatchesQuery = (group, query) => matchSearchValues([
  group.title,
  group.parentTitle,
  group.fullTitle
], query)

const matchesHomeWidgetQuery = (widget, query) => {
  if (!query) return true
  const definition = HOME_WIDGET_DEFINITION_MAP[widget.widget_type]
  return matchSearchValues([
    widget.title,
    definition?.title,
    definition?.description,
    widget.widget_type,
    widget.scope_key
  ], query)
}

const getHomeItemKey = (item) => `${item.entryType}:${item.id}`

const flattenHomeGroups = (groups, meta = { parentTitle: '', fullTitle: '', depth: 0, iconKey: '' }) => (
  groups.flatMap((group) => {
    const fullTitle = meta.fullTitle ? `${meta.fullTitle} / ${group.title}` : group.title
    const iconKey = meta.iconKey || group.title

    const normalizedGroup = {
      id: group.id,
      groupKey: String(group.id),
      title: group.title,
      parentId: group.parent_id ?? null,
      parentTitle: meta.parentTitle,
      fullTitle,
      depth: meta.depth,
      iconKey,
      links: (group.links || []).map((link) => ({
        id: link.id,
        groupId: link.group_id ?? group.id,
        name: link.name,
        href: link.href,
        desc: link.description || '',
        sourceTitle: fullTitle,
        isBaseLink: true
      }))
    }

    return [
      normalizedGroup,
      ...flattenHomeGroups(group.children || [], {
        parentTitle: group.title,
        fullTitle,
        depth: meta.depth + 1,
        iconKey
      })
    ]
  })
)

export const useHomeLinks = ({ active = true, activeHomeGroup, favoriteLinks, homeGroups, homeWidgets, favoriteItemOrder, searchQuery, densityMode }) => {
  const filteredFavoriteLinks = useMemo(
    () => (active ? favoriteLinks.filter((link) => matchesHomeLinkQuery(link, searchQuery)) : []),
    [active, favoriteLinks, searchQuery]
  )

  const flattenedHomeGroups = useMemo(
    () => (active ? flattenHomeGroups(homeGroups) : []),
    [active, homeGroups]
  )

  const filteredHomeWidgets = useMemo(
    () => (active ? (homeWidgets || []).filter((widget) => matchesHomeWidgetQuery(widget, searchQuery)) : []),
    [active, homeWidgets, searchQuery]
  )

  const filteredDbGroups = useMemo(
    () => flattenedHomeGroups
      .map((group) => {
        if (!searchQuery) return group

        const hasGroupMatch = groupMatchesQuery(group, searchQuery)
        const filteredLinks = hasGroupMatch
          ? group.links
          : group.links.filter((link) => matchesHomeLinkQuery(link, searchQuery))

        return {
          ...group,
          links: filteredLinks
        }
      })
      .filter((group) => (
        !searchQuery
          || groupMatchesQuery(group, searchQuery)
          || group.links.length > 0
          || filteredHomeWidgets.some((widget) => widget.scope_key === 'group' && widget.group_id === group.id)
      )),
    [filteredHomeWidgets, flattenedHomeGroups, searchQuery]
  )

  const filteredHomeGroups = useMemo(() => {
    const favoriteWidgetCount = filteredHomeWidgets.filter((widget) => widget.scope_key === 'favorites').length

    return [
      {
        groupKey: FAVORITES_GROUP_KEY,
        title: FAVORITES_GROUP_TITLE,
        fullTitle: FAVORITES_GROUP_TITLE,
        parentTitle: '',
        depth: 0,
        iconKey: FAVORITES_GROUP_TITLE,
        links: filteredFavoriteLinks,
        widgetCount: favoriteWidgetCount,
        totalCount: filteredFavoriteLinks.length + favoriteWidgetCount,
        isFavorites: true
      },
      ...filteredDbGroups.map((group) => {
        const widgetCount = filteredHomeWidgets.filter((widget) => widget.scope_key === 'group' && widget.group_id === group.id).length
        return {
          ...group,
          widgetCount,
          totalCount: group.links.length + widgetCount
        }
      })
    ]
  }, [filteredDbGroups, filteredFavoriteLinks, filteredHomeWidgets])

  const filteredHomeGroupTitles = useMemo(
    () => filteredHomeGroups.map((group) => group.groupKey).join('|'),
    [filteredHomeGroups]
  )

  const classicHomeGroups = useMemo(
    () => filteredHomeGroups
      .filter((group) => group.groupKey !== FAVORITES_GROUP_KEY || group.links.length > 0)
      .filter((group) => group.links.length > 0)
      .slice()
      .sort((a, b) => {
        if (a.groupKey === FAVORITES_GROUP_KEY) return -1
        if (b.groupKey === FAVORITES_GROUP_KEY) return 1
        if (a.depth !== b.depth) return a.depth - b.depth
        return b.links.length - a.links.length
      }),
    [filteredHomeGroups]
  )

  const currentHomeGroup = useMemo(
    () => filteredHomeGroups.find((group) => group.groupKey === activeHomeGroup) || filteredHomeGroups[0] || null,
    [activeHomeGroup, filteredHomeGroups]
  )

  const currentHomeLinks = currentHomeGroup?.links ?? []
  const currentHomeWidgets = useMemo(() => {
    if (!currentHomeGroup) return []

    return filteredHomeWidgets.filter((widget) => {
      if (widget.scope_key === 'favorites') {
        return currentHomeGroup.groupKey === FAVORITES_GROUP_KEY
      }

      return currentHomeGroup.id && widget.group_id === currentHomeGroup.id
    })
  }, [currentHomeGroup, filteredHomeWidgets])
  const currentHomeItems = useMemo(() => {
    const linkItems = currentHomeLinks.map((link, index) => ({
      ...link,
      entryType: 'link',
      sortOrder: link.sort_order ?? (index + 1) * 10,
      itemKey: getHomeItemKey({ entryType: 'link', id: link.id })
    }))
    const widgetItems = currentHomeWidgets.map((widget, index) => ({
      ...widget,
      entryType: 'widget',
      sortOrder: widget.sort_order ?? (index + 1) * 10,
      itemKey: getHomeItemKey({ entryType: 'widget', id: widget.id })
    }))

    if (currentHomeGroup?.groupKey === FAVORITES_GROUP_KEY) {
      const orderMap = new Map((favoriteItemOrder || []).map((itemKey, index) => [itemKey, index]))
      return [...linkItems, ...widgetItems]
        .slice()
        .sort((left, right) => {
          const leftOrder = orderMap.has(left.itemKey) ? orderMap.get(left.itemKey) : Number.MAX_SAFE_INTEGER
          const rightOrder = orderMap.has(right.itemKey) ? orderMap.get(right.itemKey) : Number.MAX_SAFE_INTEGER
          if (leftOrder !== rightOrder) return leftOrder - rightOrder
          return (left.sortOrder || 0) - (right.sortOrder || 0)
        })
    }

    return [...linkItems, ...widgetItems]
      .slice()
      .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
  }, [currentHomeGroup?.groupKey, currentHomeLinks, currentHomeWidgets, favoriteItemOrder])
  const CurrentHomeIcon = currentHomeGroup ? (homeGroupIcons[currentHomeGroup.iconKey || currentHomeGroup.title] || homeGroupIcons['Другое']) : homeGroupIcons['Другое']
  const isFavoritesGroup = currentHomeGroup?.groupKey === FAVORITES_GROUP_KEY
  const homeDensityClass =
    currentHomeItems.length >= 12 ? 'is-ultra-dense'
      : currentHomeItems.length >= 8 ? 'is-dense'
        : currentHomeItems.length >= 5 ? 'is-compact'
          : ''
  const homeScaleClass = densityMode === 'compact' ? 'is-grid-compact' : 'is-grid-comfortable'

  return {
    filteredFavoriteLinks,
    filteredHomeGroups,
    filteredHomeGroupTitles,
    classicHomeGroups,
    currentHomeGroup,
    currentHomeLinks,
    currentHomeWidgets,
    currentHomeItems,
    CurrentHomeIcon,
    isFavoritesGroup,
    homeDensityClass,
    homeScaleClass
  }
}
