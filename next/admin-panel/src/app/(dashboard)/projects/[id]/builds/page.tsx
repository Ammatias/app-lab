import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { BuildsTable } from '@/components/tables/builds-table'
import { PageHeader } from '@/components/ui/page-header'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SiteBuildsPage({ params }: Props) {
  const { id } = await params
  const site = await db.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      builds: { orderBy: { startedAt: 'desc' }, take: 50 },
    },
  })

  if (!site) notFound()

  const builds = site.builds.map((build) => ({
    ...build,
    project: { id: site.id, name: site.name, slug: site.slug },
  }))

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Сайт" title="Сборки" description="История сборок и технические логи выбранного сайта." />
      <BuildsTable builds={builds} />
    </div>
  )
}
