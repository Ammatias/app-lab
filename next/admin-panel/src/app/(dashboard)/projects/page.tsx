import Link from 'next/link'
import { Plus } from 'lucide-react'
import { db } from '@/lib/db'
import { ProjectsTable } from '@/components/tables/projects-table'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectsPage() {
  let loadError = false
  let projects: Array<{
    id: string
    name: string
    slug: string
    url: string
    status: string
    siteType: string
    description: string | null
    updatedAt: Date
    _count: { pages: number; images: number; builds: number }
  }> = []

  try {
    projects = await db.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { pages: true, images: true, builds: true } } },
    })
  } catch (error) {
    loadError = true
    console.error('Failed to fetch sites:', error)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Управление"
        title="Сайты"
        description="Все сайты, подключённые к панели, и быстрый доступ к их содержимому и настройкам."
        actions={<Button asChild><Link href="/projects/new"><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Добавить сайт</Link></Button>}
      />
      <ProjectsTable projects={projects} loadError={loadError} />
    </div>
  )
}
