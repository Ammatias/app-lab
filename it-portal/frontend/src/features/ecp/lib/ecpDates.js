import { formatDayMonthYear, getDiffDaysFromToday, parseDayMonthYear } from '../../../shared/lib/dates.js'

export const getDisplayValue = (value, fallback = 'Нет') => {
  if (value === null || value === undefined) return fallback
  const normalized = String(value).trim()
  return normalized ? normalized : fallback
}

export const parseEcpDate = (value) => parseDayMonthYear(value)

export const formatEcpDate = (value) => {
  const date = parseEcpDate(value)
  return date ? formatDayMonthYear(date) : getDisplayValue(value, '—')
}

export const getEcpEffectiveValidUntil = (publicValue, privateValue) => {
  const publicDate = parseEcpDate(publicValue)
  const privateDate = parseEcpDate(privateValue)

  if (publicDate && privateDate) {
    return publicDate.getTime() <= privateDate.getTime() ? publicValue : privateValue
  }
  if (publicDate) return publicValue
  if (privateDate) return privateValue
  return ''
}

export const getEcpDateAccentStyle = (value) => {
  const date = parseEcpDate(value)
  if (!date) {
    return {
      background: 'linear-gradient(135deg, rgba(151,47,255,0.2), rgba(86,33,255,0.18))',
      border: '1px solid rgba(203,162,255,0.24)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 28px rgba(90,44,190,0.16)'
    }
  }

  const diffDays = getDiffDaysFromToday(date)

  if (diffDays <= 10) {
    return {
      background: 'linear-gradient(135deg, rgba(255,91,91,0.22), rgba(190,24,93,0.18))',
      border: '1px solid rgba(254,178,178,0.28)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 28px rgba(127,29,29,0.18)'
    }
  }

  if (diffDays <= 40) {
    return {
      background: 'linear-gradient(135deg, rgba(250,204,21,0.22), rgba(249,115,22,0.18))',
      border: '1px solid rgba(253,224,71,0.26)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 28px rgba(161,98,7,0.16)'
    }
  }

  return {
    background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.16))',
    border: '1px solid rgba(134,239,172,0.24)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 28px rgba(21,128,61,0.16)'
  }
}

export const getEcpDateBadgeStyle = (value) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '14px 16px',
  borderRadius: '14px',
  ...getEcpDateAccentStyle(value)
})
