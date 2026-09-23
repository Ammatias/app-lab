import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { mediaFilePath } from '@/lib/media'

const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
}

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string; filename: string }> }) {
  try {
    const { projectId, filename } = await params
    if (!/^[a-zA-Z0-9-]+$/.test(projectId) || !/^[a-f0-9-]+\.(?:jpg|png|webp|gif|avif)$/.test(filename)) {
      return new NextResponse('Not found', { status: 404 })
    }
    const body = await readFile(mediaFilePath(projectId, filename))
    return new NextResponse(body, {
      headers: {
        'Content-Type': mimeTypes[path.extname(filename)] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
