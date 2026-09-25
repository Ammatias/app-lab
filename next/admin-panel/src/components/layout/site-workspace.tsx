'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BriefcaseBusiness, ExternalLink, FileText, Gauge, GitBranch, Globe2, Images, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'

const sections = [
  { segment: '', label: 'Обзор', icon: Gauge },
  { segment: '/content', label: 'Контент', icon: FileText },
  { segment: '/media', label: 'Медиа', icon: Images },
  { segment: '/builds', label: 'Сборки', icon: GitBranch },
  { segment: '/settings', label: 'Настройки', icon: Settings },
]

export function SiteWorkspace({
  site,
  children,
}: {
  site: { id: string; name: string; slug: string; url: string; status: string; siteType: string }
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const basePath = `/projects/${site.id}`
  const SiteIcon = site.siteType === 'portfolio' ? BriefcaseBusiness : Globe2

  return (
    <div className="space-y-6">
      <nav aria-label="Хлебные крошки" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/projects" className="rounded-md hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Сайты</Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-foreground" aria-current="page">{site.name}</span>
      </nav>

      <section className="overflow-hidden rounded-2xl border bg-card" aria-label={`Рабочее пространство сайта ${site.name}`}>
        <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true" />
          <div className="flex min-w-0 items-center gap-3 pl-2">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <SiteIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-semibold tracking-[-0.02em] sm:text-xl">{site.name}</h1>
                <StatusBadge status={site.status} />
                <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{site.siteType === 'portfolio' ? 'Портфолио' : 'Универсальный'}</span>
              </div>
              <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{site.url}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={site.url} target="_blank" rel="noopener noreferrer">
              Открыть сайт
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <nav aria-label="Разделы сайта" className="flex gap-1 overflow-x-auto border-t px-3 py-2">
          {sections.map((section) => {
            const href = `${basePath}${section.segment}`
            const active = section.segment ? pathname.startsWith(href) : pathname === basePath
            const Icon = section.icon
            return (
              <Link
                key={section.label}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {section.label}
              </Link>
            )
          })}
        </nav>
      </section>

      {children}
    </div>
  )
}
