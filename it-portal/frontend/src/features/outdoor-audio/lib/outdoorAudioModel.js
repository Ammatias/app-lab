const EVENT_START_POLICIES = new Set(['immediate', 'after_current'])
const EVENT_AFTER_POLICIES = new Set(['stop', 'next', 'resume_background'])
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'flac', 'ogg', 'm4a'])

export function formatDuration(value) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds <= 0) return '—'
  return formatSeconds(seconds)
}

export function formatElapsedTime(value) {
  const seconds = Number(value)
  return formatSeconds(Number.isFinite(seconds) && seconds > 0 ? seconds : 0)
}

function formatSeconds(seconds) {
  const rounded = Math.round(seconds)
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const rest = rounded % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
  }
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

export function partitionAudioFiles(files) {
  const accepted = []
  const rejected = []

  for (const file of Array.from(files || [])) {
    const name = String(file?.name || '')
    const separator = name.lastIndexOf('.')
    const extension = separator >= 0 ? name.slice(separator + 1).toLowerCase() : ''
    ;(AUDIO_EXTENSIONS.has(extension) ? accepted : rejected).push(file)
  }

  return { accepted, rejected }
}

export function sortAudioFilesByName(files) {
  const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' })
  return Array.from(files || []).sort((left, right) => (
    collator.compare(String(left?.name || ''), String(right?.name || ''))
  ))
}

export function uniqueTrackIdsNotInPlaylist(uploadedTracks, playlistItems) {
  const existing = new Set((playlistItems || []).map((item) => Number(item.track_id)))
  const unique = new Set()

  for (const track of uploadedTracks || []) {
    const id = Number(track?.id)
    if (Number.isInteger(id) && id > 0 && !existing.has(id)) unique.add(id)
  }

  return [...unique]
}

export function numberOrNull(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function settingsMap(settings) {
  return Object.fromEntries((settings || []).map((item) => [item.key, item.value]))
}

export function parseScheduleAction(schedule) {
  if (!schedule?.action_json) return {}
  try {
    const action = JSON.parse(schedule.action_json)
    return action && typeof action === 'object' ? action : {}
  } catch {
    return {}
  }
}

export function normalizePositiveId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export function normalizeAudioDeviceValue(value) {
  let nextValue = String(value || '').trim()
  if (!nextValue) return ''
  if (nextValue.includes(' | ')) nextValue = nextValue.split(' | ')[0].trim()
  if (nextValue[0] === '\'' || nextValue[0] === '"') {
    const end = nextValue.indexOf(nextValue[0], 1)
    if (end > 1) nextValue = nextValue.slice(1, end)
  }
  return nextValue.toLowerCase() === 'auto' ? '' : nextValue
}

export function audioDeviceOption(device) {
  const raw = typeof device === 'string' ? device : device?.raw || device?.label || device?.id || ''
  const value = normalizeAudioDeviceValue(typeof device === 'string' ? device : device?.id || raw)
  return {
    raw,
    value,
    label: value ? raw : 'auto'
  }
}

export function scheduleTargetLabel(action, tracks, playlists) {
  if (action?.type === 'stop') return 'Выключить звук'
  if (action?.playlist_id) {
    return playlists.find((playlist) => Number(playlist.id) === Number(action.playlist_id))?.name || 'Плейлист не выбран'
  }
  if (action?.track_id) {
    return tracks.find((track) => Number(track.id) === Number(action.track_id))?.original_filename || 'Трек не выбран'
  }
  return 'Цель не выбрана'
}

export function playbackLabel(state) {
  if (state === 'playing') return 'Играет'
  if (state === 'paused') return 'Пауза'
  if (state === 'offline') return 'VLC недоступен'
  return 'Стоп'
}

export function resolveSelectedPlaylistId(selectedPlaylistId, playlists) {
  const normalized = Array.isArray(playlists) ? playlists : []
  const selected = String(selectedPlaylistId || '')
  if (selected && normalized.some((playlist) => String(playlist.id) === selected)) return selected
  return normalized[0]?.id == null ? '' : String(normalized[0].id)
}

export function normalizeEventPreferences(preferences = {}) {
  const rawStartPolicy = preferences.startPolicy ?? preferences.event_start_policy
  const rawAfterPolicy = preferences.afterPolicy ?? preferences.event_after_policy
  const rawRepeat = preferences.repeat ?? preferences.event_repeat
  const startPolicy = EVENT_START_POLICIES.has(rawStartPolicy)
    ? rawStartPolicy
    : 'immediate'
  const afterPolicy = EVENT_AFTER_POLICIES.has(rawAfterPolicy)
    ? rawAfterPolicy
    : 'stop'
  const repeat = rawRepeat === true || rawRepeat === 'true'
  return { startPolicy, afterPolicy, repeat }
}

export function buildEventTriggerPayload({
  playlistId,
  playlistItemId,
  startPolicy,
  afterPolicy,
  repeat
}) {
  const normalizedPlaylistId = normalizePositiveId(playlistId)
  if (!normalizedPlaylistId) throw new Error('Выберите плейлист мероприятия')
  const normalizedItemId = normalizePositiveId(playlistItemId)
  if (!normalizedItemId) throw new Error('Выберите трек мероприятия')

  const preferences = normalizeEventPreferences({ startPolicy, afterPolicy, repeat })
  return {
    playlist_id: normalizedPlaylistId,
    playlist_item_id: normalizedItemId,
    start_policy: preferences.startPolicy,
    after_policy: preferences.afterPolicy,
    repeat: preferences.repeat
  }
}

export function reorderQueueIds(queue, itemId, direction) {
  const queued = (queue || []).filter((item) => item.state === 'queued')
  const currentIndex = queued.findIndex((item) => Number(item.id) === Number(itemId))
  if (currentIndex < 0) return queued.map((item) => item.id)
  const targetIndex = Math.max(0, Math.min(queued.length - 1, currentIndex + Math.sign(direction)))
  if (targetIndex === currentIndex) return queued.map((item) => item.id)

  const next = [...queued]
  const [item] = next.splice(currentIndex, 1)
  next.splice(targetIndex, 0, item)
  return next.map((entry) => entry.id)
}

export function shouldApplyRequest(requestSequence, latestSequence) {
  return requestSequence === latestSequence
}
