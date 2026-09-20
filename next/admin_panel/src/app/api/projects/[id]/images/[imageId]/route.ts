import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { MEDIA_ROOT } from '@/lib/media'

interface Props {
  params: Promise<{ id: string; imageId: string }>
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const { id, imageId } = await params
    const image = await db.image.findFirst({ where: { id: imageId, projectId: id } })
    if (!image) return NextResponse.json({ message: 'Изображение не найдено' }, { status: 404 })

    await db.image.delete({ where: { id: imageId } })
    const resolvedPath = path.resolve(image.path)
    if (resolvedPath.startsWith(`${path.resolve(MEDIA_ROOT)}${path.sep}`)) {
      await unlink(resolvedPath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error
      })
    }
    return NextResponse.json({ message: 'Изображение удалено' })
  } catch (error) {
    console.error('Failed to delete image:', error)
    return NextResponse.json({ message: 'Не удалось удалить изображение' }, { status: 500 })
  }
}
