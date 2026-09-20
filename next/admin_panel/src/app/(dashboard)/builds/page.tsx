import { db } from '@/lib/db'
import { BuildsTable } from '@/components/tables/builds-table'
import { PageHeader } from '@/components/ui/page-header'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BuildsPage() {
  let loadError = false
  let builds: Array<{
    id: string
    status: string
    logs: string | null
    triggeredBy: string | null
    startedAt: Date
    endedAt: Date | null
    project: { name: string; slug: string }
  }> = []

  try {
    builds = await db.build.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: { project: { select: { name: true, slug: true } } },
    })
  } catch (error) {
    loadError = true
    console.error('Failed to fetch builds:', error)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="История"
        title="Сборки"
        description="Результаты и логи последних сборок всех подключённых сайтов. Запуск сборок появится после подключения реального runner."
      />
      <BuildsTable builds={builds} loadError={loadError} />
    </div>
  )
}
