import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { EditProjectForm } from '@/components/forms/edit-project-form'
import { PageHeader } from '@/components/ui/page-header'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SiteSettingsPage({ params }: Props) {
  const { id } = await params
  const project = await db.project.findUnique({ where: { id } })
  if (!project) notFound()

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Сайт" title="Настройки" description="Название, адрес, статус и системные параметры сайта." />
      <EditProjectForm project={project} />
    </div>
  )
}
