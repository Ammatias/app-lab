import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createSeedBackup, type SeedBackupSnapshot } from '@/lib/seed-backup'

export async function POST() {
  let temporaryPath: string | null = null

  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const [users, projects, pages, images, builds] = await db.$transaction([
      db.user.findMany({ orderBy: { id: 'asc' } }),
      db.project.findMany({ orderBy: { id: 'asc' } }),
      db.page.findMany({ orderBy: { id: 'asc' } }),
      db.image.findMany({ orderBy: { id: 'asc' } }),
      db.build.findMany({ orderBy: { id: 'asc' } }),
    ], {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    })

    const snapshot: SeedBackupSnapshot = {
      generatedAt: new Date().toISOString(),
      users,
      projects,
      pages,
      images,
      builds,
    }
    const seedContent = createSeedBackup(snapshot)
    const seedPath = path.join(process.cwd(), 'prisma', 'seed.js')
    temporaryPath = `${seedPath}.${randomUUID()}.tmp`

    await fs.writeFile(temporaryPath, seedContent, { encoding: 'utf-8', mode: 0o600 })
    await fs.rename(temporaryPath, seedPath)
    temporaryPath = null

    const counts = {
      users: users.length,
      projects: projects.length,
      pages: pages.length,
      images: images.length,
      builds: builds.length,
    }

    return NextResponse.json({
      message: `Seed обновлён. Сайтов: ${projects.length}; страниц: ${pages.length}; записей медиатеки: ${images.length}; сборок: ${builds.length}.`,
      counts,
      generatedAt: snapshot.generatedAt,
      mediaFilesIncluded: false,
    })
  } catch (error: unknown) {
    if (temporaryPath) {
      await fs.rm(temporaryPath, { force: true }).catch(() => undefined)
    }
    console.error('Failed to export seed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { message: 'Failed to export database state', error: errorMessage },
      { status: 500 }
    )
  }
}
