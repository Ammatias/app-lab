const stages = {
  dispatch: 'Запуск через TRMM', initialization: 'Подготовка сценария',
  'identity-check': 'Проверка пользователя', 'compatibility-check': 'Проверка Windows и КриптоПро',
  'receive-package': 'Передача пакета через TRMM', 'download-package': 'Скачивание пакета (прежний сценарий)',
  'https-preflight': 'Проверка HTTPS (прежний сценарий)', 'validate-package': 'Проверка файлов ЭЦП',
  'read-credential': 'Получение пароля ЭЦП', 'prepare-container': 'Поиск контейнера ключа',
  'copy-container': 'Копирование закрытого ключа', 'install-certificate': 'Установка сертификата',
  'verify-installation': 'Проверка установленной ЭЦП'
}

export function diagnosticRows(job) {
  const d = job?.diagnostic
  if (!d || typeof d !== 'object') return []
  const runtime = job.runtime_environment?.endpoint || {}
  const trmm = job.runtime_environment?.trmm || {}
  return [
    ['Этап', stages[d.stage] || 'Выполнение сценария'],
    ['Код', d.code], ['Код Windows / CryptoPro', d.native_code],
    ['Компьютер', job.hostname], ['Windows', runtime.os_version],
    ['Разрядность ОС / процесса', [runtime.os_arch, runtime.process_arch].filter(Boolean).join(' / ')],
    ['PowerShell', runtime.powershell], ['КриптоПро CSP', runtime.csp_version || job.csp_version],
    ['Сценарий', runtime.profile], ['Передача', runtime.transport === 'trmm' ? 'Внутренний канал TRMM' : null],
    ['Данные агента TRMM', trmm.agent_arch], ['Задание', job.id]
  ].filter(([, value]) => typeof value === 'string' && value.trim())
}
