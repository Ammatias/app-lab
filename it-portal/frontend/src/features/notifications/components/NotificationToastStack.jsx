import { useEffect } from 'react'
import { BellRing, CheckCheck, EyeOff, ShieldAlert, TriangleAlert, Info } from 'lucide-react'

const SNOOZE_OPTIONS = [
  { days: 1, label: '1д' },
  { days: 3, label: '3д' },
  { days: 7, label: '7д' },
  { days: 30, label: '30д' }
]

function priorityMeta(priority) {
  if (priority === 'critical') {
    return {
      icon: ShieldAlert,
      color: '#fda4af',
      border: 'rgba(248, 113, 113, 0.28)',
      background: 'linear-gradient(180deg, rgba(56, 22, 30, 0.94), rgba(31, 13, 18, 0.96))'
    }
  }

  if (priority === 'warning') {
    return {
      icon: TriangleAlert,
      color: '#fde047',
      border: 'rgba(250, 204, 21, 0.22)',
      background: 'linear-gradient(180deg, rgba(58, 44, 18, 0.94), rgba(35, 27, 12, 0.96))'
    }
  }

  return {
    icon: Info,
    color: '#93c5fd',
    border: 'rgba(96, 165, 250, 0.22)',
    background: 'linear-gradient(180deg, rgba(23, 38, 62, 0.94), rgba(13, 22, 40, 0.96))'
  }
}

export function NotificationToastStack({ toasts, onDismiss, onOpen, onMarkRead, onHide }) {
  useEffect(() => {
    const timers = toasts.map((toast) => (
      window.setTimeout(() => onDismiss(toast.notification_id), 22000)
    ))

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [toasts, onDismiss])

  if (!toasts.length) return null

  return (
    <div className="portal-toast-stack portal-toast-stack-notifications">
      {toasts.map((toast) => {
        const meta = priorityMeta(toast.priority)
        const Icon = meta.icon

        return (
          <div
            key={toast.notification_id}
            className="portal-toast-card portal-toast-card-notification"
            style={{ background: meta.background, borderColor: meta.border }}
          >
            <div className="portal-toast-head portal-toast-head-notification">
              <div className="portal-toast-badge" style={{ color: meta.color }}>
                <Icon size={14} /> {toast.priority === 'critical' ? 'Критично' : toast.priority === 'warning' ? 'Внимание' : 'Инфо'}
              </div>
              <button className="portal-toast-close" onClick={() => onDismiss(toast.notification_id)}>×</button>
            </div>

            <div className="portal-toast-body portal-toast-body-notification">
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>

            <div className="portal-toast-actions portal-toast-actions-notification">
              <button className="btn btn-primary compact" onClick={() => onOpen(toast)}>
                <BellRing size={14} /> Открыть
              </button>
              {!toast.is_read && (
                <button className="btn btn-secondary compact" onClick={() => onMarkRead(toast)}>
                  <CheckCheck size={14} /> Прочитано
                </button>
              )}
              <div className="portal-toast-snooze-row portal-toast-snooze-row-notification">
                <span className="portal-toast-snooze-label"><EyeOff size={13} /> Позже</span>
                {SNOOZE_OPTIONS.map((option) => (
                  <button
                    key={option.days}
                    className="btn btn-secondary compact"
                    onClick={() => onHide(toast, option.days)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
