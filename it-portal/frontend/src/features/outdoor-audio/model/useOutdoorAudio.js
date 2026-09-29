import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addOutdoorAudioPlaylistTracks,
  cancelPendingOutdoorAudioEvent,
  createOutdoorAudioPlaylist,
  createOutdoorAudioSchedule,
  deleteOutdoorAudioPlaylist,
  deleteOutdoorAudioSchedule,
  emergencyStopOutdoorAudio,
  enqueueOutdoorAudioPlaylist,
  fetchOutdoorAudioDevices,
  fetchOutdoorAudioPlaylistItems,
  fetchOutdoorAudioPlaylists,
  fetchOutdoorAudioQueue,
  fetchOutdoorAudioSchedules,
  fetchOutdoorAudioSettings,
  fetchOutdoorAudioStatus,
  fetchOutdoorAudioTracks,
  playOutdoorAudioPlaylist,
  removeOutdoorAudioPlaylistItem,
  removeOutdoorAudioQueueItem,
  reorderOutdoorAudioQueue,
  sendOutdoorAudioPlayback,
  triggerOutdoorAudioEvent,
  updateOutdoorAudioSchedule,
  updateOutdoorAudioSettings,
  uploadOutdoorAudioTracks
} from '../../../entities/outdoor-audio/api'
import {
  buildEventTriggerPayload,
  normalizeEventPreferences,
  partitionAudioFiles,
  reorderQueueIds,
  resolveSelectedPlaylistId,
  settingsMap,
  shouldApplyRequest,
  sortAudioFilesByName,
  uniqueTrackIdsNotInPlaylist
} from '../lib/outdoorAudioModel'

