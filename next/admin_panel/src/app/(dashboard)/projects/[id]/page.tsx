import Link from 'next/link'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Clock3, ExternalLink, FileText, GitBranch, ImageIcon, RefreshCw, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { getSiteAdapter, getSiteContentSummary } from '@/lib/site-adapters'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SiteOverviewPage({ params }: Props) {
  const { id } = await params
  const site = await db.project.findUnique({
    where: { id },
    include: {
      _count: { select: { images: true, builds: true } },
      builds: { orderBy: { startedAt: 'desc' }, take: 5 },
    },
  })

  if (!site) notFound()

  const formatDate = (date: Date) => new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date)

  const latestBuild = site.builds[0]
  const latestSuccessfulBuild = site.builds.find((build) => build.status === 'success')
  const adapter = getSiteAdapter(site.siteType)
  const contentSummary = getSiteContentSummary(site.siteType, site.content)
  const contentIsValid = Boolean(adapter && adapter.contentSchema.safeParse(site.content).success && adapter.settingsSchema.safeParse(site.settings).success)
  const availability = await checkSiteAvailability(site.url)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Рабочее пространство"
        title="Обзор сайта"
        description={site.description || 'Сводка контента, медиа и последних операций этого сайта.'}
        actions={
          <>
            <Button variant="outline" asChild><Link href={`/projects/${site.id}/settings`}><Settings className="mr-2 h-4 w-4" aria-hidden="true" />Настройки</Link></Button>
            <Button asChild><Link href={`/projects/${site.id}/content`}><FileText className="mr-2 h-4 w-4" aria-hidden="true" />Редактировать контент</Link></Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={FileText} label={contentSummary.label} value={contentSummary.value} note={contentSummary.note} />
        <Metric icon={ImageIcon} label="Медиа" value={site._count.images} note={site._count.images === 0 ? 'библиотека пока пуста' : 'файлов в библиотеке'} />
        <Metric icon={GitBranch} label="Сборки" value={site._count.builds} note={site._count.builds === 0 ? 'runner пока не подключён' : 'записей в истории'} />
        <Metric icon={Clock3} label="Изменён" value={formatDate(site.updatedAt)} note={`slug: ${site.slug}`} compact />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Последние сборки</CardTitle>
            <CardDescription>История только для этого сайта.</CardDescription>
          </CardHeader>
          <CardContent>
            {site.builds.length === 0 ? (
              <EmptyState icon={GitBranch} title="Сборок пока нет" description="История появится после подключения и первого запуска реального runner." />
            ) : (
              <div className="divide-y">
                {site.builds.map((build) => (
                  <Link key={build.id} href={`/builds/${build.id}`} className="flex min-h-14 items-center justify-between gap-4 rounded-lg px-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <div className="min-w-0"><p className="font-medium">{formatDate(build.startedAt)}</p><p className="mt-0.5 text-xs text-muted-foreground">{build.triggeredBy || 'Система'}</p></div>
                    <StatusBadge status={build.status} />
                  </Link>
                ))}
              </div>
            )}
            {site.builds.length > 0 && <Button variant="outline" className="mt-5 w-full" asChild><Link href={`/projects/${site.id}/builds`}>Вся история сайта</Link></Button>}
          </CardContent>
        </Card>

        <Card className="bg-[#18202b] text-white dark:bg-card dark:text-card-foreground">
          <CardHeader>
            <CardTitle>Диагностика публикации</CardTitle>
            <CardDescription className="text-slate-300 dark:text-muted-foreground">Доступность сайта и готовность данных прямо сейчас.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DiagnosticRow label="Публичный URL" note={availability.note} status={availability.online ? 'online' : 'offline'} />
            <DiagnosticRow label="Структура контента" note={adapter ? `Адаптер: ${adapter.label}` : `Неизвестный тип: ${site.siteType}`} status={contentIsValid ? 'valid' : 'invalid'} />
            <DiagnosticRow label="Последняя сборка" note={latestSuccessfulBuild ? formatDate(latestSuccessfulBuild.startedAt) : latestBuild ? 'Успешных сборок нет' : 'Runner не подключён'} status={latestSuccessfulBuild ? 'success' : latestBuild?.status || 'pending'} />
            <div className="flex gap-2 pt-2"><Button variant="secondary" size="sm" asChild><Link href={`/projects/${site.id}`}><RefreshCw className="mr-2 h-4 w-4" />Проверить снова</Link></Button><Button variant="ghost" size="sm" className="text-slate-200 hover:bg-white/10 hover:text-white" asChild><Link href={site.url} target="_blank" rel="noopener noreferrer">Открыть<ExternalLink className="ml-2 h-4 w-4" /></Link></Button></div>
            <p className="pt-1 text-xs leading-5 text-slate-400 dark:text-muted-foreground">Контент публикуется через CMS без отдельной сборки. Запуск появится только после подключения безопасного runner/webhook.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function checkSiteAvailability(url: string) {
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store', redirect: 'follow', signal: AbortSignal.timeout(4000) })
    return { online: response.ok, note: `HTTP ${response.status} · проверено сейчас` }
  } catch {
    return { online: false, note: 'Нет ответа за 4 секунды' }
  }
}

function DiagnosticRow({ label, note, status }: { label: string; note: string; status: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3 dark:border-border dark:bg-muted/40"><div className="min-w-0"><p className="text-sm font-semibold">{label}</p><p className="mt-1 truncate text-xs text-slate-400 dark:text-muted-foreground">{note}</p></div><StatusBadge status={status} /></div>
}

function Metric({
  icon: Icon,
  label,
  value,
  note,
  compact = false,
}: {
  icon: typeof FileText
  label: string
  value: string | number
  note: string
  compact?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-5 pt-5 sm:p-5 sm:pt-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0"><p className="text-sm font-medium text-muted-foreground">{label}</p><p className={compact ? 'mt-2 text-sm font-semibold leading-5' : 'mt-2 text-3xl font-semibold tracking-[-0.04em]'}>{value}</p><p className="mt-1 truncate text-xs text-muted-foreground">{note}</p></div>
      </CardContent>
    </Card>
  )
}
