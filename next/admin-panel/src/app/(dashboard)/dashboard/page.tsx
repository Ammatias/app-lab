import Link from 'next/link'
import { AlertCircle, ArrowRight, BriefcaseBusiness, FileText, GitBranch, Globe2, Image as ImageIcon, Plus } from 'lucide-react'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { ExportSeedButton } from '@/components/ExportSeedButton'
import { getSiteContentSummary } from '@/lib/site-adapters'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  let loadError = false
  let stats = { sites: 0, builds: 0, sections: 0, images: 0 }
  let sites: Array<{
    id: string
    name: string
    slug: string
    url: string
    status: string
    siteType: string
    content: unknown
    updatedAt: Date
    _count: { images: number; builds: number }
  }> = []

  try {
    const [siteCount, buildCount, imageCount, siteContent, recentSites] = await Promise.all([
      db.project.count(),
      db.build.count(),
      db.image.count(),
      db.project.findMany({ select: { siteType: true, content: true } }),
      db.project.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { _count: { select: { images: true, builds: true } } },
      }),
    ])
    const sectionCount = siteContent.reduce((total, site) => {
      const value = getSiteContentSummary(site.siteType, site.content).value
      return total + (typeof value === 'number' ? value : 0)
    }, 0)
    stats = { sites: siteCount, builds: buildCount, sections: sectionCount, images: imageCount }
    sites = recentSites
  } catch (error) {
    loadError = true
    console.error('Failed to fetch dashboard data:', error)
  }

  const statCards = [
    { title: 'Сайты', value: stats.sites, icon: Globe2, href: '/projects' },
    { title: 'Сборки', value: stats.builds, icon: GitBranch, href: '/builds' },
    { title: 'Разделы', value: stats.sections, icon: FileText },
    { title: 'Изображения', value: stats.images, icon: ImageIcon },
  ]

  const updatedAt = (date: Date) => new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(date)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Все сайты"
        title="Обзор"
        description="Состояние управляемых сайтов, контента и сборок в одном рабочем пространстве."
        actions={
          <Button asChild>
            <Link href="/projects/new"><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Добавить сайт</Link>
          </Button>
        }
      />

      {loadError ? (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div><p className="font-semibold">Не удалось загрузить сводку</p><p className="mt-1 opacity-90">Проверьте подключение к базе данных и обновите страницу.</p></div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            const content = (
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-primary"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                </CardHeader>
                <CardContent><p className="text-3xl font-semibold tracking-tight">{stat.value}</p></CardContent>
              </Card>
            )
            return stat.href ? <Link key={stat.title} href={stat.href} className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{content}</Link> : <div key={stat.title}>{content}</div>
          })}
        </div>
      )}

      <section aria-labelledby="recent-sites-title" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div><h2 id="recent-sites-title" className="text-xl font-semibold">Недавно изменённые сайты</h2><p className="mt-1 text-sm text-muted-foreground">Быстрый возврат к текущей работе.</p></div>
          <Button variant="ghost" asChild><Link href="/projects">Все сайты<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button>
        </div>

        {sites.length === 0 && !loadError ? (
          <EmptyState
            icon={Globe2}
            title="Добавьте первый сайт"
            description="После добавления здесь появятся статус, содержимое и история изменений сайта."
            action={<Button asChild><Link href="/projects/new">Добавить сайт</Link></Button>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sites.map((site) => {
              const contentSummary = getSiteContentSummary(site.siteType, site.content)
              return (
              <Card key={site.id}>
                <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:pt-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">{site.siteType === 'portfolio' ? <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" /> : <Globe2 className="h-6 w-6" aria-hidden="true" />}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{site.name}</h3><StatusBadge status={site.status} /></div>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{site.url}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Изменён {updatedAt(site.updatedAt)} · разделов: {contentSummary.value} · {site._count.images} медиа</p>
                  </div>
                  <Button variant="outline" size="sm" asChild><Link href={`/projects/${site.id}`}>Открыть</Link></Button>
                </CardContent>
              </Card>
              )
            })}
          </div>
        )}
      </section>

      <Card>
        <CardHeader><CardTitle>Резервная копия содержимого</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Сохранить текущее состояние сайтов и контента в серверный seed-файл.</p>
          <ExportSeedButton />
        </CardContent>
      </Card>
    </div>
  )
}
