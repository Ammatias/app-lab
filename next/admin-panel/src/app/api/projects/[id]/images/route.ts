import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mediaFilePath, projectMediaDirectory, publicMediaUrl } from '@/lib/media'

const MAX_FILE_SIZE = 8 * 1024 * 1024
const allowedTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Props) {
  const { id } = await params
  const images = await db.image.findMany({ where: { projectId: id }, orderBy: { createdAt: 'desc' } })
  const origin = (process.env.NEXTAUTH_URL || _request.nextUrl.origin).replace(/\/$/, '')
  return NextResponse.json(images.map((image) => ({ ...image, url: publicMediaUrl(origin, image.id) })))
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file')
    const alt = String(formData.get('alt') || '').trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Выберите файл изображения' }, { status: 400 })
    }
    const extension = allowedTypes[file.type]
    if (!extension) {
      return NextResponse.json({ message: 'Поддерживаются JPEG, PNG, WebP, GIF и AVIF' }, { status: 400 })
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'Размер изображения должен быть не больше 8 МБ' }, { status: 400 })
    }

    const site = await db.project.findUnique({ where: { id }, select: { id: true } })
    if (!site) return NextResponse.json({ message: 'Сайт не найден' }, { status: 404 })

    const imageId = randomUUID()
    const filename = `${imageId}.${extension}`
    await mkdir(projectMediaDirectory(id), { recursive: true })
    const targetPath = mediaFilePath(id, filename)
    await writeFile(targetPath, Buffer.from(await file.arrayBuffer()))

    const origin = (process.env.NEXTAUTH_URL || request.nextUrl.origin).replace(/\/$/, '')
    const image = await db.image.create({
      data: {
        id: imageId,
        projectId: id,
        url: publicMediaUrl(origin, imageId),
        path: targetPath,
        size: file.size,
        mimeType: file.type,
        alt: alt || path.parse(file.name).name,
      },
    })
    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Failed to upload image:', error)
    return NextResponse.json({ message: 'Не удалось загрузить изображение' }, { status: 500 })
  }
}
