import { useEffect, useRef, useState } from 'react'
import { fetchRuntimeInfo } from '../../features/auth/lib/session'
import { playNotificationSound } from '../../features/notifications/lib/playNotificationSound'
import {
  DEFAULT_NOTIFICATION_OVERVIEW,
  fetchNotificationsOverview,
  markAllNotificationsRead,
  markNotificationRead,
  snoozeNotification,
  updateNotificationPreferences,
  updateNotificationRule
} from '../../entities/notifications/api'
import {
  createVacationPeriod,
  DEFAULT_VACATIONS_OVERVIEW,
  deleteVacationPeriod,
  exportVacationScheduleDocx,
  fetchMyVacations,
  importVacationScheduleDocx,
  updateVacationPeriod
} from '../../entities/vacations/api'

function getLocalFrontendEntryPath() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return ''
  }

  const moduleScript = document.querySelector('script[type="module"][src]')
  if (moduleScript) {
    const source = moduleScript.getAttribute('src') || ''

    try {
      return new URL(source, window.location.origin).pathname
    } catch {
      if (source) return source
    }
  }

  try {
    return new URL(import.meta.url, window.location.origin).pathname
  } catch {
    return ''
  }
}

async function fetchServerFrontendEntryPath() {
  const response = await fetch('/', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to fetch frontend entrypoint')
  }

  const html = await response.text()
  const match = html.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/i)
  if (!match?.[1]) {
    throw new Error('Failed to resolve frontend entrypoint from index.html')
  }

  return new URL(match[1], window.location.origin).pathname
}

