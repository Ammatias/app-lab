import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const triggerBuildSchema = z.object({
  projectId: z.string().uuid(),
})

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = triggerBuildSchema.parse(body)

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: validation.projectId },
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    // TODO: Get user from session
    const triggeredBy = 'system'

    // Create build record
    const build = await db.build.create({
      data: {
        projectId: validation.projectId,
        status: 'pending',
        triggeredBy,
      },
    })

    // TODO: Trigger actual build process (webhook, CI/CD, etc.)
    // For now, just update status to building
    await db.build.update({
      where: { id: build.id },
      data: {
        status: 'building',
        startedAt: new Date(),
      },
    })

    // Simulate build completion (remove in production)
    setTimeout(async () => {
      await db.build.update({
        where: { id: build.id },
        data: {
          status: 'success',
          endedAt: new Date(),
          logs: 'Build completed successfully',
        },
      })
    }, 5000)

    return NextResponse.json(build, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.issues },
        { status: 400 }
      )
    }

    console.error('Failed to trigger build:', error)
    return NextResponse.json(
      { message: 'Failed to trigger build' },
      { status: 500 }
    )
  }
}
