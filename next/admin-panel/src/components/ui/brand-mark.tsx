import { PanelsTopLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizes = {
  sm: { frame: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4' },
  md: { frame: 'h-10 w-10 rounded-xl', icon: 'h-5 w-5' },
  lg: { frame: 'h-12 w-12 rounded-2xl', icon: 'h-6 w-6' },
} as const

export function BrandMark({
  size = 'md',
  className,
}: {
  size?: keyof typeof sizes
  className?: string
  priority?: boolean
}) {
  const preset = sizes[size]

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center bg-primary text-primary-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]',
        preset.frame,
        className
      )}
      aria-hidden="true"
    >
      <PanelsTopLeft className={preset.icon} />
    </span>
  )
}
