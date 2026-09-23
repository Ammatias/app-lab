import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Props {
  params: Promise<{ slug: string }>
}

/**
 * GET /api/public/[slug]/content
 * 
 * Возвращает контент проекта (projects, resume, hero, settings)
 * Используется для интеграции с Portfolio
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params

    const project = await db.project.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        content: true,
        settings: true,
        updatedAt: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Возвращаем контент в формате ожидаемом Portfolio
    return NextResponse.json({
      data: project.content || {
        projects: [],
        resume: null,
        hero: null,
      },
      settings: project.settings || {
        theme: 'dark',
        colors: {},
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch project content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
