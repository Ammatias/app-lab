import { readFile } from 'node:fs/promises'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mediaIdFromToken, storedMediaFilePath } from '@/lib/media'

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const id = mediaIdFromToken(token)
    if (!id) return new NextResponse('Not found', { status: 404 })

    const image = await db.image.findUnique({
      where: { id },
      select: { path: true, mimeType: true },
    })
    if (!image) return new NextResponse('Not found', { status: 404 })

    const body = await readFile(storedMediaFilePath(image.path))
    return new NextResponse(body, {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
