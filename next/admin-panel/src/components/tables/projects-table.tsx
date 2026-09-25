'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, BriefcaseBusiness, ExternalLink, FileText, Globe2, Pencil, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Site {
  id: string
  name: string
  slug: string
  url: string
  status: string
  siteType: string
  description: string | null
  updatedAt: Date | string
  _count: { pages: number; images: number; builds: number }
}

export function ProjectsTable({ projects, loadError = false }: { projects: Site[]; loadError?: boolean }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const filteredSites = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru')
    return projects.filter((site) => {
      const matchesQuery = !normalizedQuery || `${site.name} ${site.slug} ${site.url}`.toLocaleLowerCase('ru').includes(normalizedQuery)
      return matchesQuery && (status === 'all' || site.status === status)
    })
  }, [projects, query, status])

  const formatDate = (date: Date | string) => new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))

  if (loadError) {
    return (
      <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div><p className="font-semibold">Не удалось загрузить сайты</p><p className="mt-1 opacity-90">Проверьте подключение к базе данных и обновите страницу.</p></div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={Globe2}
        title="Сайтов пока нет"
        description="Добавьте первый сайт, чтобы управлять его содержимым, медиа и сборками из одной панели."
        action={<Button asChild><Link href="/projects/new"><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Добавить сайт</Link></Button>}
      />
    )
  }

  return (
    <section aria-label="Список сайтов" className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по названию, slug или URL" aria-label="Поиск сайтов" className="border-0 bg-muted pl-9 shadow-none" />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Фильтр по статусу"
          className="h-10 rounded-xl border border-input bg-card px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="development">В разработке</option>
          <option value="archived">В архиве</option>
        </select>
        <p className="px-2 text-sm text-muted-foreground">{filteredSites.length} из {projects.length}</p>
      </div>

      {filteredSites.length === 0 ? (
        <EmptyState icon={Search} title="Ничего не найдено" description="Измените запрос или сбросьте фильтр по статусу." action={<Button variant="outline" onClick={() => { setQuery(''); setStatus('all') }}>Сбросить фильтры</Button>} />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
            <Table>
              <TableHeader><TableRow><TableHead className="pl-5">Сайт</TableHead><TableHead>Статус</TableHead><TableHead>Содержимое</TableHead><TableHead>Изменён</TableHead><TableHead className="pr-5 text-right">Действия</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-primary">{site.siteType === 'portfolio' ? <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" /> : <Globe2 className="h-5 w-5" aria-hidden="true" />}</span><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate font-semibold">{site.name}</p><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{site.siteType === 'portfolio' ? 'Портфолио' : 'Универсальный'}</span></div><p className="truncate font-mono text-xs text-muted-foreground">{site.url}</p></div></div>
                    </TableCell>
                    <TableCell><StatusBadge status={site.status} /></TableCell>
                    <TableCell><p className="text-sm">{site._count.pages} стр. · {site._count.images} медиа</p><p className="mt-0.5 text-xs text-muted-foreground">{site._count.builds} сборок</p></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(site.updatedAt)}</TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild><Link href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`Открыть сайт ${site.name}`} title="Открыть сайт"><ExternalLink className="h-4 w-4" aria-hidden="true" /></Link></Button>
                        <Button variant="ghost" size="icon" asChild><Link href={`/projects/${site.id}/content`} aria-label={`Редактировать контент ${site.name}`} title="Редактировать контент"><FileText className="h-4 w-4" aria-hidden="true" /></Link></Button>
                        <Button variant="ghost" size="icon" asChild><Link href={`/projects/${site.id}/settings`} aria-label={`Настройки сайта ${site.name}`} title="Настройки сайта"><Pencil className="h-4 w-4" aria-hidden="true" /></Link></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredSites.map((site) => (
              <article key={site.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-primary">{site.siteType === 'portfolio' ? <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" /> : <Globe2 className="h-5 w-5" aria-hidden="true" />}</span><div className="min-w-0 flex-1"><h2 className="truncate font-semibold">{site.name}</h2><p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{site.siteType === 'portfolio' ? 'Портфолио' : 'Универсальный'}</p><p className="truncate font-mono text-xs text-muted-foreground">{site.url}</p></div><StatusBadge status={site.status} /></div>
                {site.description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">{site.description}</p>}
                <div className="mt-4 flex items-center justify-between border-t pt-4"><p className="text-xs text-muted-foreground">Изменён {formatDate(site.updatedAt)}</p><div className="flex gap-1"><Button variant="ghost" size="icon" asChild><Link href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`Открыть сайт ${site.name}`}><ExternalLink className="h-4 w-4" aria-hidden="true" /></Link></Button><Button variant="outline" size="sm" asChild><Link href={`/projects/${site.id}`}>Управлять</Link></Button></div></div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
