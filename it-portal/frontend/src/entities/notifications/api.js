export const DEFAULT_NOTIFICATION_PREFERENCES = {
  username: '',
  toast_enabled: true,
  sound_enabled: true,
  sound_volume: 72,
  toast_sound: 'aurora',
  digest_enabled: false,
  ecp_enabled: true,
  inventory_enabled: true,
  notes_enabled: true,
  vacation_enabled: false,
  updated_at: null
}

export const DEFAULT_NOTIFICATION_OVERVIEW = {
  unread_count: 0,
  summary: {
    total_active: 0,
    active_critical: 0,
    active_warning: 0,
    active_info: 0
  },
  preferences: DEFAULT_NOTIFICATION_PREFERENCES,
  rules: [],
  notifications: [],
  history: []
}

export async function fetchNotificationsOverview({ force = false } = {}) {
  const query = force ? '?force=true' : ''
  const response = await fetch(`/api/notifications${query}`)
  if (!response.ok) throw new Error('Failed to fetch notifications')
  return response.json()
}

export async function updateNotificationPreferences(payload) {
  const response = await fetch('/api/notifications/preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to update notification preferences')
  return response.json()
}

export async function updateNotificationRule(eventKind, payload) {
  const response = await fetch(`/api/notifications/rules/${eventKind}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to update notification rule')
  return response.json()
}

export async function markNotificationRead(notificationId) {
  const response = await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
  if (!response.ok) throw new Error(await response.text() || 'Failed to mark notification as read')
}

export async function markAllNotificationsRead() {
  const response = await fetch('/api/notifications/read-all', { method: 'POST' })
  if (!response.ok) throw new Error(await response.text() || 'Failed to mark all notifications as read')
}

export async function hideNotificationForDay(notificationId) {
  const response = await fetch(`/api/notifications/${notificationId}/hide`, { method: 'POST' })
  if (!response.ok) throw new Error(await response.text() || 'Failed to hide notification')
}

export async function snoozeNotification(notificationId, days) {
  const response = await fetch(`/api/notifications/${notificationId}/snooze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days })
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to snooze notification')
}
