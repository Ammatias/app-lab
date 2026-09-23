import type { ReactNode } from 'react'

export function FormField({
  label,
  htmlFor,
  description,
  error,
  children,
}: {
  label: string
  htmlFor: string
  description?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">{label}</label>
      {children}
      {description && !error && <p className="text-xs leading-5 text-muted-foreground">{description}</p>}
      {error && <p className="text-xs font-medium text-destructive" role="alert">{error}</p>}
    </div>
  )
}
