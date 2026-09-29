async function readErrorMessage(response, fallbackMessage) {
  try {
    const text = await response.text()
    if (!text) return fallbackMessage
    try {
      const payload = JSON.parse(text)
      if (payload && typeof payload === 'object' && Object.keys(payload).length === 0) return fallbackMessage
      return payload?.message || payload?.title || payload?.error?.message || payload?.error || text
    } catch {
      return text
    }
  } catch {
    return fallbackMessage
  }
}

async function requestJson(url, options = {}, fallbackMessage = 'Запрос к уличному звуку не выполнен') {
  const response = await fetch(url, options)
  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('Файл слишком большой для загрузки')
    }
    throw new Error(await readErrorMessage(response, fallbackMessage))
  }
  if (response.status === 204) return null
  return response.json()
}

export function fetchOutdoorAudioStatus(options = {}) {
  return requestJson('/api/outdoor-audio/status', options, 'Не удалось загрузить статус уличного звука')
}

export function fetchOutdoorAudioTracks() {
  return requestJson('/api/outdoor-audio/tracks', {}, 'Не удалось загрузить библиотеку')
}

export function fetchOutdoorAudioQueue() {
  return requestJson('/api/outdoor-audio/queue', {}, 'Не удалось загрузить очередь')
}

export function fetchOutdoorAudioPlaylists() {
  return requestJson('/api/outdoor-audio/playlists', {}, 'Не удалось загрузить плейлисты')
}

export function fetchOutdoorAudioPlaylistItems(playlistId) {
  return requestJson(`/api/outdoor-audio/playlists/${playlistId}/items`, {}, 'Не удалось загрузить треки плейлиста')
}

export function fetchOutdoorAudioSchedules() {
  return requestJson('/api/outdoor-audio/schedules', {}, 'Не удалось загрузить расписания')
}

export function fetchOutdoorAudioAuditEvents() {
  return requestJson('/api/outdoor-audio/audit-events', {}, 'Не удалось загрузить журнал')
}

export function fetchOutdoorAudioSettings() {
  return requestJson('/api/outdoor-audio/settings', {}, 'Не удалось загрузить настройки')
}

export function fetchOutdoorAudioDevices() {
  return requestJson('/api/outdoor-audio/audio-devices', {}, 'Не удалось загрузить аудиоустройства')
}

export function fetchOutdoorAudioAgentLogs(limit = 200) {
  const params = new URLSearchParams({ limit: String(limit) })
  return requestJson(`/api/outdoor-audio/agent-logs?${params.toString()}`, {}, 'Не удалось загрузить логи agent')
}

export function fetchOutdoorAudioAgentSelfTest() {
  return requestJson('/api/outdoor-audio/agent-self-test', {}, 'Не удалось выполнить self-test agent')
}

export async function uploadOutdoorAudioTrack(file) {
  const formData = new FormData()
  formData.append('file', file)
  return requestJson('/api/outdoor-audio/tracks', {
    method: 'POST',
    body: formData
  }, 'Не удалось загрузить аудиофайл')
}

export async function uploadOutdoorAudioTracks(files, onProgress = () => {}) {
  const uploaded = []
  const list = Array.from(files || [])
  for (let index = 0; index < list.length; index += 1) {
    const track = await uploadOutdoorAudioTrack(list[index])
    uploaded.push(track)
    onProgress({ index: index + 1, total: list.length, track })
  }
  return uploaded
}

export function deleteOutdoorAudioTrack(id) {
  return requestJson(`/api/outdoor-audio/tracks/${id}`, { method: 'DELETE' }, 'Не удалось удалить аудиофайл')
}

export function createOutdoorAudioPlaylist(payload) {
  return requestJson('/api/outdoor-audio/playlists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Не удалось создать плейлист')
}

