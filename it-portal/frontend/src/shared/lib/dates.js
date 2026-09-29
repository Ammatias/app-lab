export const parseDayMonthYear = (value) => {
  const normalized = String(value || '').trim()
  if (!normalized || normalized === '-') return null

  const match = normalized.match(/^(\d{1,2})[.,](\d{1,2})[.,](\d{2}|\d{4})$/)
  if (!match) return null

  const day = Number.parseInt(match[1], 10)
  const month = Number.parseInt(match[2], 10)
  const rawYear = Number.parseInt(match[3], 10)
  const year = match[3].length === 2 ? 2000 + rawYear : rawYear

  const date = new Date(year, month - 1, day)
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  date.setHours(0, 0, 0, 0)
  return date
}

export const formatDayMonthYear = (value, fallback = '—') => {
  const date = value instanceof Date ? value : parseDayMonthYear(value)
  if (!date) return fallback

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

export const getDiffDaysFromToday = (value) => {
  const date = value instanceof Date ? value : parseDayMonthYear(value)
  if (!date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((date.getTime() - today.getTime()) / 86400000)
}
