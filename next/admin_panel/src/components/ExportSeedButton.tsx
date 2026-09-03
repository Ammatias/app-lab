'use client'

import * as React from 'react'
import { Button } from './ui/button'
import { Download, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react'

export function ExportSeedButton() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleExport = async () => {
    setIsLoading(true)
    setNotification(null)

    try {
      const response = await fetch('/api/admin/export-seed', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      setNotification({
        type: 'success',
        message: 'Database state successfully backed up to seed.js!',
      })
    } catch (error: any) {
      console.error(error)
      setNotification({
        type: 'error',
        message: error.message || 'Failed to export database state.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={handleExport}
        disabled={isLoading}
        className="w-full md:w-auto relative overflow-hidden transition-all duration-300 transform active:scale-98 flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg shadow-lg hover:shadow-emerald-500/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Exporting Data...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            <span>Backup current data to seed.js</span>
          </>
        )}
      </Button>

      {/* Premium custom floating notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-sm w-full">
          <div className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
              : 'bg-destructive/10 border-destructive/20 text-destructive-foreground'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {notification.message}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-lg hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
