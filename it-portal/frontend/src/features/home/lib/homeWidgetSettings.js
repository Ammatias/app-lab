export const DEFAULT_VK_WORKSPACE_URL = 'https://vk.com/app54510215'

const DEFAULT_WIDGET_SETTINGS = {
  month_calendar: {},
  favorite_contacts: {
    contacts: []
  },
  urgent_cartridges: {
    max_items: 4,
    include_near_limit: true
  },
  admin_team: {
    show_offline: true
  },
  vk_workspace: {
    href: DEFAULT_VK_WORKSPACE_URL
  }
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(max, Math.max(min, numeric))
}

function normalizeContactSettings(rawSettings) {
  const contacts = Array.isArray(rawSettings?.contacts)
    ? rawSettings.contacts
      .map((item) => ({
        kind: item?.kind === 'phonebook' ? 'phonebook' : item?.kind === 'employee' ? 'employee' : '',
        id: clampNumber(item?.id, 1, Number.MAX_SAFE_INTEGER, 0)
      }))
      .filter((item) => item.kind && item.id > 0)
      .filter((item, index, array) => (
        array.findIndex((entry) => entry.kind === item.kind && entry.id === item.id) === index
      ))
      .slice(0, 12)
    : []

  return { contacts }
}

function normalizeUrgentCartridgeSettings(rawSettings) {
  return {
    max_items: clampNumber(rawSettings?.max_items, 1, 8, 4),
    include_near_limit: Boolean(rawSettings?.include_near_limit ?? true)
  }
}

function normalizeAdminTeamSettings(rawSettings) {
  return {
    show_offline: Boolean(rawSettings?.show_offline ?? true)
  }
}

function normalizeVkWorkspaceSettings(rawSettings) {
  const href = String(rawSettings?.href || DEFAULT_VK_WORKSPACE_URL).trim()

  return {
    href: href || DEFAULT_VK_WORKSPACE_URL
  }
}

export function getDefaultHomeWidgetSettings(widgetType) {
  return typeof structuredClone === 'function'
    ? structuredClone(DEFAULT_WIDGET_SETTINGS[widgetType] || {})
    : JSON.parse(JSON.stringify(DEFAULT_WIDGET_SETTINGS[widgetType] || {}))
}

export function normalizeHomeWidgetSettings(widgetType, rawSettings) {
  switch (widgetType) {
    case 'favorite_contacts':
      return normalizeContactSettings(rawSettings)
    case 'urgent_cartridges':
      return normalizeUrgentCartridgeSettings(rawSettings)
    case 'admin_team':
      return normalizeAdminTeamSettings(rawSettings)
    case 'vk_workspace':
      return normalizeVkWorkspaceSettings(rawSettings)
    default:
      return getDefaultHomeWidgetSettings(widgetType)
  }
}

export function parseHomeWidgetSettings(widget) {
  const widgetType = widget?.widget_type || widget?.widgetType || 'month_calendar'

  if (!widget?.settings_json) {
    return normalizeHomeWidgetSettings(widgetType, undefined)
  }

  try {
    return normalizeHomeWidgetSettings(widgetType, JSON.parse(widget.settings_json))
  } catch {
    return normalizeHomeWidgetSettings(widgetType, undefined)
  }
}

export function stringifyHomeWidgetSettings(widgetType, settings) {
  return JSON.stringify(normalizeHomeWidgetSettings(widgetType, settings))
}
