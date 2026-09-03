import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

interface Props {
  params: Promise<{ slug: string }>
}

const updateHeroSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaPrimary: z.object({
    text: z.string().optional(),
    href: z.string().optional(),
  }).optional(),
  ctaSecondary: z.object({
    text: z.string().optional(),
    href: z.string().optional(),
  }).optional(),
})

/**
 * GET /api/hero/[slug]
 * 
 * Возвращает данные Hero секции для проекта
 * Используется Portfolio для получения данных Hero
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
    const hero = content?.hero || null

    return NextResponse.json({
      data: hero,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch hero:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/hero/[slug]
 * 
 * Обновляет данные Hero секции
 * Используется админ-панелью для сохранения Hero данных
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params
    const body = await request.json()
    const validation = updateHeroSchema.parse(body)

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
      hero: validation,
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

    console.error('Failed to update hero:', error)
    return NextResponse.json(
      { error: 'Failed to update hero' },
      { status: 500 }
    )
  }
}
