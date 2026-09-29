import { useEffect, useMemo, useRef, useState } from 'react'
import { useHomeFavorites } from '../../features/home/hooks/useHomeFavorites'
import { useHomeLinks } from '../../features/home/hooks/useHomeLinks'
import { FAVORITES_GROUP_KEY, FAVORITES_GROUP_TITLE, HOME_LAYOUT_DENSITY_STORAGE_KEY } from '../../features/home/config/homeLinkGroups'
import { HOME_WIDGET_DEFINITION_MAP } from '../../features/home/config/homeWidgets'
import { getDefaultHomeWidgetSettings, parseHomeWidgetSettings, stringifyHomeWidgetSettings } from '../../features/home/lib/homeWidgetSettings'
import { createHomeGroup, createHomeLink, createHomeWidget, deleteHomeLink, deleteHomeWidget, reorderHomeFavorites, reorderHomeItems, updateHomeLink, updateHomeWidget } from '../../entities/home/api'
import { getUserScopedStorageKey, sanitizeFavoriteLink } from '../../shared/lib/storage'

const DEFAULT_HOME_WIDGET_TYPE = 'month_calendar'
const HOME_DROP_SWAP_CENTER_RATIO = 0.24

function createHomeWidgetDraft(widgetType = DEFAULT_HOME_WIDGET_TYPE) {
  const definition = HOME_WIDGET_DEFINITION_MAP[widgetType]

  return {
    widgetType,
    widthMode: definition?.widthMode || 'wide',
    settings: getDefaultHomeWidgetSettings(widgetType)
  }
}

function resolveHomeItemDropMode(event) {
  const rect = event?.currentTarget?.getBoundingClientRect?.()
  if (!rect) return 'swap'

  const width = Math.max(rect.width, 1)
  const height = Math.max(rect.height, 1)
  const relativeX = (event.clientX - rect.left) / width
  const relativeY = (event.clientY - rect.top) / height

  if (![relativeX, relativeY].every(Number.isFinite)) {
    return 'swap'
  }

  const isCenterX = relativeX > HOME_DROP_SWAP_CENTER_RATIO && relativeX < 1 - HOME_DROP_SWAP_CENTER_RATIO
  const isCenterY = relativeY > HOME_DROP_SWAP_CENTER_RATIO && relativeY < 1 - HOME_DROP_SWAP_CENTER_RATIO
  if (isCenterX && isCenterY) {
    return 'swap'
  }

  const nearestEdge = [
    { mode: 'before', distance: relativeY },
    { mode: 'after', distance: 1 - relativeY },
    { mode: 'before', distance: relativeX },
    { mode: 'after', distance: 1 - relativeX }
  ].sort((left, right) => left.distance - right.distance)[0]

  return nearestEdge?.mode || 'swap'
}

