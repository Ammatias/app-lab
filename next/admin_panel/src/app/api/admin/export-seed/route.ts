import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // 1. Check authorization
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch the portfolio project
    const project = await db.project.findUnique({
      where: { slug: 'portfolio' },
      select: {
        id: true,
        name: true,
        slug: true,
        url: true,
        status: true,
        content: true,
        settings: true,
        userId: true,
      }
    })

    if (!project) {
      return NextResponse.json({ message: 'Portfolio project not found in database' }, { status: 404 })
    }

    // 3. Generate seed.js content
    const seedContent = `const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Ensure 'system' user exists
  const systemUser = await db.user.upsert({
    where: { email: 'system@local' },
    update: {},
    create: {
      id: 'system',
      email: 'system@local',
      name: 'System',
    },
  })
  console.log('System user ensured:', systemUser)

  // 2. Prepare portfolio content data
  const content = ${JSON.stringify(project.content, null, 2)}

  // 3. Upsert the Portfolio Project
  const portfolioProject = await db.project.upsert({
    where: { slug: 'portfolio' },
    update: {
      name: ${JSON.stringify(project.name)},
      url: ${JSON.stringify(project.url)},
      userId: ${JSON.stringify(project.userId || 'system')},
      content: content,
      settings: ${JSON.stringify(project.settings || { theme: 'dark', colors: {} })}
    },
    create: {
      id: ${JSON.stringify(project.id)},
      name: ${JSON.stringify(project.name)},
      slug: 'portfolio',
      url: ${JSON.stringify(project.url)},
      userId: ${JSON.stringify(project.userId || 'system')},
      content: content,
      settings: ${JSON.stringify(project.settings || { theme: 'dark', colors: {} })}
    }
  })
  console.log('Portfolio project ensured:', portfolioProject)
  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
`

    // 4. Write to seed.js file
    const seedPath = path.join(process.cwd(), 'prisma', 'seed.js')
    await fs.writeFile(seedPath, seedContent, 'utf-8')

    return NextResponse.json({ message: 'Backup successfully written to seed.js' })
  } catch (error: any) {
    console.error('Failed to export seed:', error)
    return NextResponse.json(
      { message: 'Failed to export database state', error: error.message },
      { status: 500 }
    )
  }
}
