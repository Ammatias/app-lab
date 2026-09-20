import Link from 'next/link'
import { ArrowLeft, Clock3, GitCommitHorizontal, Timer } from 'lucide-react'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { BuildLogViewer } from '@/components/builds/build-log-viewer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'

interface Props { params: Promise<{ id: string }> }

export default async function BuildLogsPage({ params }: Props) {
  const { id } = await params
  const build = await db.build.findUnique({ where: { id }, include: { project: { select: { name: true, slug: true, id: true } } } })
  if (!build) notFound()
  const seconds = build.endedAt ? Math.max(0, Math.round((build.endedAt.getTime() - build.startedAt.getTime()) / 1000)) : null
  const duration = seconds === null ? 'В процессе' : seconds < 60 ? `${seconds} с` : `${Math.floor(seconds / 60)} мин ${seconds % 60} с`
  const startedAt = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(build.startedAt)

  return <div className="space-y-8"><PageHeader eyebrow={`Сборка · ${build.project.slug}`} title="Технический журнал" description={`Диагностика сборки сайта «${build.project.name}».`} actions={<Button variant="outline" asChild><Link href={`/projects/${build.project.id}/builds`}><ArrowLeft className="mr-2 h-4 w-4" />К истории сайта</Link></Button>} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={GitCommitHorizontal} label="Статус"><StatusBadge status={build.status} /></Metric><Metric icon={Timer} label="Длительность"><p className="font-mono text-lg font-semibold">{duration}</p></Metric><Metric icon={Clock3} label="Запущена"><p className="text-sm font-semibold">{startedAt}</p></Metric><Metric icon={GitCommitHorizontal} label="Источник"><p className="truncate text-sm font-semibold">{build.triggeredBy || 'Система'}</p></Metric></div><BuildLogViewer logs={build.logs} running={build.status === 'building' || build.status === 'pending'} /></div>
}

function Metric({ icon: Icon, label, children }: { icon: typeof Clock3; label: string; children: React.ReactNode }) {
  return <Card><CardContent className="flex items-center gap-3 p-5 pt-5 sm:p-5 sm:pt-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><div className="mt-1">{children}</div></div></CardContent></Card>
}
