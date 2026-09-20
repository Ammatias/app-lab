'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe2, GitBranch, LayoutDashboard, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SiteSwitcher } from '@/components/layout/site-switcher'
import { BrandMark } from '@/components/ui/brand-mark'

export interface SidebarSite {
  id: string
  name: string
  slug: string
  status: string
}

const navigation = [
  { href: '/dashboard', label: 'Обзор', icon: LayoutDashboard },
  { href: '/projects', label: 'Сайты', icon: Globe2 },
  { href: '/builds', label: 'Сборки', icon: GitBranch },
]

function SidebarContent({ sites, onNavigate }: { sites: SidebarSite[]; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-[#18202b] text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <BrandMark />
          <span>
            <span className="block text-sm font-semibold leading-none">Ammatias</span>
            <span className="mt-1 block text-[11px] text-slate-400">панель сайтов</span>
          </span>
        </Link>
      </div>

      <div className="border-b border-white/10 p-4">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Текущий сайт</p>
        <SiteSwitcher sites={sites} onNavigate={onNavigate} />
      </div>

      <nav aria-label="Основная навигация" className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
                active ? 'bg-white text-[#18202b]' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-500" aria-disabled="true">
          <Settings className="h-[18px] w-[18px]" aria-hidden="true" />
          Настройки
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide">скоро</span>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({
  sites,
  mobileOpen,
  onMobileClose,
}: {
  sites: SidebarSite[]
  mobileOpen: boolean
  onMobileClose: () => void
}) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] border-r border-black/10 lg:block">
        <SidebarContent sites={sites} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label="Закрыть меню"
            onClick={onMobileClose}
          />
          <aside className="relative h-full w-[min(19rem,88vw)] shadow-2xl">
            <button
              type="button"
              onClick={onMobileClose}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <SidebarContent sites={sites} onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  )
}
