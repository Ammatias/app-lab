import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { getSiteAdapter, siteTypeSchema } from '@/lib/site-adapters'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  url: z.string().url('Invalid URL'),
  description: z.string().optional(),
  status: z.enum(['active', 'development', 'archived']).optional().default('active'),
  siteType: siteTypeSchema.optional().default('generic'),
})

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            pages: true,
            images: true,
            builds: true,
          },
        },
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { message: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createProjectSchema.parse(body)
    const adapter = getSiteAdapter(validation.siteType)
    if (!adapter) {
      return NextResponse.json({ message: 'Unsupported site type' }, { status: 400 })
    }

    // TODO: Get user ID from session (after auth implementation)
    const userId = 'system' // Temporary placeholder

    const project = await db.project.create({
      data: {
        ...validation,
        userId,
        content: adapter.defaults.content,
        settings: adapter.defaults.settings,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.issues },
        { status: 400 }
      )
    }

    console.error('Failed to create project:', error)
    return NextResponse.json(
      { message: 'Failed to create project' },
      { status: 500 }
    )
  }
}
