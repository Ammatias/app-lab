export const NOTE_CARD_WIDTH = 360
export const NOTE_CARD_HEIGHT = 220
export const ZONE_SNAP_GRID = 20
export const AUTO_SCROLL_EDGE = 120
export const AUTO_SCROLL_STEP = 28

const toNumber = (value, fallback = 0) => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : fallback
}

export const clampCanvasX = (value) => Math.max(0, Math.round(toNumber(value, 0)))

export const clampCanvasY = (value) => Math.max(0, Math.round(toNumber(value, 0)))

export function getNextNoteZIndex(notes = []) {
  let maxZIndex = 0

  for (const note of notes) {
    const zIndex = Math.max(0, Math.round(toNumber(note?.z_index, 0)))
    if (zIndex > maxZIndex) {
      maxZIndex = zIndex
    }
  }

  return maxZIndex + 1
}

export function isPointInsideZone(x, y, zone) {
  if (!zone) return false

  return (
    x >= clampCanvasX(zone.pos_x) &&
    x <= clampCanvasX(zone.pos_x) + Math.max(0, clampCanvasX(zone.width)) &&
    y >= clampCanvasY(zone.pos_y) &&
    y <= clampCanvasY(zone.pos_y) + Math.max(0, clampCanvasY(zone.height))
  )
}

export function isNoteInsideZone(note, zones = []) {
  const centerX = clampCanvasX(note?.pos_x) + NOTE_CARD_WIDTH / 2
  const centerY = clampCanvasY(note?.pos_y) + NOTE_CARD_HEIGHT / 2
  return zones.some((zone) => isPointInsideZone(centerX, centerY, zone))
}

export function snapNotePosition(posX, posY, zones = [], enabled = true) {
  const nextX = clampCanvasX(posX)
  const nextY = clampCanvasY(posY)

  if (!enabled || zones.length === 0) {
    return { pos_x: nextX, pos_y: nextY }
  }

  const centerX = nextX + NOTE_CARD_WIDTH / 2
  const centerY = nextY + NOTE_CARD_HEIGHT / 2
  const isInsideZone = zones.some((zone) => isPointInsideZone(centerX, centerY, zone))

  if (!isInsideZone) {
    return { pos_x: nextX, pos_y: nextY }
  }

  return {
    pos_x: Math.round(nextX / ZONE_SNAP_GRID) * ZONE_SNAP_GRID,
    pos_y: Math.max(0, Math.round(nextY / ZONE_SNAP_GRID) * ZONE_SNAP_GRID)
  }
}

export function buildNoteUpdatePayload(note, patch = {}) {
  const nextNote = { ...note, ...patch }
  const isTask = nextNote.kind === 'task'

  return {
    title: typeof nextNote.title === 'string' ? nextNote.title : '',
    content: typeof nextNote.content === 'string' ? nextNote.content : '',
    color: nextNote.color || 'slate',
    kind: nextNote.kind || 'note',
    status: nextNote.status || 'open',
    task_priority: isTask ? (nextNote.task_priority || 'normal') : 'normal',
    due_at: isTask ? (nextNote.due_at || null) : null,
    reminder_enabled: isTask ? Boolean(nextNote.reminder_enabled) : false,
    reminder_at: isTask && nextNote.reminder_enabled ? (nextNote.reminder_at || null) : null,
    reminder_repeat_count: isTask ? Math.min(10, Math.max(1, Number(nextNote.reminder_repeat_count) || 1)) : 1,
    reminder_repeat_interval_minutes: isTask ? Math.min(10080, Math.max(5, Number(nextNote.reminder_repeat_interval_minutes) || 60)) : 60,
    due_notification_enabled: isTask ? nextNote.due_notification_enabled !== false : false,
    assigned_usernames: isTask && Array.isArray(nextNote.assignees)
      ? nextNote.assignees.map((assignee) => assignee.username)
      : [],
    notify_on_changes: !isTask && Boolean(nextNote.notify_on_changes),
    shared_usernames: !isTask && Array.isArray(nextNote.shares)
      ? nextNote.shares.map((share) => share.username)
      : [],
    pos_x: clampCanvasX(nextNote.pos_x),
    pos_y: clampCanvasY(nextNote.pos_y),
    z_index: Math.max(1, Math.round(toNumber(nextNote.z_index, 1))),
    is_locked: Boolean(nextNote.is_locked)
  }
}

export function getAutoScrollDelta(pointerClientY, viewportHeight) {
  if (!Number.isFinite(pointerClientY) || !Number.isFinite(viewportHeight)) {
    return 0
  }

  if (pointerClientY < AUTO_SCROLL_EDGE) {
    return -AUTO_SCROLL_STEP
  }

  if (pointerClientY > viewportHeight - AUTO_SCROLL_EDGE) {
    return AUTO_SCROLL_STEP
  }

  return 0
}
