import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { MediaLibrary } from '@/components/media/media-library'
import { PageHeader } from '@/components/ui/page-header'
import { publicMediaUrl } from '@/lib/media'

export default async function SiteMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const site = await db.project.findUnique({ where: { id }, select: { id: true, images: { orderBy: { createdAt: 'desc' } } } })
  if (!site) notFound()
  const origin = process.env.NEXTAUTH_URL || ''
  const images = site.images.map((image) => ({ ...image, url: publicMediaUrl(origin, image.id) }))

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Сайт" title="Медиа" description="Постоянное хранилище изображений этого сайта. Загруженные файлы доступны редактору контента." />
      <MediaLibrary projectId={site.id} initialImages={images} />
    </div>
  )
}
