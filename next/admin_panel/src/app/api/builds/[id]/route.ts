import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params

    const build = await db.build.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!build) {
      return NextResponse.json(
        { message: 'Build not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(build)
  } catch (error) {
    console.error('Failed to fetch build:', error)
    return NextResponse.json(
      { message: 'Failed to fetch build' },
      { status: 500 }
    )
  }
}
