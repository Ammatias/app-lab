'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ChevronsUpDown } from 'lucide-react'
import type { SidebarSite } from '@/components/layout/sidebar'

export function SiteSwitcher({ sites, onNavigate }: { sites: SidebarSite[]; onNavigate?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const selectedSite = sites.find((site) => pathname.includes(site.id))

  const handleChange = (value: string) => {
    onNavigate?.()
    if (value === 'new') {
      router.push('/projects/new')
      return
    }

    const section = pathname.match(/^\/projects\/[^/]+(\/(?:content|media|builds|settings))/)?.[1] || ''
    router.push(`/projects/${value}${section}`)
  }

  return (
    <div className="relative">
      <select
        aria-label="Выбрать сайт"
        value={selectedSite?.id ?? ''}
        onChange={(event) => handleChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/10 pl-3 pr-10 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <option value="" disabled className="bg-[#18202b]">{sites.length ? 'Выберите сайт' : 'Сайтов пока нет'}</option>
        {sites.map((site) => (
          <option key={site.id} value={site.id} className="bg-[#18202b]">{site.name}</option>
        ))}
        <option value="new" className="bg-[#18202b]">＋ Добавить сайт</option>
      </select>
      <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
    </div>
  )
}
