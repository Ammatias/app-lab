import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Folders, GitBranch, FileText, Image as ImageIcon } from 'lucide-react'
import { ExportSeedButton } from '@/components/ExportSeedButton'

// Отключаем кэширование для динамических данных
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  let stats = {
    projects: 0,
    builds: 0,
    pages: 0,
    images: 0,
  }

  try {
    const [projects, builds, pages, images] = await Promise.all([
      db.project.count(),
      db.build.count(),
      db.page.count(),
      db.image.count(),
    ])

    stats = { projects, builds, pages, images }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
  }

  const statCards = [
    {
      title: 'Projects',
      description: 'Total projects managed',
      value: stats.projects,
      icon: Folders,
    },
    {
      title: 'Builds',
      description: 'Total builds triggered',
      value: stats.builds,
      icon: GitBranch,
    },
    {
      title: 'Pages',
      description: 'Content pages edited',
      value: stats.pages,
      icon: FileText,
    },
    {
      title: 'Images',
      description: 'Media files uploaded',
      value: stats.images,
      icon: ImageIcon,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Admin Panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full md:col-span-4">
          <CardHeader>
            <CardTitle>System Actions</CardTitle>
            <CardDescription>
              Save the current live content, resume configurations, and projects directly into the database seed script (<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">prisma/seed.js</code>).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExportSeedButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
