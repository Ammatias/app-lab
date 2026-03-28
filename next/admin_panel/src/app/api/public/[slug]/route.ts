import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

interface Props {
  params: Promise<{ slug: string }>
}

const updatePublicProjectSchema = z.object({})

/**
 * GET /api/public/[slug]
 * 
 * Возвращает публичные данные проекта для Portfolio
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params

    const project = await db.project.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        url: true,
        status: true,
        thumbnail: true,
        content: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            pages: true,
            images: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: project,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/public/[slug]
 * 
 * Обновляет контент и настройки проекта (для Portfolio)
 * Используется для обновления данных из админ-панели
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params
    const body = await request.json()

    // Валидация пустая, проверяем только что body это объект
    const validation = updatePublicProjectSchema.parse(body)

    // Извлекаем content и settings из body для передачи в Prisma
    const { content, settings } = body
    const updateData: any = {}
    if (content !== undefined) updateData.content = content
    if (settings !== undefined) updateData.settings = settings

    const project = await db.project.update({
      where: { slug },
      data: updateData,
    })

    return NextResponse.json({
      data: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        content: project.content,
        settings: project.settings,
        updatedAt: project.updatedAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      )
    }

    console.error('Failed to update project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}
