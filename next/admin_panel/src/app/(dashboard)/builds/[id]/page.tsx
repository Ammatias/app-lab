import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BuildLogsPage({ params }: Props) {
  const { id } = await params

  const build = await db.build.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  })

  if (!build) {
    notFound()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'building':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const duration = build.endedAt
    ? `${Math.round((build.endedAt.getTime() - build.startedAt.getTime()) / 1000)}s`
    : 'In progress'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/builds">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Build Logs</h1>
          <p className="text-muted-foreground">{build.project.name}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(build.status)}
              <span className="text-2xl font-bold capitalize">{build.status}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{duration}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Triggered By</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{build.triggeredBy || 'System'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Started At</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {new Date(build.startedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[400px] overflow-auto rounded-md bg-muted p-4 text-sm font-mono">
            {build.logs || 'No logs available'}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
