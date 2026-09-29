import { LogIn, Server, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { loginWithBackupCode } from '../lib/session'

export function LoginScreen() {
  const [backupCode, setBackupCode] = useState('')
  const [backupLoading, setBackupLoading] = useState(false)
  const [backupError, setBackupError] = useState('')

  const handleBackupLogin = async (event) => {
    event.preventDefault()
    setBackupLoading(true)
    setBackupError('')

    try {
      await loginWithBackupCode(backupCode)
      window.location.reload()
    } catch (error) {
      setBackupError(error.message || 'Не удалось войти по резервному коду')
    } finally {
      setBackupLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
      <motion.div
        className="glass-panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ padding: '40px 36px', maxWidth: '520px', width: '100%' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <Server color="var(--accent)" size={60} style={{ marginBottom: '20px' }} />
          <h1 style={{ marginBottom: '10px' }}>IT Portal Demo</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Доступ только для доверенных администраторов.</p>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1.05rem', padding: '15px' }}
            onClick={() => { window.location.href = '/api/auth/login' }}
          >
            <LogIn size={22} style={{ marginRight: '10px' }} /> Войти через Authentik
          </button>

          <div className="glass-panel" style={{ padding: '18px', display: 'grid', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="portal-profile-avatar">
                <Shield size={16} />
              </span>
              <div style={{ fontWeight: 700 }}>Вход 2FA</div>
            </div>

            <form onSubmit={handleBackupLogin} style={{ display: 'grid', gap: '12px' }}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="input-glass"
                placeholder="000000"
                value={backupCode}
                onChange={(event) => {
                  setBackupError('')
                  setBackupCode(event.target.value.replace(/[^\d]/g, '').slice(0, 6))
                }}
                style={{ letterSpacing: '0.28em', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.15rem' }}
              />

              {backupError ? (
                <div style={{ color: '#ffb4b4', fontSize: '0.92rem' }}>{backupError}</div>
              ) : null}

              <button
                type="submit"
                className="btn"
                style={{ width: '100%' }}
                disabled={backupLoading || backupCode.length !== 6}
              >
                {backupLoading ? 'Проверяем код...' : 'Войти по резервному коду'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
