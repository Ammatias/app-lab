import { AppShell } from '@/components/layout/app-shell'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let sites: Array<{ id: string; name: string; slug: string; status: string }> = []

  try {
    sites = await db.project.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, status: true },
    })
  } catch (error) {
    console.error('Failed to load sites for navigation:', error)
  }

  return <AppShell sites={sites}>{children}</AppShell>
}
