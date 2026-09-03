import { db } from '@/lib/db'
import { BuildsTable } from '@/components/tables/builds-table'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

// Отключаем кэширование для динамических данных
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BuildsPage() {
  let builds: any[] = []

  try {
    builds = await db.build.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: {
        project: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Failed to fetch builds:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Builds</h1>
          <p className="text-muted-foreground">Build history and logs</p>
        </div>
      </div>

      <BuildsTable builds={builds} />
    </div>
  )
}
