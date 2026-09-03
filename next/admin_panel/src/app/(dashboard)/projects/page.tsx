import { db } from '@/lib/db'
import { ProjectsTable } from '@/components/tables/projects-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

// Отключаем кэширование для динамических данных
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectsPage() {
  let projects: any[] = []

  try {
    projects = await db.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            pages: true,
            images: true,
            builds: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <ProjectsTable projects={projects} />
    </div>
  )
}
