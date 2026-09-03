import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Folders, GitBranch, FileText, Image } from 'lucide-react'

const stats = [
  {
    title: 'Projects',
    description: 'Total projects managed',
    value: '0',
    icon: Folders,
  },
  {
    title: 'Builds',
    description: 'Total builds triggered',
    value: '0',
    icon: GitBranch,
  },
  {
    title: 'Pages',
    description: 'Content pages edited',
    value: '0',
    icon: FileText,
  },
  {
    title: 'Images',
    description: 'Media files uploaded',
    value: '0',
    icon: Image,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Admin Panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
    </div>
  )
}
