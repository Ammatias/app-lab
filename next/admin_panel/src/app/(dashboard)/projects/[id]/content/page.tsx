import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { EditContentForm, type ContentData, type SettingsData } from '@/components/forms/edit-content-form'
import { PageHeader } from '@/components/ui/page-header'
import { EditGenericContentForm } from '@/components/forms/edit-generic-content-form'
import { genericContentSchema, genericSettingsSchema } from '@/lib/site-adapters'
import { publicMediaUrl } from '@/lib/media'

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
      url: true,
      siteType: true,
      content: true,
      settings: true,
      images: { select: { id: true, url: true, alt: true }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!project) {
    notFound()
  }

  const content = (project.content as unknown as ContentData | null) || undefined
  const settings = (project.settings as unknown as SettingsData | null) || undefined
  const origin = process.env.NEXTAUTH_URL || ''
  const availableMedia = project.images.map((image) => ({ ...image, url: publicMediaUrl(origin, image.id) }))

  if (project.siteType === 'generic') {
    const genericContent = genericContentSchema.safeParse(project.content)
    const genericSettings = genericSettingsSchema.safeParse(project.settings)
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Универсальный адаптер" title="Контент" description="Главный экран, свободные секции и оформление сайта с живым предпросмотром." />
        <EditGenericContentForm projectSlug={project.slug} siteUrl={project.url} initialContent={genericContent.success ? genericContent.data : undefined} initialSettings={genericSettings.success ? genericSettings.data : undefined} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Адаптер портфолио" title="Контент" description="Структурированный редактор главной страницы, резюме и проектов с живым предпросмотром." />

      <EditContentForm
        projectSlug={project.slug}
        siteUrl={project.url}
        initialContent={content}
        initialSettings={settings}
        availableMedia={availableMedia}
      />
    </div>
  )
}
