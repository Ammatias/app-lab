'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  actions?: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    returnFocusRef.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    focusable?.[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
        return
      }

      if (event.key !== 'Tab' || !focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      returnFocusRef.current?.focus()
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[#11151c]/65 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-label="Закрыть диалог"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
        className="relative z-10 w-full max-w-lg rounded-2xl border bg-card p-6 text-card-foreground shadow-2xl"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3"
          onClick={() => onOpenChange(false)}
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="pr-10">
          <h2 id="dialog-title" className="text-xl font-semibold tracking-[-0.02em]">{title}</h2>
          {description && <p id="dialog-description" className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}
        </div>
        {children && <div className="mt-5">{children}</div>}
        {actions && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{actions}</div>}
      </div>
    </div>
  )
}