export function updateOutdoorAudioPlaylist(id, payload) {
  return requestJson(`/api/outdoor-audio/playlists/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Не удалось обновить плейлист')
}

export function deleteOutdoorAudioPlaylist(id) {
  return requestJson(`/api/outdoor-audio/playlists/${id}`, { method: 'DELETE' }, 'Не удалось удалить плейлист')
}

export function addOutdoorAudioPlaylistTrack(playlistId, trackId) {
  return requestJson(`/api/outdoor-audio/playlists/${playlistId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ track_id: trackId })
  }, 'Не удалось добавить трек в плейлист')
}

export function addOutdoorAudioPlaylistTracks(playlistId, trackIds) {
  return requestJson(`/api/outdoor-audio/playlists/${playlistId}/items/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ track_ids: trackIds })
  }, 'Не удалось добавить треки в плейлист')
}

export function removeOutdoorAudioPlaylistItem(playlistId, itemId) {
  return requestJson(`/api/outdoor-audio/playlists/${playlistId}/items/${itemId}`, { method: 'DELETE' }, 'Не удалось убрать трек из плейлиста')
}

export function enqueueOutdoorAudioPlaylist(playlistId, clearQueue = false) {
  return requestJson(`/api/outdoor-audio/playlists/${playlistId}/enqueue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clear_queue: clearQueue })
  }, 'Не удалось добавить плейлист в очередь')
}

export function playOutdoorAudioPlaylist(playlistId, payload = {}) {
  return requestJson(`/api/outdoor-audio/playlists/${playlistId}/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Не удалось запустить плейлист')
}

export function enqueueOutdoorAudioTrack(trackId) {
  return requestJson('/api/outdoor-audio/queue/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ track_id: trackId })
  }, 'Не удалось добавить трек в очередь')
}

export function removeOutdoorAudioQueueItem(id) {
  return requestJson(`/api/outdoor-audio/queue/items/${id}`, { method: 'DELETE' }, 'Не удалось убрать трек из очереди')
}

export function reorderOutdoorAudioQueue(itemIds) {
  return requestJson('/api/outdoor-audio/queue/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_ids: itemIds })
  }, 'Не удалось переставить очередь')
}

export function sendOutdoorAudioPlayback(command, payload = {}) {
  return requestJson(`/api/outdoor-audio/playback/${command}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Не удалось отправить команду плееру')
}

export function emergencyStopOutdoorAudio() {
  return requestJson('/api/outdoor-audio/playback/emergency-stop', {
    method: 'POST'
  }, 'Не удалось остановить звук')
}

export function setOutdoorAudioRepeat(repeat) {
  return requestJson('/api/outdoor-audio/playback/repeat', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repeat })
  }, 'Не удалось изменить повтор')
}

export function triggerOutdoorAudioEvent(payload) {
  return requestJson('/api/outdoor-audio/events/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Не удалось запустить трек мероприятия')
}

export function cancelPendingOutdoorAudioEvent() {
  return requestJson('/api/outdoor-audio/events/pending', {
    method: 'DELETE'
  }, 'Не удалось отменить ожидающий трек')
}

export function createOutdoorAudioAnnouncement(trackId, returnToQueue = true) {
  return requestJson('/api/outdoor-audio/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ track_id: trackId, return_to_queue: returnToQueue })
  }, 'Не удалось запустить объявление')
}

export function createOutdoorAudioSchedule(payload) {
  return requestJson('/api/outdoor-audio/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Не удалось создать расписание')
}

export function updateOutdoorAudioSchedule(id, payload) {
  return requestJson(`/api/outdoor-audio/schedules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Не удалось обновить расписание')
}

export function deleteOutdoorAudioSchedule(id) {
  return requestJson(`/api/outdoor-audio/schedules/${id}`, { method: 'DELETE' }, 'Не удалось удалить расписание')
}

export function updateOutdoorAudioSettings(payload) {
  return requestJson('/api/outdoor-audio/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Не удалось сохранить настройки')
}
