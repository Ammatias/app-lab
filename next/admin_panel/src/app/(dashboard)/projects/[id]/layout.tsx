import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { SiteWorkspace } from '@/components/layout/site-workspace'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const site = await db.project.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, url: true, status: true, siteType: true },
  })

  if (!site) notFound()

  return <SiteWorkspace site={site}>{children}</SiteWorkspace>
}
