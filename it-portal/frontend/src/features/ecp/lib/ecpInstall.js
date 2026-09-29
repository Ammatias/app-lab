export const isRunnableTarget = (target) =>
  target?.status === 'online' && Boolean(target?.logged_username?.trim())

export const selectDefaultTarget = (targets = []) =>
  targets.find(isRunnableTarget)?.agent_id || ''

export const certificateIssues = (certificate) => {
  if (Array.isArray(certificate?.issues)) return certificate.issues
  const issues = []
  if (!certificate?.owner_employee_id) issues.push('Запись не привязана к сотруднику')
  if (!certificate?.has_public_key) issues.push('Нет открытого ключа')
  if (!certificate?.has_private_key) issues.push('Нет закрытого ключа ZIP')
  return issues
}

export const isCertificateReady = (certificate) => certificateIssues(certificate).length === 0

export const delegatedInstallSummary = (certificate, target) => {
  if (!certificate || !target) return ''
  return `ЭЦП ${certificate.owner_name} → ${target.employee_name}`
}

export const matchesInstallOption = (values, query) => {
  const needle = String(query || '').trim().toLocaleLowerCase('ru-RU')
  if (!needle) return true
  return values.some((value) => String(value || '').toLocaleLowerCase('ru-RU').includes(needle))
}

export const validateContainerPin = (value = '') => {
  const pin = String(value)
  if ([...pin].length > 128) return 'Пароль ЭЦП не должен быть длиннее 128 символов'
  if (/["\r\n\0]/u.test(pin)) return 'Пароль ЭЦП содержит недопустимые символы'
  return ''
}

export const containerPinHint = (value = '') => String(value).length
  ? 'Пароль будет передан только для этой установки'
  : 'Пусто — контейнер без пароля'

export const installStatusPresentation = (job) => {
  if (!job) return null
  const alreadyInstalled = job.status === 'succeeded' && job.message === 'ЭЦП уже установлена на этом компьютере'
  const map = {
    queued: ['queued', 'Задание отправлено'],
    running: ['running', 'Установка выполняется'],
    succeeded: ['succeeded', alreadyInstalled ? 'ЭЦП уже установлена' : 'ЭЦП установлена'],
    failed: ['failed', 'Ошибка установки'],
    expired: ['expired', 'Время установки истекло']
  }
  const [tone, label] = map[job.status] || ['expired', 'Статус неизвестен']
  return { tone, label, detail: job.message || '', terminal: ['succeeded', 'failed', 'expired'].includes(job.status) }
}
