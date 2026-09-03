import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const builds = await db.build.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: {
        project: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(builds)
  } catch (error) {
    console.error('Failed to fetch builds:', error)
    return NextResponse.json(
      { message: 'Failed to fetch builds' },
      { status: 500 }
    )
  }
}
