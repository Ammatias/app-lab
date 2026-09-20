'use client'

import { useRef, useState } from 'react'
import { Check, Copy, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'

export interface MediaItem {
  id: string
  url: string
  path: string
  size: number
  mimeType: string
  alt: string | null
  createdAt: Date | string
}

export function MediaLibrary({ projectId, initialImages }: { projectId: string; initialImages: MediaItem[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [images, setImages] = useState(initialImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteImage, setDeleteImage] = useState<MediaItem | null>(null)

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setUploading(true)
    setError(null)
    try {
      const response = await fetch(`/api/projects/${projectId}/images`, { method: 'POST', body: new FormData(event.currentTarget) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Не удалось загрузить изображение')
      setImages((current) => [result, ...current])
      formRef.current?.reset()
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Не удалось загрузить изображение')
    } finally {
      setUploading(false)
    }
  }

  async function remove() {
    if (!deleteImage) return
    setError(null)
    const response = await fetch(`/api/projects/${projectId}/images/${deleteImage.id}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) {
      setError(result.message || 'Не удалось удалить изображение')
      return
    }
    setImages((current) => current.filter((image) => image.id !== deleteImage.id))
    setDeleteImage(null)
  }

  async function copyUrl(image: MediaItem) {
    await navigator.clipboard.writeText(image.url)
    setCopiedId(image.id)
    window.setTimeout(() => setCopiedId(null), 2000)
  }

  const formatSize = (size: number) => size < 1024 * 1024 ? `${Math.round(size / 1024)} КБ` : `${(size / 1024 / 1024).toFixed(1)} МБ`

  return (
    <div className="space-y-6">
      <form ref={formRef} onSubmit={upload} className="grid gap-4 rounded-2xl border bg-card p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <FormField label="Изображение" htmlFor="media-file" description="JPEG, PNG, WebP, GIF или AVIF, до 8 МБ.">
          <Input id="media-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" required />
        </FormField>
        <FormField label="Альтернативный текст" htmlFor="media-alt" description="Опишите изображение для доступности.">
          <Input id="media-alt" name="alt" placeholder="Главный экран проекта" />
        </FormField>
        <Button type="submit" disabled={uploading}>{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}{uploading ? 'Загружаем…' : 'Загрузить'}</Button>
      </form>

      {error && <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {images.length === 0 ? (
        <EmptyState icon={ImagePlus} title="Медиатека пуста" description="Загрузите изображения, чтобы использовать их в галереях и карточках сайта." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {images.map((image) => (
            <article key={image.id} className="overflow-hidden rounded-2xl border bg-card">
              <div className="aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.alt || ''} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-semibold">{image.alt || 'Без описания'}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{formatSize(image.size)} · {image.mimeType.replace('image/', '').toUpperCase()}</p>
                <div className="mt-4 flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => copyUrl(image)}>
                    {copiedId === image.id ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}{copiedId === image.id ? 'Скопировано' : 'Копировать URL'}
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteImage(image)} aria-label={`Удалить ${image.alt || 'изображение'}`}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={Boolean(deleteImage)} onOpenChange={(open) => { if (!open) setDeleteImage(null) }} title="Удалить изображение?" description="Файл исчезнет из медиатеки. Ссылки на него в сохранённом контенте перестанут работать." actions={<><Button type="button" variant="outline" onClick={() => setDeleteImage(null)}>Отмена</Button><Button type="button" variant="destructive" onClick={remove}>Удалить изображение</Button></>} />
    </div>
  )
}
