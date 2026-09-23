'use client'

import * as React from 'react'
import { CheckCircle2, DatabaseBackup, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ExportSeedButton() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [notification, setNotification] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)

  React.useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(() => setNotification(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notification])

  const handleExport = async () => {
    setIsLoading(true)
    setNotification(null)
    try {
      const response = await fetch('/api/admin/export-seed', { method: 'POST' })
      const data = await response.json() as { message?: string }
      if (!response.ok) throw new Error(data.message || 'Не удалось создать резервную копию.')
      setNotification({ type: 'success', message: 'Содержимое сохранено в seed.js.' })
    } catch (error: unknown) {
      console.error(error)
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Не удалось создать резервную копию.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Button onClick={handleExport} disabled={isLoading} variant="outline">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <DatabaseBackup className="mr-2 h-4 w-4" aria-hidden="true" />}
        {isLoading ? 'Сохраняем…' : 'Создать копию'}
      </Button>
      <div aria-live="polite" aria-atomic="true" className="min-h-5 text-xs">
        {notification && (
          <p className={notification.type === 'success' ? 'flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300' : 'flex items-center gap-1.5 text-destructive'}>
            {notification.type === 'success' ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <XCircle className="h-4 w-4" aria-hidden="true" />}
            {notification.message}
          </p>
        )}
      </div>
    </div>
  )
}
