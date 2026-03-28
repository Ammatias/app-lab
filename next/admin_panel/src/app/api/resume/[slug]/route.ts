import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

interface Props {
  params: Promise<{ slug: string }>
}

const updateResumeSchema = z.object({
  about: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(z.object({
    id: z.string(),
    position: z.string(),
    company: z.string(),
    period: z.string(),
    description: z.array(z.string()),
  })).optional(),
  education: z.array(z.object({
    id: z.string(),
    degree: z.string(),
    institution: z.string(),
    year: z.string(),
    specialty: z.string().optional(),
  })).optional(),
  courses: z.array(z.object({
    id: z.string(),
    year: z.string(),
    title: z.string(),
    institution: z.string(),
    specialty: z.string().optional(),
  })).optional(),
  contacts: z.object({
    email: z.string().email().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    telegram: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
})

/**
 * GET /api/resume/[slug]
 * 
 * Возвращает данные резюме для проекта
 * Используется Portfolio для получения данных резюме
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params

    const project = await db.project.findUnique({
      where: { slug },
      select: {
        content: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const content = project.content as any
    const resume = content?.resume || null

    return NextResponse.json({
      data: resume,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch resume:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/resume/[slug]
 * 
 * Обновляет данные резюме
 * Используется админ-панелью для сохранения резюме
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params
    const body = await request.json()
    const validation = updateResumeSchema.parse(body)

    const project = await db.project.findUnique({
      where: { slug },
      select: { content: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const content = (project.content as any) || {}
    const updatedContent = {
      ...content,
      resume: validation,
    }

    await db.project.update({
      where: { slug },
      data: { content: updatedContent },
    })

    return NextResponse.json({
      data: validation,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      )
    }

    console.error('Failed to update resume:', error)
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    )
  }
}
