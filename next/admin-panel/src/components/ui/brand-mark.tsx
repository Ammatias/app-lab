import Image from 'next/image'
import { cn } from '@/lib/utils'

const sizes = {
  sm: { frame: 'h-8 w-8 rounded-lg', image: 28 },
  md: { frame: 'h-10 w-10 rounded-xl', image: 36 },
  lg: { frame: 'h-12 w-12 rounded-2xl', image: 44 },
} as const

export function BrandMark({
  size = 'md',
  className,
  priority = false,
}: {
  size?: keyof typeof sizes
  className?: string
  priority?: boolean
}) {
  const preset = sizes[size]

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center bg-[#111821] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]',
        preset.frame,
        className
      )}
      aria-hidden="true"
    >
      <Image
        src="/brand/ammatias-dragon.png"
        alt=""
        width={preset.image}
        height={preset.image}
        className="h-[88%] w-[88%] object-contain"
        priority={priority}
      />
    </span>
  )
}
