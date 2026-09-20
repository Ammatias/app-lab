'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BriefcaseBusiness, LayoutTemplate } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [siteType, setSiteType] = useState<'generic' | 'portfolio'>('generic')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create project')
      }

      router.push('/projects')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Новый сайт</h1>
          <p className="text-muted-foreground">Подключите сайт и выберите подходящий редактор</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Основные данные</CardTitle>
          <CardDescription>Тип определяет структуру контента и доступные поля редактора.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Тип сайта</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: 'generic' as const, title: 'Универсальный', description: 'Главный экран и свободные секции', icon: LayoutTemplate },
                  { value: 'portfolio' as const, title: 'Портфолио', description: 'Резюме, проекты и галереи', icon: BriefcaseBusiness },
                ].map((option) => {
                  const Icon = option.icon
                  const selected = siteType === option.value
                  return <label key={option.value} className={`cursor-pointer rounded-2xl border p-4 transition-colors ${selected ? 'border-primary bg-accent' : 'hover:bg-muted'}`}><input className="sr-only" type="radio" name="siteType" value={option.value} checked={selected} onChange={() => setSiteType(option.value)} /><Icon className="h-5 w-5 text-primary" /><span className="mt-3 block text-sm font-semibold">{option.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span></label>
                })}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Название
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Сайт компании"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug для API
              </label>
              <Input
                id="slug"
                name="slug"
                placeholder="my-project"
                required
                pattern="[a-z0-9-]+"
                title="Только строчные латинские буквы, цифры и дефисы"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                URL
              </label>
              <Input
                id="url"
                name="url"
                placeholder="https://example.com"
                type="url"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Описание
              </label>
              <Input
                id="description"
                name="description"
                placeholder="Короткое внутреннее описание сайта"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Статус
              </label>
              <select
                id="status"
                name="status"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                defaultValue="active"
              >
                <option value="active">Активен</option>
                <option value="development">В разработке</option>
                <option value="archived">В архиве</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Создаём…' : 'Создать сайт'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/projects">Отмена</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
