import { ShieldCheck, UserRound, Wifi, WifiOff } from 'lucide-react'
import { isHiddenPortalAccount } from '../../../shared/lib/portalAccounts'

export function normalizeCompareValue(value) {
  return String(value || '').trim().toLowerCase()
}

function formatTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildAdminTeamEntries(profiles, periods, presenceEntries, employees = []) {
  const todayKey = formatTodayKey()
  const employeeByName = new Map(
    (employees || []).map((employee) => [normalizeCompareValue(employee.full_name), employee])
  )
  const presenceByUsername = new Map(
    (presenceEntries || []).map((entry) => [normalizeCompareValue(entry.username), entry])
  )

  const prepared = (profiles || []).filter((profile) => !isHiddenPortalAccount(profile)).map((profile) => {
    const username = normalizeCompareValue(profile.username)
    const employee = employeeByName.get(normalizeCompareValue(profile.display_name))
    const presence = presenceByUsername.get(username)
    const isOnVacation = (periods || []).some((period) => (
      normalizeCompareValue(period.username) === username
      && period.start_date <= todayKey
      && period.end_date >= todayKey
    ))

    let status = 'offline'
    if (isOnVacation) {
      status = 'vacation'
    } else if (presence?.state === 'online') {
      status = 'online'
    } else if (presence?.state === 'authorized') {
      status = 'authorized'
    }

    return {
      username,
      displayName: profile.display_name || profile.username,
      position: profile.position_title || employee?.position || 'Администратор',
      room: employee?.room || '',
      internal: employee?.internal || '',
      phone: employee?.phone || '',
      email: employee?.email || '',
      status
    }
  })

  const statusRank = {
    online: 0,
    authorized: 1,
    vacation: 2,
    offline: 3
  }

  return prepared.sort((left, right) => (
    statusRank[left.status] - statusRank[right.status]
    || left.displayName.localeCompare(right.displayName, 'ru-RU')
  ))
}

export const ADMIN_TEAM_STATUS_META = {
  online: {
    label: 'Онлайн',
    hint: 'Человек активен и сфокусирован на портале.',
    className: 'is-online',
    Icon: Wifi
  },
  authorized: {
    label: 'Авторизован',
    hint: 'Вошёл в портал, но вкладка сейчас не в фокусе.',
    className: 'is-authorized',
    Icon: ShieldCheck
  },
  vacation: {
    label: 'В отпуске',
    hint: 'Сегодня отмечен в отпускном графике.',
    className: 'is-vacation',
    Icon: UserRound
  },
  offline: {
    label: 'Офлайн',
    hint: 'Нет актуального heartbeat от портала.',
    className: 'is-offline',
    Icon: WifiOff
  }
}
