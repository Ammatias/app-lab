'use client'

import { useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function RepeatableCard({
  title,
  subtitle,
  children,
  first,
  last,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  first: boolean
  last: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <article className="rounded-2xl border bg-card">
      <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => setOpen((value) => !value)} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-expanded={open}>
          <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', !open && '-rotate-90')} />
          <span className="min-w-0"><span className="block truncate font-semibold">{title}</span>{subtitle && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{subtitle}</span>}</span>
        </button>
        <div className="flex gap-1 self-end sm:self-auto">
          <Button type="button" variant="ghost" size="icon" onClick={onMoveUp} disabled={first} aria-label="Переместить выше"><ArrowUp className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" onClick={onMoveDown} disabled={last} aria-label="Переместить ниже"><ArrowDown className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" onClick={onDuplicate} aria-label="Дублировать"><Copy className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" onClick={onDelete} aria-label="Удалить"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      {open && <div className="space-y-5 p-4 sm:p-5">{children}</div>}
    </article>
  )
}
