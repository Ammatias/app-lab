import { cn } from '@/lib/utils'

const labels: Record<string, string> = {
  active: 'Активен',
  development: 'В разработке',
  archived: 'В архиве',
  success: 'Успешно',
  failed: 'Ошибка',
  building: 'Выполняется',
  pending: 'Ожидает',
  online: 'Доступен',
  offline: 'Недоступен',
  valid: 'Данные корректны',
  invalid: 'Нужна проверка',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        status === 'active' || status === 'success' || status === 'online' || status === 'valid'
          ? 'border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300'
          : status === 'development' || status === 'building' || status === 'pending'
            ? 'border-amber-600/20 bg-amber-600/10 text-amber-700 dark:text-amber-300'
            : status === 'failed' || status === 'offline' || status === 'invalid'
              ? 'border-destructive/20 bg-destructive/10 text-destructive'
              : 'border-border bg-muted text-muted-foreground'
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {labels[status] ?? status}
    </span>
  )
}
