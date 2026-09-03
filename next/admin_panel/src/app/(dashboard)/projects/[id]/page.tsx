import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { EditProjectForm } from '@/components/forms/edit-project-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params

  const project = await db.project.findUnique({
    where: { id },
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground">{project.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/projects/${project.id}/content`}>
            <FileText className="mr-2 h-4 w-4" />
            Edit Content
          </Link>
        </Button>
      </div>

      <EditProjectForm project={project} />
    </div>
  )
}
