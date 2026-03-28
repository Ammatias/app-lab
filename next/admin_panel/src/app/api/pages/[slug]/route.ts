import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

interface Props {
  params: Promise<{ slug: string }>
}

const updatePageSchema = z.object({
  title: z.string().optional(),
})

/**
 * GET /api/pages/[slug]
 * 
 * Возвращает данные страницы по slug
 * Используется для получения контента страниц (resume, about, etc.)
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params

    // Получаем slug из query параметров или из URL
    const { searchParams } = new URL(request.url)
    const projectSlug = searchParams.get('project') || 'portfolio'

    const project = await db.project.findUnique({
      where: { slug: projectSlug },
      include: {
        pages: {
          where: { slug: `/${slug}` },
        },
      },
    })

    const page = project?.pages?.[0]

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        updatedAt: page.updatedAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/pages/[slug]
 * 
 * Обновляет данные страницы
 * Используется админ-панелью для сохранения контента
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params
    const body = await request.json()
    const validation = updatePageSchema.parse(body)

    const { searchParams } = new URL(request.url)
    const projectSlug = searchParams.get('project') || 'portfolio'

    // Находим проект
    const project = await db.project.findUnique({
      where: { slug: projectSlug },
      include: {
        pages: {
          where: { slug: `/${slug}` },
        },
      },
    })

    const page = project?.pages?.[0]

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    // Обновляем страницу (content передаём напрямую без валидации Zod)
    const { content, ...rest } = body
    const updateData: any = { ...validation, ...rest }
    if (content) {
      updateData.content = content
    }

    const updatedPage = await db.page.update({
      where: { id: page.id },
      data: updateData,
    })

    return NextResponse.json({
      data: {
        id: updatedPage.id,
        slug: updatedPage.slug,
        title: updatedPage.title,
        content: updatedPage.content,
        updatedAt: updatedPage.updatedAt,
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

    console.error('Failed to update page:', error)
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    )
  }
}
