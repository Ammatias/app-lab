import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'development', 'archived']).optional(),
  thumbnail: z.string().url().optional(),
})

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params

    const project = await db.project.findUnique({
      where: { id },
      include: {
        pages: true,
        images: true,
        builds: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json(
      { message: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = updateProjectSchema.parse(body)

    const project = await db.project.update({
      where: { id },
      data: validation,
    })

    return NextResponse.json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.issues },
        { status: 400 }
      )
    }

    console.error('Failed to update project:', error)
    return NextResponse.json(
      { message: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params

    await db.project.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Project deleted' })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json(
      { message: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
