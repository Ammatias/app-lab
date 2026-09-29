import { AlertTriangle, CheckCircle2, CircleX, Info, RefreshCw, Server } from 'lucide-react'

function toastMeta(kind) {
  if (kind === 'success') {
    return {
      icon: CheckCircle2,
      label: 'Готово',
      color: '#86efac',
      border: 'rgba(74, 222, 128, 0.3)',
      background: 'linear-gradient(180deg, rgba(22, 58, 36, 0.96), rgba(12, 34, 20, 0.98))'
    }
  }

  if (kind === 'warning') {
    return {
      icon: AlertTriangle,
      label: 'Проверка',
      color: '#fcd34d',
      border: 'rgba(250, 204, 21, 0.3)',
      background: 'linear-gradient(180deg, rgba(58, 44, 18, 0.96), rgba(35, 27, 12, 0.98))'
    }
  }

  if (kind === 'error') {
    return {
      icon: CircleX,
      label: 'Ошибка',
      color: '#fca5a5',
      border: 'rgba(248, 113, 113, 0.3)',
      background: 'linear-gradient(180deg, rgba(62, 25, 30, 0.96), rgba(38, 14, 18, 0.98))'
    }
  }
  if (kind === 'frontend') {
    return {
      icon: RefreshCw,
      label: 'Фронтенд',
      color: '#86efac',
      border: 'rgba(74, 222, 128, 0.24)',
      background: 'linear-gradient(180deg, rgba(22, 58, 36, 0.94), rgba(12, 34, 20, 0.96))'
    }
  }

  if (kind === 'backend') {
    return {
      icon: Server,
      label: 'Бэкенд',
      color: '#fcd34d',
      border: 'rgba(250, 204, 21, 0.24)',
      background: 'linear-gradient(180deg, rgba(58, 44, 18, 0.94), rgba(35, 27, 12, 0.96))'
    }
  }

  return {
    icon: Info,
    label: 'Система',
    color: '#93c5fd',
    border: 'rgba(96, 165, 250, 0.22)',
    background: 'linear-gradient(180deg, rgba(23, 38, 62, 0.94), rgba(13, 22, 40, 0.96))'
  }
}

export function SystemUpdateToastStack({ toasts, onDismiss, onAction }) {
  if (!toasts.length) return null

  return (
    <div className="portal-toast-stack portal-toast-stack-system">
      {toasts.map((toast) => {
        const meta = toastMeta(toast.kind)
        const Icon = meta.icon

        return (
          <div
            key={toast.key}
            className="portal-toast-card portal-toast-card-system"
            style={{ background: meta.background, borderColor: meta.border }}
          >
            <div className="portal-toast-head portal-toast-head-system">
              <div className="portal-toast-badge" style={{ color: meta.color }}>
                <Icon size={14} /> {meta.label}
              </div>
              <button
                type="button"
                className="portal-toast-close portal-toast-close-system"
                aria-label="Закрыть системное уведомление"
                onClick={() => onDismiss(toast.key)}
              >
                ×
              </button>
            </div>

            <div className="portal-toast-body portal-toast-body-system">
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>

            {toast.actionLabel ? (
              <div className="portal-toast-actions portal-toast-actions-system">
                <button
                  type="button"
                  className="btn btn-secondary compact"
                  onClick={() => onAction?.(toast)}
                >
                  {toast.actionLabel}
                </button>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