export function useHomeController({
  user,
  loadingUser,
  activeTab,
  activeHomeGroup,
  isHomeEditMode,
  searchQuery,
  homeGroups,
  homeWidgets,
  homeFavoriteLinks,
  homeFavoriteItemOrder,
  setHomeFavoriteLinks,
  setHomeFavoriteItemOrder,
  setHomeEditMode,
  setActiveHomeGroup,
  refreshHomeCatalog,
  enqueueUndoToast,
  getRequestErrorMessage
}) {
  const [showHomeEditor, setShowHomeEditor] = useState(false)
  const [homeLinkFormMode, setHomeLinkFormMode] = useState('favorite')
  const [editingHomeLinkId, setEditingHomeLinkId] = useState(null)
  const [homeLinkDraft, setHomeLinkDraft] = useState({ name: '', href: '', desc: '' })
  const [homeGroupDraft, setHomeGroupDraft] = useState({ title: '' })
  const [showHomeWidgetPicker, setShowHomeWidgetPicker] = useState(false)
  const [creatingHomeWidget, setCreatingHomeWidget] = useState(false)
  const [homeWidgetDraft, setHomeWidgetDraft] = useState(createHomeWidgetDraft())
  const [draggedHomeItemId, setDraggedHomeItemId] = useState(null)
  const [homeDropPreviewItemKey, setHomeDropPreviewItemKey] = useState('')
  const [homeDropPreviewMode, setHomeDropPreviewMode] = useState('')
  const [homeDropTargetGroupKey, setHomeDropTargetGroupKey] = useState('')
  const [homeDensityMode, setHomeDensityMode] = useState('comfortable')
  const [optimisticHomeOrder, setOptimisticHomeOrder] = useState(null)
  const transparentHomeDragImageRef = useRef(null)

  const { favoriteLinks, setFavoriteLinks, addFavoriteLink, isFavoriteLink, removeFavoriteLink, toggleFavoriteLink } = useHomeFavorites({
    user,
    loadingUser,
    serverFavoriteLinks: homeFavoriteLinks,
    onServerFavoritesChange: (response) => {
      setHomeFavoriteLinks(response?.favorite_links || [])
      setHomeFavoriteItemOrder(response?.favorite_item_order || [])
    }
  })

  const homeDensityStorageKey = useMemo(
    () => getUserScopedStorageKey(HOME_LAYOUT_DENSITY_STORAGE_KEY, user),
    [user]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !homeDensityStorageKey) return

    try {
      const savedDensity = window.localStorage.getItem(homeDensityStorageKey)
      setHomeDensityMode(savedDensity === 'compact' ? 'compact' : 'comfortable')
    } catch (error) {
      console.warn('Failed to load home density mode', error)
      setHomeDensityMode('comfortable')
    }
  }, [homeDensityStorageKey])

  useEffect(() => {
    if (typeof window === 'undefined' || !homeDensityStorageKey || loadingUser) return
    window.localStorage.setItem(homeDensityStorageKey, homeDensityMode === 'compact' ? 'compact' : 'comfortable')
  }, [homeDensityMode, homeDensityStorageKey, loadingUser])

  const baseHomeData = useHomeLinks({
    active: activeTab === 'home',
    activeHomeGroup,
    favoriteLinks,
    homeGroups,
    homeWidgets,
    favoriteItemOrder: homeFavoriteItemOrder,
    searchQuery,
    densityMode: homeDensityMode
  })

  const homeData = useMemo(() => {
    if (!optimisticHomeOrder || optimisticHomeOrder.groupKey !== baseHomeData.currentHomeGroup?.groupKey) {
      return baseHomeData
    }

    const itemByKey = new Map((baseHomeData.currentHomeItems || []).map((item) => [item.itemKey, item]))
    const orderedItems = optimisticHomeOrder.itemKeys
      .map((itemKey) => itemByKey.get(itemKey))
      .filter(Boolean)

    if (orderedItems.length !== (baseHomeData.currentHomeItems || []).length) {
      return baseHomeData
    }

    const orderedLinks = orderedItems.filter((item) => item.entryType === 'link')
    const orderedWidgets = orderedItems.filter((item) => item.entryType === 'widget')

    return {
      ...baseHomeData,
      currentHomeItems: orderedItems,
      currentHomeLinks: orderedLinks,
      currentHomeWidgets: orderedWidgets
    }
  }, [baseHomeData, optimisticHomeOrder])

  useEffect(() => {
    setOptimisticHomeOrder(null)
  }, [activeHomeGroup, searchQuery])

  const saveFavoriteItemOrder = async (items) => {
    const nextOrder = items.map((item) => item.itemKey)
    setOptimisticHomeOrder({
      groupKey: homeData.currentHomeGroup?.groupKey || FAVORITES_GROUP_KEY,
      itemKeys: nextOrder
    })
    setHomeFavoriteItemOrder(nextOrder)
    await reorderHomeFavorites({
      group_id: 0,
      items: items.map((item) => ({
        entry_type: item.entryType,
        id: Number(item.id)
      })).filter((item) => Number.isFinite(item.id) && item.id > 0)
    })
    await refreshHomeCatalog()
    setOptimisticHomeOrder(null)
  }

  const resetHomeEditor = () => {
    setHomeLinkDraft({ name: '', href: '', desc: '' })
    setHomeGroupDraft({ title: '' })
    setShowHomeEditor(false)
    setHomeLinkFormMode('favorite')
    setEditingHomeLinkId(null)
  }

  const resetHomeWidgetPicker = () => {
    setHomeWidgetDraft(createHomeWidgetDraft())
    setShowHomeWidgetPicker(false)
    setCreatingHomeWidget(false)
  }

  useEffect(() => {
    if (isHomeEditMode) {
      return
    }

    resetHomeEditor()
    resetHomeWidgetPicker()
  }, [isHomeEditMode])

  useEffect(() => {
    if (activeTab !== 'home') return
    if (!homeData.filteredHomeGroups.length) return
    const activeGroup = homeData.filteredHomeGroups.find((group) => group.groupKey === activeHomeGroup)
    const preferredGroup = homeData.filteredHomeGroups.find((group) => group.groupKey !== FAVORITES_GROUP_KEY && group.links.length > 0)
      || homeData.filteredHomeGroups[0]

    if (!activeGroup) {
      setActiveHomeGroup(preferredGroup.groupKey)
      return
    }

    if (searchQuery && activeGroup.groupKey === FAVORITES_GROUP_KEY && activeGroup.links.length === 0 && preferredGroup) {
      setActiveHomeGroup(preferredGroup.groupKey)
    }
  }, [activeTab, activeHomeGroup, homeData.filteredHomeGroups, searchQuery, setActiveHomeGroup])

  const handleHomeLinkDraftChange = (field, value) => {
    setHomeLinkDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleHomeGroupDraftChange = (value) => {
    setHomeGroupDraft({ title: value })
  }

  const handleEditHomeLink = (link) => {
    resetHomeWidgetPicker()
    setHomeLinkDraft({
      name: link.name || '',
      href: link.href || '',
      desc: link.desc || ''
    })
    setHomeLinkFormMode('edit-link')
    setEditingHomeLinkId(link.id || null)
    setShowHomeEditor(true)
    setHomeEditMode(true)
  }

  const openFavoriteEditor = () => {
    resetHomeWidgetPicker()
    setHomeLinkDraft({ name: '', href: '', desc: '' })
    setHomeGroupDraft({ title: '' })
    setHomeLinkFormMode('favorite')
    setEditingHomeLinkId(null)
    setShowHomeEditor(true)
    setHomeEditMode(true)
  }

  const openHomeWidgetCreate = () => {
    if (!homeData.currentHomeGroup && !homeData.isFavoritesGroup) return
    resetHomeEditor()
    setHomeWidgetDraft(createHomeWidgetDraft())
    setShowHomeWidgetPicker(true)
    setHomeEditMode(true)
  }

  const openHomeLinkCreate = () => {
    if (!homeData.currentHomeGroup || homeData.isFavoritesGroup) return
    resetHomeWidgetPicker()
    setHomeLinkDraft({ name: '', href: '', desc: '' })
    setHomeGroupDraft({ title: '' })
    setHomeLinkFormMode('create-link')
    setEditingHomeLinkId(null)
    setShowHomeEditor(true)
    setHomeEditMode(true)
  }

  const openHomeGroupCreate = () => {
    resetHomeWidgetPicker()
    setHomeGroupDraft({ title: '' })
    setHomeLinkDraft({ name: '', href: '', desc: '' })
    setHomeLinkFormMode('create-group')
    setEditingHomeLinkId(null)
    setShowHomeEditor(true)
    setHomeEditMode(true)
  }

  const resolveHomeGroupParentId = () => {
    const currentGroup = homeData.currentHomeGroup
    if (!currentGroup || homeData.isFavoritesGroup) return null
    return currentGroup.parentId || currentGroup.id
  }

  const homeGroupContextLabel = homeData.isFavoritesGroup
    ? 'Будет создана как верхняя группа'
    : homeData.currentHomeGroup?.parentTitle
      ? `Будет добавлена в раздел «${homeData.currentHomeGroup.parentTitle}»`
      : homeData.currentHomeGroup
        ? `Будет добавлена внутри «${homeData.currentHomeGroup.title}»`
        : 'Будет создана как верхняя группа'

  const homeWidgetContextLabel = homeData.isFavoritesGroup
    ? 'Виджет появится в разделе «Домашняя» и будет виден только вам.'
    : homeData.currentHomeGroup
      ? `Виджет появится внутри раздела «${homeData.currentHomeGroup.title}» и смешается с обычными карточками.`
      : 'Виджет будет добавлен на домашнюю страницу.'

  const handleHomeEditorSubmit = async (event) => {
    event.preventDefault()

    try {
      if (homeLinkFormMode === 'create-group') {
        const response = await createHomeGroup({
          title: homeGroupDraft.title,
          parent_id: resolveHomeGroupParentId()
        })

        if (!response.ok) {
          throw new Error(await getRequestErrorMessage(response, {
            fallback: 'Не удалось создать подгруппу',
            conflict: 'Такая группа уже существует в выбранном разделе.'
          }))
        }

        const createdGroup = await response.json()
        await refreshHomeCatalog()
        setActiveHomeGroup(String(createdGroup.id))
        resetHomeEditor()
        return
      }

      if (homeLinkFormMode === 'favorite') {
        const favorite = sanitizeFavoriteLink({
          id: `custom::${Date.now()}`,
          name: homeLinkDraft.name,
          href: homeLinkDraft.href,
          desc: homeLinkDraft.desc,
          sourceTitle: FAVORITES_GROUP_TITLE,
          isCustom: true
        })

        if (!favorite) {
          alert('Заполните название и ссылку для избранного.')
          return
        }

        await setFavoriteLinks([...favoriteLinks, favorite])
        resetHomeEditor()
        setActiveHomeGroup(FAVORITES_GROUP_KEY)
        return
      }

      if (!homeData.currentHomeGroup?.id) {
        alert('Сначала выберите группу для ссылки.')
        return
      }

      const payload = {
        group_id: homeData.currentHomeGroup.id,
        name: homeLinkDraft.name,
        href: homeLinkDraft.href,
        description: homeLinkDraft.desc
      }

      if (homeLinkFormMode === 'edit-link' && editingHomeLinkId) {
        const response = await updateHomeLink(editingHomeLinkId, payload)
        if (!response.ok) {
          throw new Error(await getRequestErrorMessage(response, {
            fallback: 'Не удалось обновить ссылку',
            notFound: 'Ссылка уже удалена или не найдена.',
            conflict: 'Не удалось сохранить ссылку из-за конфликта данных.'
          }))
        }

        await refreshHomeCatalog()
        resetHomeEditor()
        return
      }

      const response = await createHomeLink(payload)
      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось создать ссылку',
          conflict: 'Не удалось создать ссылку из-за конфликта данных.'
        }))
      }

      await refreshHomeCatalog()
      resetHomeEditor()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось сохранить изменения на главной странице')
    }
  }

  const handleDeleteHomeLink = async () => {
    if (homeLinkFormMode !== 'edit-link' || !editingHomeLinkId) return
    if (!window.confirm('Удалить эту ссылку из текущей группы?')) return

    try {
      const currentLink = (homeData.currentHomeLinks || []).find((item) => item.id === editingHomeLinkId)
      const response = await deleteHomeLink(editingHomeLinkId)
      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось удалить ссылку',
          notFound: 'Ссылка уже удалена или не найдена.'
        }))
      }

      await refreshHomeCatalog()
      resetHomeEditor()

      if (currentLink?.group_id) {
        enqueueUndoToast({
          title: 'Ссылка удалена',
          message: `«${currentLink.name}» можно быстро вернуть на Home.`,
          onUndo: async () => {
            const restoreResponse = await createHomeLink({
              group_id: currentLink.group_id,
              name: currentLink.name,
              href: currentLink.href,
              description: currentLink.desc || ''
            })

            if (!restoreResponse.ok) {
              throw new Error(await getRequestErrorMessage(restoreResponse, {
                fallback: 'Не удалось вернуть ссылку',
                conflict: 'Не удалось вернуть ссылку из-за конфликта данных.'
              }))
            }

            await refreshHomeCatalog()
          }
        })
      }
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось удалить ссылку')
    }
  }

  const handleHomeWidgetDraftChange = (patch) => {
    setHomeWidgetDraft((current) => {
      if (patch.widgetType) {
        const definition = HOME_WIDGET_DEFINITION_MAP[patch.widgetType]
        return {
          ...current,
          ...patch,
          widthMode: patch.widthMode || definition?.widthMode || current.widthMode || 'wide',
          settings: getDefaultHomeWidgetSettings(patch.widgetType)
        }
      }

      if (patch.widthMode) {
        const definition = HOME_WIDGET_DEFINITION_MAP[current.widgetType]
        const allowedWidthModes = definition?.widthOptions || []
        if (allowedWidthModes.length > 0 && !allowedWidthModes.includes(patch.widthMode)) {
          return current
        }
      }

      return { ...current, ...patch }
    })
  }

  const handleCreateHomeWidget = async (event) => {
    event.preventDefault()

    try {
      setCreatingHomeWidget(true)
      await createHomeWidget({
        scope_key: homeData.isFavoritesGroup ? 'favorites' : 'group',
        group_id: homeData.isFavoritesGroup ? null : homeData.currentHomeGroup?.id ?? null,
        widget_type: homeWidgetDraft.widgetType,
        width_mode: homeWidgetDraft.widthMode,
        settings_json: stringifyHomeWidgetSettings(homeWidgetDraft.widgetType, homeWidgetDraft.settings)
      })
      await refreshHomeCatalog()
      resetHomeWidgetPicker()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось добавить виджет')
      setCreatingHomeWidget(false)
    }
  }

  const handleUpdateHomeWidget = async (widget, patch) => {
    if (!widget?.id) return

    try {
      await updateHomeWidget(widget.id, patch)
      await refreshHomeCatalog()

      if (widget.widget_type === 'favorite_contacts' && typeof patch.settings_json === 'string') {
        const previousSettings = parseHomeWidgetSettings(widget)
        const nextSettings = parseHomeWidgetSettings({
          ...widget,
          settings_json: patch.settings_json
        })

        if ((previousSettings.contacts || []).length > 0 && (nextSettings.contacts || []).length === 0) {
          enqueueUndoToast({
            title: 'Лента очищена',
            message: 'Избранных сотрудников можно вернуть одним кликом.',
            onUndo: async () => {
              await updateHomeWidget(widget.id, {
                settings_json: widget.settings_json || stringifyHomeWidgetSettings(widget.widget_type, previousSettings)
              })
              await refreshHomeCatalog()
            }
          })
        }
      }
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось обновить виджет')
    }
  }

  const handleDeleteHomeWidget = async (widget) => {
    if (!widget?.id) return
    if (!window.confirm(`Удалить виджет «${widget.title || 'без названия'}»?`)) return

    try {
      const restorePayload = {
        scope_key: widget.scope_key,
        group_id: widget.group_id ?? null,
        widget_type: widget.widget_type,
        title: widget.title,
        width_mode: widget.width_mode,
        settings_json: widget.settings_json || null
      }

      await deleteHomeWidget(widget.id)
      await refreshHomeCatalog()

      enqueueUndoToast({
        title: 'Виджет удалён',
        message: `«${widget.title || 'Виджет'}» можно вернуть на главную.`,
        onUndo: async () => {
          await createHomeWidget(restorePayload)
          await refreshHomeCatalog()
        }
      })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось удалить виджет')
    }
  }

  const clearHomeDragState = () => {
    setDraggedHomeItemId(null)
    setHomeDropPreviewItemKey('')
    setHomeDropPreviewMode('')
    setHomeDropTargetGroupKey('')
  }

  const handleHomeItemDragStart = (event, itemKey) => {
    if (!transparentHomeDragImageRef.current) {
      const img = new Image()
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
      transparentHomeDragImageRef.current = img
    }

    setDraggedHomeItemId(itemKey)
    setHomeDropPreviewItemKey('')
    setHomeDropPreviewMode('')
    setHomeDropTargetGroupKey('')
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', itemKey)
    event.dataTransfer.setDragImage(transparentHomeDragImageRef.current, 0, 0)
  }

  const handleHomeItemDrag = () => {}

  const handleHomeItemDragOver = (event, targetItemKey) => {
    if (!draggedHomeItemId || draggedHomeItemId === targetItemKey) return
    event.preventDefault()
    const nextPreviewMode = resolveHomeItemDropMode(event)
    if (
      homeDropTargetGroupKey === ''
      && homeDropPreviewItemKey === targetItemKey
      && homeDropPreviewMode === nextPreviewMode
    ) {
      return
    }
    setHomeDropTargetGroupKey('')
    setHomeDropPreviewItemKey(targetItemKey)
    setHomeDropPreviewMode(nextPreviewMode)
  }

  const handleHomeItemDrop = async (event, targetItemKey) => {
    event.preventDefault()
    const sourceItemKey = draggedHomeItemId || event.dataTransfer.getData('text/plain')
    if (!sourceItemKey || !targetItemKey || sourceItemKey === targetItemKey) {
      clearHomeDragState()
      return
    }

    const currentItems = homeData.currentHomeItems || []
    const sourceIndex = currentItems.findIndex((item) => item.itemKey === sourceItemKey)
    const targetIndex = currentItems.findIndex((item) => item.itemKey === targetItemKey)
    if (sourceIndex === -1 || targetIndex === -1) {
      clearHomeDragState()
      return
    }

    const dropMode = resolveHomeItemDropMode(event)
    const nextItems = [...currentItems]
    if (dropMode === 'swap') {
      const sourceItem = nextItems[sourceIndex]
      nextItems[sourceIndex] = nextItems[targetIndex]
      nextItems[targetIndex] = sourceItem
    } else {
      const [movedItem] = nextItems.splice(sourceIndex, 1)
      let insertIndex = targetIndex + (dropMode === 'after' ? 1 : 0)
      if (sourceIndex < insertIndex) {
        insertIndex -= 1
      }
      nextItems.splice(insertIndex, 0, movedItem)
    }

    try {
      if (homeData.isFavoritesGroup) {
        await saveFavoriteItemOrder(nextItems)
      } else if (homeData.currentHomeGroup?.id) {
        setOptimisticHomeOrder({
          groupKey: homeData.currentHomeGroup.groupKey,
          itemKeys: nextItems.map((item) => item.itemKey)
        })
        await reorderHomeItems({
          group_id: homeData.currentHomeGroup.id,
          items: nextItems.map((item) => ({
            entry_type: item.entryType,
            id: item.id
          }))
        })
        await refreshHomeCatalog()
        setOptimisticHomeOrder(null)
      }
    } catch (error) {
      setOptimisticHomeOrder(null)
      console.error(error)
      alert(error.message || 'Не удалось переставить элементы')
    } finally {
      clearHomeDragState()
    }
  }

  const handleHomeItemDragEnd = () => {
    clearHomeDragState()
  }

  const handleHomeGroupDragOver = (event, groupKey) => {
    if (!draggedHomeItemId) return
    event.preventDefault()
    if (homeDropTargetGroupKey === groupKey && !homeDropPreviewItemKey && !homeDropPreviewMode) return
    setHomeDropPreviewItemKey('')
    setHomeDropPreviewMode('')
    setHomeDropTargetGroupKey(groupKey)
  }

  const handleHomeGroupDragLeave = (event, groupKey) => {
    if (!draggedHomeItemId) return
    if (event.currentTarget.contains(event.relatedTarget)) return
    setHomeDropTargetGroupKey((current) => (current === groupKey ? '' : current))
  }

  const handleHomeGroupDrop = async (event, targetGroupKey) => {
    event.preventDefault()

    const sourceItemKey = draggedHomeItemId || event.dataTransfer.getData('text/plain')
    const sourceItem = (homeData.currentHomeItems || []).find((item) => item.itemKey === sourceItemKey)
    const targetGroup = (homeData.filteredHomeGroups || []).find((group) => group.groupKey === targetGroupKey)

    if (!sourceItem || !targetGroup) {
      clearHomeDragState()
      return
    }

    const sourceGroupKey = homeData.currentHomeGroup?.groupKey || ''
    const sourceGroupTitle = homeData.currentHomeGroup?.title || FAVORITES_GROUP_TITLE
    const targetGroupTitle = targetGroup.title || FAVORITES_GROUP_TITLE
    if (sourceGroupKey === targetGroupKey) {
      clearHomeDragState()
      return
    }

    try {
      if (sourceItem.entryType === 'widget') {
        const nextScopeKey = targetGroup.groupKey === FAVORITES_GROUP_KEY ? 'favorites' : 'group'
        const nextGroupId = nextScopeKey === 'favorites' ? null : targetGroup.id
        const previousScopeKey = sourceItem.scope_key
        const previousGroupId = sourceItem.group_id ?? null

        await updateHomeWidget(sourceItem.id, {
          scope_key: nextScopeKey,
          group_id: nextGroupId
        })

        await refreshHomeCatalog()
        setActiveHomeGroup(targetGroup.groupKey)

        enqueueUndoToast({
          title: 'Виджет перенесён',
          message: `«${sourceItem.title || 'Виджет'}» перемещён: ${sourceGroupTitle} -> ${targetGroupTitle}.`,
          onUndo: async () => {
            await updateHomeWidget(sourceItem.id, {
              scope_key: previousScopeKey,
              group_id: previousGroupId
            })

            await refreshHomeCatalog()
            setActiveHomeGroup(sourceGroupKey || FAVORITES_GROUP_KEY)
          }
        })
        return
      }

      if (sourceGroupKey === FAVORITES_GROUP_KEY) {
        if (!targetGroup.id) {
          clearHomeDragState()
          return
        }

        const response = await createHomeLink({
          group_id: targetGroup.id,
          name: sourceItem.name,
          href: sourceItem.href,
          description: sourceItem.desc || ''
        })

        if (!response.ok) {
          throw new Error(await getRequestErrorMessage(response, {
            fallback: 'Не удалось переместить ссылку в выбранную группу',
            conflict: 'Не удалось добавить ссылку в выбранную группу из-за конфликта данных.'
          }))
        }

        const createdLink = await response.json().catch(() => null)

        await removeFavoriteLink(sourceItem)
        await refreshHomeCatalog()
        setActiveHomeGroup(targetGroup.groupKey)

        enqueueUndoToast({
          title: 'Ссылка перенесена',
          message: `«${sourceItem.name}» ушла из «Домашней» в «${targetGroupTitle}».`,
          onUndo: async () => {
            if (createdLink?.id) {
              const deleteResponse = await deleteHomeLink(createdLink.id)
              if (!deleteResponse.ok) {
                throw new Error(await getRequestErrorMessage(deleteResponse, {
                  fallback: 'Не удалось вернуть ссылку в Домашнюю',
                  notFound: 'Серверная копия ссылки уже удалена.'
                }))
              }
            }

            await addFavoriteLink(sourceItem, sourceItem.sourceTitle || FAVORITES_GROUP_TITLE)
            await refreshHomeCatalog()
            setActiveHomeGroup(FAVORITES_GROUP_KEY)
          }
        })
        return
      }

      if (targetGroup.groupKey === FAVORITES_GROUP_KEY) {
        await addFavoriteLink(sourceItem, homeData.currentHomeGroup?.title || '')
        await refreshHomeCatalog()
        setActiveHomeGroup(FAVORITES_GROUP_KEY)

        enqueueUndoToast({
          title: 'Ссылка закреплена',
          message: `«${sourceItem.name}» добавлена в «Домашнюю».`,
          onUndo: async () => {
            await removeFavoriteLink(sourceItem)
            await refreshHomeCatalog()
            setActiveHomeGroup(sourceGroupKey)
          }
        })
        return
      }

      if (!targetGroup.id) {
        clearHomeDragState()
        return
      }

      const response = await updateHomeLink(sourceItem.id, {
        group_id: targetGroup.id,
        name: sourceItem.name,
        href: sourceItem.href,
        description: sourceItem.desc || ''
      })

      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось переместить ссылку в выбранную группу',
          notFound: 'Ссылка уже удалена или не найдена.',
          conflict: 'Не удалось переместить ссылку из-за конфликта данных.'
        }))
      }

      await refreshHomeCatalog()
      setActiveHomeGroup(targetGroup.groupKey)

      enqueueUndoToast({
        title: 'Ссылка перенесена',
        message: `«${sourceItem.name}» перемещена: ${sourceGroupTitle} -> ${targetGroupTitle}.`,
        onUndo: async () => {
          const restoreResponse = await updateHomeLink(sourceItem.id, {
            group_id: sourceItem.group_id,
            name: sourceItem.name,
            href: sourceItem.href,
            description: sourceItem.desc || ''
          })

          if (!restoreResponse.ok) {
            throw new Error(await getRequestErrorMessage(restoreResponse, {
              fallback: 'Не удалось вернуть ссылку в исходную группу',
              notFound: 'Исходная ссылка уже удалена или не найдена.',
              conflict: 'Не удалось вернуть ссылку из-за конфликта данных.'
            }))
          }

          await refreshHomeCatalog()
          setActiveHomeGroup(sourceGroupKey)
        }
      })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось переместить элемент на домашней странице')
    } finally {
      clearHomeDragState()
    }
  }

  return {
    favoriteLinks,
    favoriteHomeItemOrder: homeFavoriteItemOrder,
    homeData,
    showHomeEditor,
    homeLinkFormMode,
    editingHomeLinkId,
    homeLinkDraft,
    homeGroupDraft,
    showHomeWidgetPicker,
    creatingHomeWidget,
    homeWidgetDraft,
    draggedHomeItemId,
    homeDropPreviewItemKey,
    homeDropPreviewMode,
    homeDropTargetGroupKey,
    homeDensityMode,
    homeGroupContextLabel,
    homeWidgetContextLabel,
    isFavoriteLink,
    removeFavoriteLink,
    toggleFavoriteLink,
    setHomeDensityMode,
    resetHomeEditor,
    resetHomeWidgetPicker,
    handleHomeLinkDraftChange,
    handleHomeGroupDraftChange,
    handleEditHomeLink,
    openFavoriteEditor,
    openHomeWidgetCreate,
    openHomeLinkCreate,
    openHomeGroupCreate,
    handleHomeEditorSubmit,
    handleDeleteHomeLink,
    handleHomeWidgetDraftChange,
    handleCreateHomeWidget,
    handleUpdateHomeWidget,
    handleDeleteHomeWidget,
    handleHomeItemDragStart,
    handleHomeItemDrag,
    handleHomeItemDragOver,
    handleHomeItemDrop,
    handleHomeItemDragEnd,
    handleHomeGroupDragOver,
    handleHomeGroupDragLeave,
    handleHomeGroupDrop
  }
}
