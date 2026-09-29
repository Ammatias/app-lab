import { useEffect, useState } from 'react'
import {
  confirmBackupTwoFactorSetup,
  createBackupTwoFactorSetup,
  deleteBackupTwoFactorSetup,
  fetchBackupTwoFactorConfig
} from '../lib/session'
import { isHiddenPortalAccount } from '../../../shared/lib/portalAccounts'

function formatDateTime(value) {
  if (!value) return 'Еще не было'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Еще не было'

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

async function copyText(value) {
  await navigator.clipboard.writeText(value)
}

export function BackupTwoFactorSection({ user, active }) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const [confirmCode, setConfirmCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadConfig = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError('')

    try {
      const nextConfig = await fetchBackupTwoFactorConfig()
      setConfig(nextConfig)
    } catch (nextError) {
      setError(nextError.message || 'Не удалось загрузить настройки резервного входа')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    if (!active) return
    loadConfig()
  }, [active])

  const handleCreateSetup = async () => {
    setBusyAction('create')
    setMessage('')
    setError('')

    try {
      const nextConfig = await createBackupTwoFactorSetup()
      setConfig(nextConfig)
      setConfirmCode('')
      setMessage('Новый резервный секрет создан. Добавьте его в приложение-аутентификатор и подтвердите текущим кодом.')
    } catch (nextError) {
      setError(nextError.message || 'Не удалось создать резервный секрет')
    } finally {
      setBusyAction('')
    }
  }

  const handleConfirm = async () => {
    setBusyAction('confirm')
    setMessage('')
    setError('')

    try {
      const nextConfig = await confirmBackupTwoFactorSetup(confirmCode)
      setConfig(nextConfig)
      setConfirmCode('')
      setMessage('Резервный вход подтвержден и теперь доступен по TOTP-коду.')
    } catch (nextError) {
      setError(nextError.message || 'Не удалось подтвердить резервный код')
    } finally {
      setBusyAction('')
    }
  }

  const handleDelete = async () => {
    const isConfirmed = window.confirm('Отключить резервный вход по коду? Вход через Authentik останется доступен.')
    if (!isConfirmed) return

    setBusyAction('delete')
    setMessage('')
    setError('')

    try {
      const nextConfig = await deleteBackupTwoFactorSetup()
      setConfig(nextConfig)
      setConfirmCode('')
      setMessage('Резервный вход отключен.')
    } catch (nextError) {
      setError(nextError.message || 'Не удалось отключить резервный вход')
    } finally {
      setBusyAction('')
    }
  }

  const handleCopy = async (value, successMessage) => {
    setMessage('')
    setError('')

    try {
      await copyText(value)
      setMessage(successMessage)
    } catch {
      setError('Не удалось скопировать значение в буфер обмена')
    }
  }

  const isPending = Boolean(config?.pending_setup)
  const isEnabled = Boolean(config?.enabled)
  const isHiddenUser = isHiddenPortalAccount(user)

  return (
    <section className="portal-profile-modal-section">
      <div className="portal-profile-modal-section-title">Резервный вход по коду</div>
      <div style={{ display: 'grid', gap: '12px' }}>
        <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Дополнительный вход для аварийного случая: без логина и почты, только по 6-значному коду из приложения-аутентификатора.
          {isHiddenUser
            ? ' Код автоматически привязывается к скрытой служебной учетке.'
            : <> Код автоматически привязывается к вашему профилю <strong>{user?.username || 'operator'}</strong>.</>}
        </p>

        {active && loading && !config ? (
          <div style={{ color: 'var(--text-muted)' }}>Загружаем настройки...</div>
        ) : null}

        {config?.available === false ? (
          <div className="glass-panel" style={{ padding: '14px 16px', color: 'var(--warning)' }}>
            {config?.message || 'Резервный вход пока недоступен на сервере.'}
          </div>
        ) : null}

        {error ? (
          <div className="glass-panel" style={{ padding: '14px 16px', borderColor: 'rgba(255, 107, 107, 0.4)', color: '#ffb4b4' }}>
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="glass-panel" style={{ padding: '14px 16px', borderColor: 'rgba(120, 210, 170, 0.35)', color: '#b7f3cd' }}>
            {message}
          </div>
        ) : null}

        {!loading && config?.available !== false && !isPending && !isEnabled ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={handleCreateSetup} disabled={busyAction === 'create'}>
              {busyAction === 'create' ? 'Создаем...' : 'Настроить резервный код'}
            </button>
          </div>
        ) : null}

        {config?.available !== false && (isPending || isEnabled) ? (
          <div className="glass-panel" style={{ padding: '16px', display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gap: '6px' }}>
              <strong>{isEnabled ? 'Резервный вход активен' : 'Ожидается подтверждение'}</strong>
              <span style={{ color: 'var(--text-muted)' }}>
                Секрет: {config?.secret_hint || 'не задан'}.
                {config?.updated_at ? ` Обновлен ${formatDateTime(config.updated_at)}.` : ''}
                {config?.last_used_at ? ` Последний вход: ${formatDateTime(config.last_used_at)}.` : ''}
              </span>
            </div>

            {isPending ? (
              <>
                <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', alignItems: 'start' }}>
                  <div
                    className="glass-panel"
                    style={{
                      display: 'grid',
                      gap: '10px',
                      justifyItems: 'center',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    {config?.otpauth_qr_data_url ? (
                      <img
                        src={config.otpauth_qr_data_url}
                        alt="QR-код для подключения резервного входа"
                        style={{
                          width: 'min(220px, 100%)',
                          aspectRatio: '1 / 1',
                          borderRadius: '16px',
                          background: '#ffffff',
                          padding: '12px',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 'min(220px, 100%)',
                          aspectRatio: '1 / 1',
                          borderRadius: '16px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          display: 'grid',
                          placeItems: 'center',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          padding: '18px'
                        }}
                      >
                        QR-код не удалось подготовить. Используйте ручной секрет ниже.
                      </div>
                    )}
                    <span style={{ color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                      Наведите камеру приложения-аутентификатора на QR-код, и секрет подключится автоматически.
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Секрет для ручного добавления</span>
                      <input
                        type="text"
                        className="input-glass"
                        readOnly={true}
                        value={config?.secret_base32 || ''}
                        style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }}
                      />
                    </label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleCopy(config?.secret_base32 || '', 'Секрет скопирован')}
                        disabled={!config?.secret_base32}
                      >
                        Скопировать секрет
                      </button>
                    </div>
                  </div>
                </div>

                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Подтвердите текущим 6-значным кодом</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="input-glass"
                    placeholder="000000"
                    value={confirmCode}
                    onChange={(event) => setConfirmCode(event.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                    style={{ maxWidth: '180px', letterSpacing: '0.24em', fontFamily: 'monospace' }}
                  />
                </label>
              </>
            ) : null}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {isPending ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirm}
                  disabled={busyAction === 'confirm' || confirmCode.length !== 6}
                >
                  {busyAction === 'confirm' ? 'Проверяем...' : 'Подтвердить код'}
                </button>
              ) : null}
              <button type="button" className="btn" onClick={handleCreateSetup} disabled={busyAction === 'create'}>
                {busyAction === 'create' ? 'Обновляем...' : isEnabled ? 'Перенастроить секрет' : 'Сгенерировать заново'}
              </button>
              <button type="button" className="btn" onClick={handleDelete} disabled={busyAction === 'delete'}>
                {busyAction === 'delete' ? 'Отключаем...' : 'Отключить резервный вход'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