export function useNotificationsVacationsController({
  user,
  setGlobalSearchQuery,
  setSearchQuery,
  switchTab,
  setShowHistoryModal
}) {
  const portalWideEnabled = Array.isArray(user?.permissions) && user.permissions.includes('portal.full')
  const [notificationsOverview, setNotificationsOverview] = useState(DEFAULT_NOTIFICATION_OVERVIEW)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [savingNotificationPreferences, setSavingNotificationPreferences] = useState(false)
  const [savingNotificationRuleKind, setSavingNotificationRuleKind] = useState('')
  const [toastNotifications, setToastNotifications] = useState([])
  const [systemToasts, setSystemToasts] = useState([])
  const [vacationsOverview, setVacationsOverview] = useState(DEFAULT_VACATIONS_OVERVIEW)
  const [loadingVacations, setLoadingVacations] = useState(false)
  const [savingVacation, setSavingVacation] = useState(false)
  const [deletingVacationId, setDeletingVacationId] = useState(null)
  const [importingVacationSchedule, setImportingVacationSchedule] = useState(false)
  const [exportingVacationSchedule, setExportingVacationSchedule] = useState(false)

  const notificationsReadyRef = useRef(false)
  const seenNotificationToastKeysRef = useRef(new Set())
  const shownSystemToastKeysRef = useRef(new Set())
  const backendRuntimeInstanceIdRef = useRef(null)
  const localFrontendEntryPathRef = useRef(getLocalFrontendEntryPath())

  const applyNotificationsOverview = async (data, { announce }) => {
    setNotificationsOverview(data)

    const toastEligible = (data.notifications || [])
      .filter((item) => item.is_active && !item.is_read)

    const activeToastIds = new Set(toastEligible.map((item) => item.notification_id))

    setToastNotifications((prev) => prev.filter((item) => activeToastIds.has(item.notification_id)))

    const currentToastKeys = toastEligible
      .map((item) => `${item.notification_id}:${item.updated_at || item.created_at}`)

    if (!notificationsReadyRef.current) {
      notificationsReadyRef.current = true
      currentToastKeys.forEach((key) => seenNotificationToastKeysRef.current.add(key))
      return
    }

    if (!announce || !data.preferences?.toast_enabled) {
      return
    }

    const freshToasts = toastEligible
      .filter((item) => {
        const toastKey = `${item.notification_id}:${item.updated_at || item.created_at}`
        return !seenNotificationToastKeysRef.current.has(toastKey)
      })
      .slice(0, 3)

    if (!freshToasts.length) return

    freshToasts.forEach((item) => {
      seenNotificationToastKeysRef.current.add(`${item.notification_id}:${item.updated_at || item.created_at}`)
    })

    setToastNotifications((prev) => {
      const merged = prev.filter((item) => activeToastIds.has(item.notification_id))
      freshToasts.forEach((item) => {
        if (!merged.some((entry) => entry.notification_id === item.notification_id)) {
          merged.push(item)
        }
      })
      return merged.slice(-4)
    })

    if (freshToasts.length > 0 && data.preferences?.sound_enabled) {
      await playNotificationSound({
        preset: data.preferences.toast_sound,
        volume: data.preferences.sound_volume
      })
    }
  }

  async function refreshNotifications({ announce = false, silent = false, force = false } = {}) {
    if (!user || !portalWideEnabled) return

    if (!silent) {
      setLoadingNotifications(true)
    }

    try {
      const data = await fetchNotificationsOverview({ force })
      await applyNotificationsOverview(data, { announce })
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    } finally {
      if (!silent) {
        setLoadingNotifications(false)
      }
    }
  }

  const refreshVacations = async ({ silent = false } = {}) => {
    if (!user || !portalWideEnabled) return

    if (!silent) {
      setLoadingVacations(true)
    }

    try {
      setVacationsOverview(await fetchMyVacations())
    } catch (error) {
      console.error('Failed to fetch vacations', error)
    } finally {
      if (!silent) {
        setLoadingVacations(false)
      }
    }
  }

  const dismissToast = (notificationId) => {
    setToastNotifications((prev) => prev.filter((item) => item.notification_id !== notificationId))
  }

  const dismissSystemToast = (toastKey) => {
    setSystemToasts((prev) => prev.filter((item) => item.key !== toastKey))
  }

  const enqueueSystemToast = (toast) => {
    if (shownSystemToastKeysRef.current.has(toast.key)) return

    shownSystemToastKeysRef.current.add(toast.key)
    setSystemToasts((prev) => {
      if (prev.some((item) => item.key === toast.key)) {
        return prev
      }

      return [...prev, toast].slice(-4)
    })
  }

  const runSystemToastAction = async (toast) => {
    if (typeof toast?.onAction !== 'function') return

    try {
      await toast.onAction()
      dismissSystemToast(toast.key)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось выполнить действие из уведомления')
    }
  }

  function enqueueUndoToast({ title, message, onUndo }) {
    const toastKey = `undo:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`

    enqueueSystemToast({
      key: toastKey,
      kind: 'info',
      title,
      message,
      actionLabel: 'Отменить',
      onAction: onUndo
    })
  }

  async function checkSystemUpdates({ announce = false } = {}) {
    if (!user || !portalWideEnabled) return

    const [runtimeResult, frontendResult] = await Promise.allSettled([
      fetchRuntimeInfo(),
      fetchServerFrontendEntryPath()
    ])

    if (runtimeResult.status === 'fulfilled') {
      const runtimeInfo = runtimeResult.value

      if (!backendRuntimeInstanceIdRef.current) {
        backendRuntimeInstanceIdRef.current = runtimeInfo.runtime_instance_id
      } else if (announce && backendRuntimeInstanceIdRef.current !== runtimeInfo.runtime_instance_id) {
        enqueueSystemToast({
          key: `backend:${runtimeInfo.runtime_instance_id}`,
          kind: 'backend',
          title: 'Бэкенд обновлён',
          message: 'На сервере обновилась backend-логика. Обновите страницу, чтобы работать с актуальной версией.'
        })
      }
    } else {
      console.error('Failed to check backend runtime info', runtimeResult.reason)
    }

    if (frontendResult.status === 'fulfilled') {
      const serverEntryPath = frontendResult.value
      const localEntryPath = localFrontendEntryPathRef.current

      if (announce && localEntryPath && serverEntryPath && localEntryPath !== serverEntryPath) {
        enqueueSystemToast({
          key: `frontend:${serverEntryPath}`,
          kind: 'frontend',
          title: 'Фронтенд обновлён',
          message: 'На сервере появились новые файлы интерфейса. Обновите страницу, чтобы увидеть изменения.'
        })
      }
    } else {
      console.error('Failed to check frontend entrypoint', frontendResult.reason)
    }
  }

  const isDemoNotification = (target) => Boolean(target?.is_demo)

  const dismissToasts = (notificationIds) => {
    const ids = new Set(notificationIds)
    setToastNotifications((prev) => prev.filter((item) => !ids.has(item.notification_id)))
  }

  const resolveNotificationIds = (target) => {
    if (typeof target === 'number') return [target]
    if (target && Array.isArray(target.notification_ids) && target.notification_ids.length) {
      return target.notification_ids
    }
    if (target && typeof target.notification_id === 'number') {
      return [target.notification_id]
    }
    return []
  }

  const runNotificationAction = async (action, fallbackMessage) => {
    try {
      await action()
    } catch (error) {
      console.error(error)
      alert(error.message || fallbackMessage)
    }
  }

  const handleNotificationRead = async (target) => {
    if (isDemoNotification(target)) {
      dismissToast(target.notification_id)
      return
    }

    const notificationIds = resolveNotificationIds(target)
    if (!notificationIds.length) return

    await runNotificationAction(async () => {
      for (const notificationId of notificationIds) {
        await markNotificationRead(notificationId)
      }
      dismissToasts(notificationIds)
      await refreshNotifications({ announce: false, silent: true, force: true })
    }, 'Не удалось отметить уведомление как прочитанное')
  }

  const handleAllNotificationsRead = async () => {
    await runNotificationAction(async () => {
      await markAllNotificationsRead()
      setToastNotifications([])
      await refreshNotifications({ announce: false, silent: true, force: true })
    }, 'Не удалось отметить уведомления как прочитанные')
  }

  const handleNotificationSnooze = async (target, days = 1) => {
    if (isDemoNotification(target)) {
      dismissToast(target.notification_id)
      return
    }

    const notificationIds = resolveNotificationIds(target)
    if (!notificationIds.length) return

    await runNotificationAction(async () => {
      for (const notificationId of notificationIds) {
        await snoozeNotification(notificationId, days)
      }
      dismissToasts(notificationIds)
      await refreshNotifications({ announce: false, silent: true, force: true })
    }, 'Не удалось отложить уведомление')
  }

  const handleSaveNotificationPreferences = async (payload) => {
    setSavingNotificationPreferences(true)
    try {
      await updateNotificationPreferences(payload)
      if (!payload.toast_enabled) {
        setToastNotifications([])
      }
      await refreshNotifications({ announce: false, silent: true })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось сохранить настройки уведомлений')
    } finally {
      setSavingNotificationPreferences(false)
    }
  }

  const handleSaveNotificationRule = async (eventKind, payload) => {
    setSavingNotificationRuleKind(eventKind)
    try {
      await updateNotificationRule(eventKind, payload)
      await refreshNotifications({ announce: false, silent: true, force: true })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось сохранить правило уведомлений')
    } finally {
      setSavingNotificationRuleKind('')
    }
  }

  const handleSaveVacation = async (vacationId, payload) => {
    setSavingVacation(true)
    try {
      if (vacationId) {
        await updateVacationPeriod(vacationId, payload)
      } else {
        await createVacationPeriod(payload)
      }

      await refreshVacations({ silent: true })
      await refreshNotifications({ announce: false, silent: true, force: true })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось сохранить период отпуска')
      throw error
    } finally {
      setSavingVacation(false)
    }
  }

  const handleDeleteVacation = async (vacationId) => {
    if (!window.confirm('Удалить этот период отпуска?')) {
      return
    }

    setDeletingVacationId(vacationId)
    try {
      await deleteVacationPeriod(vacationId)
      await refreshVacations({ silent: true })
      await refreshNotifications({ announce: false, silent: true, force: true })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось удалить период отпуска')
    } finally {
      setDeletingVacationId(null)
    }
  }

  const handleImportVacationSchedule = async (file) => {
    setImportingVacationSchedule(true)
    try {
      const result = await importVacationScheduleDocx(file)
      await refreshVacations({ silent: true })
      await refreshNotifications({ announce: false, silent: true, force: true })
      alert(`Импорт завершен: ${result.imported_periods} период(ов), годы ${result.imported_years.join(', ')}.`)
      return result
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось импортировать график отпусков')
      throw error
    } finally {
      setImportingVacationSchedule(false)
    }
  }

  const handleExportVacationSchedule = async (year) => {
    setExportingVacationSchedule(true)
    try {
      const { blob, fileName } = await exportVacationScheduleDocx(year)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось экспортировать график отпусков')
    } finally {
      setExportingVacationSchedule(false)
    }
  }

  const handleOpenNotification = async (notification) => {
    if (isDemoNotification(notification)) {
      dismissToast(notification.notification_id)
      return
    }

    if (!notification.is_read) {
      await handleNotificationRead(notification)
    }

    setGlobalSearchQuery('')

    if (notification.action_search_query) {
      setSearchQuery(notification.action_search_query)
    }

    if (notification.action_tab) {
      switchTab(notification.action_tab)
    }

    if (notification.event_kind === 'inventory_stock') {
      setShowHistoryModal(true)
    }
  }

  useEffect(() => {
    if (!user || !portalWideEnabled) return
    refreshNotifications({ announce: false, silent: true })
    checkSystemUpdates({ announce: false })
    refreshVacations({ silent: true })
  }, [user, portalWideEnabled])

  useEffect(() => {
    if (user) return

    notificationsReadyRef.current = false
    seenNotificationToastKeysRef.current.clear()
    shownSystemToastKeysRef.current.clear()
    backendRuntimeInstanceIdRef.current = null
    setToastNotifications([])
    setSystemToasts([])
    setNotificationsOverview(DEFAULT_NOTIFICATION_OVERVIEW)
    setVacationsOverview(DEFAULT_VACATIONS_OVERVIEW)
    setLoadingNotifications(false)
    setLoadingVacations(false)
    setSavingNotificationPreferences(false)
    setSavingNotificationRuleKind('')
    setSavingVacation(false)
    setDeletingVacationId(null)
    setImportingVacationSchedule(false)
    setExportingVacationSchedule(false)
  }, [user])

  useEffect(() => {
    if (!user || !portalWideEnabled) return undefined

    const intervalId = window.setInterval(() => {
      refreshNotifications({ announce: true, silent: true })
      checkSystemUpdates({ announce: true })
    }, 60000)

    return () => window.clearInterval(intervalId)
  }, [user, portalWideEnabled])

  return {
    notificationsOverview,
    loadingNotifications,
    savingNotificationPreferences,
    savingNotificationRuleKind,
    toastNotifications,
    systemToasts,
    vacationsOverview,
    loadingVacations,
    savingVacation,
    deletingVacationId,
    importingVacationSchedule,
    exportingVacationSchedule,
    refreshNotifications,
    refreshVacations,
    dismissToast,
    dismissSystemToast,
    runSystemToastAction,
    enqueueSystemToast,
    enqueueUndoToast,
    handleNotificationRead,
    handleAllNotificationsRead,
    handleNotificationSnooze,
    handleSaveNotificationPreferences,
    handleSaveNotificationRule,
    handleSaveVacation,
    handleDeleteVacation,
    handleImportVacationSchedule,
    handleExportVacationSchedule,
    handleOpenNotification
  }
}
