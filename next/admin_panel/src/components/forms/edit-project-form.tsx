'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { NavigationGuard } from '@/components/forms/navigation-guard'

interface Project {
  id: string
  name: string
  slug: string
  url: string
  status: string
  description: string | null
  thumbnail: string | null
}

interface EditProjectFormProps {
  project: Project
}

const makeFormData = (project: Project) => ({
  name: project.name,
  slug: project.slug,
  url: project.url,
  description: project.description || '',
  status: project.status,
  thumbnail: project.thumbnail || '',
})

export function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [formData, setFormData] = useState(() => makeFormData(project))
  const [savedData, setSavedData] = useState(() => makeFormData(project))
  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedData)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setSaved(false)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, thumbnail: formData.thumbnail || undefined }),
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Не удалось сохранить настройки')
      }

      setSavedData(formData)
      setSaved(true)
      router.refresh()
      window.setTimeout(() => setSaved(false), 3000)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось сохранить настройки')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Не удалось удалить сайт')
      }
      setDeleteOpen(false)
      router.push('/projects')
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Не удалось удалить сайт')
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <NavigationGuard when={isDirty && !isDeleting} />

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div><p className="font-semibold">Изменения не сохранены</p><p className="mt-1">{error}</p></div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Основные сведения</CardTitle>
          <CardDescription>Эти данные используются в панели и для связи сайта с контентом.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <FormField label="Название" htmlFor="site-name">
            <Input id="site-name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Название сайта" required />
          </FormField>
          <FormField label="Slug" htmlFor="site-slug" description="Строчные латинские буквы, цифры и дефисы.">
            <Input id="site-slug" value={formData.slug} onChange={(event) => setFormData({ ...formData, slug: event.target.value })} placeholder="my-site" required pattern="[a-z0-9-]+" />
          </FormField>
          <FormField label="Публичный URL" htmlFor="site-url">
            <Input id="site-url" value={formData.url} onChange={(event) => setFormData({ ...formData, url: event.target.value })} type="url" required />
          </FormField>
          <FormField label="Статус" htmlFor="site-status">
            <select id="site-status" value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="active">Активен</option>
              <option value="development">В разработке</option>
              <option value="archived">В архиве</option>
            </select>
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Описание" htmlFor="site-description" description="Короткое пояснение для списка и обзора сайта.">
              <textarea id="site-description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} rows={4} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="URL обложки" htmlFor="site-thumbnail" description="Необязательное изображение для карточки сайта.">
              <Input id="site-thumbnail" value={formData.thumbnail} onChange={(event) => setFormData({ ...formData, thumbnail: event.target.value })} type="url" placeholder="https://…" />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Опасная зона</CardTitle>
          <CardDescription>Удаление сайта также удалит связанные страницы, изображения и историю сборок.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)} disabled={isSaving || isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />Удалить сайт
          </Button>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border bg-card/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="flex items-center gap-2 text-sm">
          {saved ? <><CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /><span>Сохранено</span></> : isDirty ? <><span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" /><span>Есть несохранённые изменения</span></> : <span className="text-muted-foreground">Все изменения сохранены</span>}
        </div>
        <Button type="submit" disabled={isSaving || !isDirty}>
          <Save className="mr-2 h-4 w-4" aria-hidden="true" />{isSaving ? 'Сохраняем…' : 'Сохранить изменения'}
        </Button>
      </div>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirmation('') }}
        title="Удалить сайт без возможности восстановления?"
        description={`Будут удалены сайт «${project.name}» и все связанные данные. Для подтверждения введите его название.`}
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>Отмена</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteConfirmation !== project.name || isDeleting}>
              {isDeleting ? 'Удаляем…' : 'Удалить сайт'}
            </Button>
          </>
        }
      >
        <FormField label={`Введите «${project.name}»`} htmlFor="delete-confirmation">
          <Input id="delete-confirmation" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" />
        </FormField>
      </Dialog>
    </form>
  )
}
