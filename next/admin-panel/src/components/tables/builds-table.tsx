'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, GitBranch, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Build {
  id: string
  status: string
  logs: string | null
  triggeredBy: string | null
  startedAt: Date | string
  endedAt: Date | string | null
  project: { name: string; slug: string }
}

const formatDate = (date: Date | string) => new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
}).format(new Date(date))

const duration = (build: Build) => {
  if (!build.endedAt) return 'В процессе'
  const seconds = Math.max(0, Math.round((new Date(build.endedAt).getTime() - new Date(build.startedAt).getTime()) / 1000))
  if (seconds < 60) return `${seconds} с`
  return `${Math.floor(seconds / 60)} мин ${seconds % 60} с`
}

export function BuildsTable({ builds, loadError = false }: { builds: Build[]; loadError?: boolean }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [period, setPeriod] = useState('all')
  const [openedAt] = useState(() => Date.now())
  const filteredBuilds = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru')
    const periodMs = period === 'day' ? 86_400_000 : period === 'week' ? 604_800_000 : period === 'month' ? 2_592_000_000 : null
    return builds.filter((build) => {
      const matchesQuery = !normalizedQuery || `${build.project.name} ${build.project.slug} ${build.triggeredBy || ''}`.toLocaleLowerCase('ru').includes(normalizedQuery)
      return matchesQuery && (status === 'all' || build.status === status) && (periodMs === null || openedAt - new Date(build.startedAt).getTime() <= periodMs)
    })
  }, [builds, openedAt, period, query, status])

  if (loadError) return <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><div><p className="font-semibold">Не удалось загрузить историю сборок</p><p className="mt-1 opacity-90">Проверьте подключение к базе данных и обновите страницу.</p></div></div>
  if (builds.length === 0) return <EmptyState icon={GitBranch} title="История сборок пуста" description="Здесь появятся результаты после подключения и первого запуска реального механизма сборки." />

  return <section aria-label="История сборок" className="space-y-4">
    <div className="grid gap-3 rounded-2xl border bg-card p-3 md:grid-cols-[minmax(15rem,1fr)_auto_auto_auto] md:items-center">
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Сайт, slug или источник" aria-label="Поиск сборок" className="border-0 bg-muted pl-9 shadow-none" /></div>
      <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Фильтр сборок по статусу" className="h-10 rounded-xl border border-input bg-card px-3 text-sm"><option value="all">Все статусы</option><option value="success">Успешные</option><option value="failed">С ошибкой</option><option value="building">Выполняются</option><option value="pending">Ожидают</option></select>
      <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Фильтр сборок по периоду" className="h-10 rounded-xl border border-input bg-card px-3 text-sm"><option value="all">За всё время</option><option value="day">24 часа</option><option value="week">7 дней</option><option value="month">30 дней</option></select>
      <p className="px-2 text-sm text-muted-foreground">{filteredBuilds.length} из {builds.length}</p>
    </div>

    {filteredBuilds.length === 0 ? <EmptyState icon={Search} title="Сборки не найдены" description="Измените запрос, статус или период." action={<Button variant="outline" onClick={() => { setQuery(''); setStatus('all'); setPeriod('all') }}>Сбросить фильтры</Button>} /> : <>
      <div className="hidden overflow-hidden rounded-2xl border bg-card lg:block"><Table><TableHeader><TableRow><TableHead className="pl-5">Сайт</TableHead><TableHead>Статус</TableHead><TableHead>Источник</TableHead><TableHead>Запущена</TableHead><TableHead>Длительность</TableHead><TableHead className="pr-5 text-right">Логи</TableHead></TableRow></TableHeader><TableBody>{filteredBuilds.map((build) => <TableRow key={build.id}><TableCell className="pl-5"><p className="font-semibold">{build.project.name}</p><p className="font-mono text-xs text-muted-foreground">{build.project.slug}</p></TableCell><TableCell><StatusBadge status={build.status} /></TableCell><TableCell className="text-muted-foreground">{build.triggeredBy || 'Система'}</TableCell><TableCell className="text-muted-foreground">{formatDate(build.startedAt)}</TableCell><TableCell className="font-mono text-xs">{duration(build)}</TableCell><TableCell className="pr-5 text-right"><Button variant="ghost" size="sm" asChild><Link href={`/builds/${build.id}`}>Открыть логи</Link></Button></TableCell></TableRow>)}</TableBody></Table></div>
      <div className="grid gap-3 lg:hidden">{filteredBuilds.map((build) => <article key={build.id} className="rounded-2xl border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{build.project.name}</h2><p className="mt-1 font-mono text-xs text-muted-foreground">{build.project.slug}</p></div><StatusBadge status={build.status} /></div><dl className="mt-4 grid grid-cols-2 gap-3 border-y py-3 text-sm"><div><dt className="text-xs text-muted-foreground">Запущена</dt><dd className="mt-1">{formatDate(build.startedAt)}</dd></div><div><dt className="text-xs text-muted-foreground">Длительность</dt><dd className="mt-1 font-mono text-xs">{duration(build)}</dd></div><div><dt className="text-xs text-muted-foreground">Источник</dt><dd className="mt-1">{build.triggeredBy || 'Система'}</dd></div><div><dt className="text-xs text-muted-foreground">Лог</dt><dd className="mt-1">{build.logs ? `${build.logs.split('\n').length} строк` : 'Нет данных'}</dd></div></dl><Button variant="outline" className="mt-4 w-full" asChild><Link href={`/builds/${build.id}`}>Открыть логи</Link></Button></article>)}</div>
    </>}
  </section>
}