export function useOutdoorAudio() {
  const [status, setStatus] = useState(null)
  const [tracks, setTracks] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('')
  const [playlistItems, setPlaylistItems] = useState([])
  const [queue, setQueue] = useState([])
  const [schedules, setSchedules] = useState([])
  const [settings, setSettings] = useState([])
  const [audioDevices, setAudioDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(null)
  const [volume, setVolume] = useState(45)
  const busyRef = useRef('')
  const librarySequence = useRef(0)
  const statusSequence = useRef(0)
  const itemsSequence = useRef(0)
  const selectedPlaylistRef = useRef('')

  const mappedSettings = useMemo(() => settingsMap(settings), [settings])
  const eventPreferences = useMemo(
    () => normalizeEventPreferences(mappedSettings),
    [mappedSettings]
  )

  useEffect(() => {
    selectedPlaylistRef.current = selectedPlaylistId
  }, [selectedPlaylistId])

  const refreshLibrary = useCallback(async ({ quiet = false } = {}) => {
    const requestId = ++librarySequence.current
    if (!quiet) setLoading(true)
    try {
      const [nextStatus, nextTracks, nextPlaylists, nextQueue, nextSchedules, nextSettings, devices] = await Promise.all([
        fetchOutdoorAudioStatus(),
        fetchOutdoorAudioTracks(),
        fetchOutdoorAudioPlaylists(),
        fetchOutdoorAudioQueue(),
        fetchOutdoorAudioSchedules(),
        fetchOutdoorAudioSettings(),
        fetchOutdoorAudioDevices().catch(() => ({ devices: [] }))
      ])
      if (!shouldApplyRequest(requestId, librarySequence.current)) return

      const normalizedPlaylists = Array.isArray(nextPlaylists) ? nextPlaylists : []
      const nextSelectedId = resolveSelectedPlaylistId(selectedPlaylistRef.current, normalizedPlaylists)
      const nextItems = nextSelectedId
        ? await fetchOutdoorAudioPlaylistItems(nextSelectedId)
        : []
      if (!shouldApplyRequest(requestId, librarySequence.current)) return

      statusSequence.current += 1
      setStatus(nextStatus)
      setTracks(Array.isArray(nextTracks) ? nextTracks : [])
      setPlaylists(normalizedPlaylists)
      setSelectedPlaylistId(nextSelectedId)
      setPlaylistItems(Array.isArray(nextItems) ? nextItems : [])
      setQueue(Array.isArray(nextQueue) ? nextQueue : [])
      setSchedules(Array.isArray(nextSchedules) ? nextSchedules : [])
      setSettings(Array.isArray(nextSettings) ? nextSettings : [])
      setAudioDevices(Array.isArray(devices?.devices) ? devices.devices : [])
      if (Number.isFinite(Number(nextStatus?.volume))) setVolume(Number(nextStatus.volume))
      setError('')
    } catch (nextError) {
      if (shouldApplyRequest(requestId, librarySequence.current)) {
        setError(nextError.message || 'Не удалось обновить уличный звук')
      }
    } finally {
      if (!quiet && shouldApplyRequest(requestId, librarySequence.current)) setLoading(false)
    }
  }, [])

  const refreshStatus = useCallback(async () => {
    const requestId = ++statusSequence.current
    try {
      const nextStatus = await fetchOutdoorAudioStatus()
      if (shouldApplyRequest(requestId, statusSequence.current)) setStatus(nextStatus)
    } catch (nextError) {
      if (shouldApplyRequest(requestId, statusSequence.current)) {
        setError(nextError.message || 'Сервис уличного звука недоступен')
      }
    }
  }, [])

  useEffect(() => {
    void refreshLibrary()
  }, [refreshLibrary])

  useEffect(() => {
    let stopped = false
    let timerId
    const poll = async () => {
      if (stopped) return
      await refreshStatus()
      if (!stopped) timerId = window.setTimeout(poll, 2000)
    }
    timerId = window.setTimeout(poll, 2000)
    return () => {
      stopped = true
      window.clearTimeout(timerId)
      statusSequence.current += 1
    }
  }, [refreshStatus])

  const runAction = useCallback(async (label, action, { refresh = true } = {}) => {
    if (busyRef.current) return false
    busyRef.current = label
    setBusy(label)
    setError('')
    try {
      const result = await action()
      if (refresh) await refreshLibrary({ quiet: true })
      return result ?? true
    } catch (nextError) {
      setError(nextError.message || 'Команда не выполнена')
      return false
    } finally {
      busyRef.current = ''
      setBusy('')
    }
  }, [refreshLibrary])

  const selectPlaylist = useCallback((id) => {
    const value = String(id || '')
    selectedPlaylistRef.current = value
    setSelectedPlaylistId(value)
    const requestId = ++itemsSequence.current
    if (!value) {
      setPlaylistItems([])
      return
    }
    fetchOutdoorAudioPlaylistItems(value)
      .then((items) => {
        if (shouldApplyRequest(requestId, itemsSequence.current)) {
          setPlaylistItems(Array.isArray(items) ? items : [])
        }
      })
      .catch((nextError) => {
        if (shouldApplyRequest(requestId, itemsSequence.current)) setError(nextError.message)
      })
  }, [])

  const transport = useCallback((command, payload = {}) => (
    runAction(command, () => sendOutdoorAudioPlayback(command, payload))
  ), [runAction])

  const emergencyStop = useCallback(() => (
    runAction('emergency-stop', emergencyStopOutdoorAudio)
  ), [runAction])

  const triggerEvent = useCallback((item, preferences) => (
    runAction(`event-${item.id}`, () => triggerOutdoorAudioEvent(buildEventTriggerPayload({
      playlistId: selectedPlaylistId,
      playlistItemId: item.id,
      ...preferences
    })))
  ), [runAction, selectedPlaylistId])

  const saveEventPreferences = useCallback((preferences) => (
    runAction('event-settings', () => updateOutdoorAudioSettings({
      event_start_policy: preferences.startPolicy,
      event_after_policy: preferences.afterPolicy,
      event_repeat: preferences.repeat
    }), { refresh: false })
  ), [runAction])

  const moveQueueItem = useCallback((itemId, direction) => {
    const ids = reorderQueueIds(queue, itemId, direction)
    if (!ids) return Promise.resolve(false)
    return runAction('queue-reorder', () => reorderOutdoorAudioQueue(ids))
  }, [queue, runAction])

  const uploadFiles = useCallback((files) => {
    const partitioned = partitionAudioFiles(files)
    const accepted = sortAudioFilesByName(partitioned.accepted)
    const { rejected } = partitioned
    if (!selectedPlaylistId || accepted.length === 0 || rejected.length > 0) {
      const rejectedNames = rejected.slice(0, 3).map((file) => file.name || 'без имени').join(', ')
      setError(selectedPlaylistId ? '' : 'Сначала выберите плейлист')
      if (selectedPlaylistId && rejected.length > 0) {
        setError(`Неподдерживаемые файлы: ${rejectedNames}. Разрешены mp3, wav, flac, ogg и m4a`)
      }
      return Promise.resolve(false)
    }
    return runAction('upload', async () => {
      setUploadProgress({ completed: 0, total: accepted.length })
      try {
        const uploaded = await uploadOutdoorAudioTracks(accepted, ({ index, total }) => {
          setUploadProgress({ completed: index, total })
        })
        const trackIds = uniqueTrackIdsNotInPlaylist(uploaded, playlistItems)
        if (trackIds.length > 0) {
          await addOutdoorAudioPlaylistTracks(selectedPlaylistId, trackIds)
        }
        return true
      } finally {
        setUploadProgress(null)
      }
    })
  }, [playlistItems, runAction, selectedPlaylistId])

  return {
    status,
    tracks,
    playlists,
    selectedPlaylistId,
    playlistItems,
    queue,
    schedules,
    mappedSettings,
    eventPreferences,
    audioDevices,
    loading,
    busy,
    error,
    uploadProgress,
    volume,
    setVolume,
    setError,
    selectPlaylist,
    refresh: refreshLibrary,
    runAction,
    transport,
    emergencyStop,
    triggerEvent,
    cancelPending: () => runAction('event-cancel', cancelPendingOutdoorAudioEvent),
    saveEventPreferences,
    moveQueueItem,
    removeQueueItem: (id) => runAction('queue-remove', () => removeOutdoorAudioQueueItem(id)),
    playPlaylist: () => runAction('playlist-play', () => playOutdoorAudioPlaylist(selectedPlaylistId, {
      clear_queue: true,
      volume,
      loop: true
    })),
    enqueuePlaylist: () => runAction('playlist-enqueue', () => enqueueOutdoorAudioPlaylist(selectedPlaylistId)),
    createPlaylist: (name) => runAction('playlist-create', async () => {
      const created = await createOutdoorAudioPlaylist({ name })
      selectPlaylist(created.id)
      return created
    }),
    deletePlaylist: () => runAction('playlist-delete', () => deleteOutdoorAudioPlaylist(selectedPlaylistId)),
    removePlaylistItem: (itemId) => runAction('playlist-item-remove', () => (
      removeOutdoorAudioPlaylistItem(selectedPlaylistId, itemId)
    )),
    uploadFiles,
    createSchedule: (payload) => runAction('schedule-create', () => createOutdoorAudioSchedule(payload)),
    updateSchedule: (id, payload) => runAction('schedule-update', () => updateOutdoorAudioSchedule(id, payload)),
    deleteSchedule: (id) => runAction('schedule-delete', () => deleteOutdoorAudioSchedule(id)),
    updateSettings: (payload) => runAction('settings', () => updateOutdoorAudioSettings(payload)),
    setVolumeRemote: () => transport('volume', { volume })
  }
}
