import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { EditContentForm } from '@/components/forms/edit-content-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditContentPage({ params }: Props) {
  const { id } = await params

  const project = await db.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      content: true,
      settings: true,
    },
  })

  if (!project) {
    notFound()
  }

  const content = project.content as any || { hero: null, resume: null, projects: [] }
  const settings = project.settings as any || { theme: 'dark', colors: {} }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Content</h1>
          <p className="text-muted-foreground">{project.name}</p>
        </div>
      </div>

      <EditContentForm
        projectSlug={project.slug}
        initialContent={content}
        initialSettings={settings}
      />
    </div>
  )
}
