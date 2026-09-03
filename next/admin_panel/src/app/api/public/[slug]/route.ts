import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jsonObjectSchema } from '@/lib/json-schema'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'

interface Props {
  params: Promise<{ slug: string }>
}

const updatePublicProjectSchema = z
  .object({
    content: jsonObjectSchema.optional(),
    settings: jsonObjectSchema.optional(),
  })
  .strict()
  .refine(
    ({ content, settings }) => content !== undefined || settings !== undefined,
    { message: 'At least one of content or settings is required' }
  )

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
    const validation = updatePublicProjectSchema.parse(await request.json())

    const updateData: Prisma.ProjectUpdateInput = {}
    if (validation.content !== undefined) {
      updateData.content = validation.content as Prisma.InputJsonValue
    }
    if (validation.settings !== undefined) {
      updateData.settings = validation.settings as Prisma.InputJsonValue
    }

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
