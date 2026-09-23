'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, Plus, Save } from 'lucide-react'
import { NavigationGuard } from '@/components/forms/navigation-guard'
import { GenericPreview } from '@/components/editor/generic-preview'
import { RepeatableCard } from '@/components/editor/repeatable-card'
import { StringListEditor } from '@/components/editor/string-list-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { genericDefaults, type GenericContentData, type GenericSettingsData } from '@/lib/site-adapters'

const newId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
const move = <T,>(items: T[], index: number, delta: -1 | 1) => { const target = index + delta; if (target < 0 || target >= items.length) return items; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; return next }

export function EditGenericContentForm({ projectSlug, siteUrl, initialContent, initialSettings }: { projectSlug: string; siteUrl: string; initialContent?: GenericContentData; initialSettings?: GenericSettingsData }) {
  const [content, setContent] = useState(initialContent || genericDefaults.content)
  const [settings, setSettings] = useState(initialSettings || genericDefaults.settings)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [snapshot, setSnapshot] = useState(() => JSON.stringify({ content: initialContent || genericDefaults.content, settings: initialSettings || genericDefaults.settings }))
  const payload = { content, settings }
  const dirty = JSON.stringify(payload) !== snapshot

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null); setSaved(false)
    try {
      const response = await fetch(`/api/public/${projectSlug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.message || 'Не удалось сохранить контент')
      setSnapshot(JSON.stringify(payload)); setSaved(true); window.setTimeout(() => setSaved(false), 3000)
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить контент') } finally { setSaving(false) }
  }

  const updateSection = (index: number, section: GenericContentData['sections'][number]) => setContent({ ...content, sections: content.sections.map((item, itemIndex) => itemIndex === index ? section : item) })

  return <form onSubmit={save} className="space-y-6">
    <NavigationGuard when={dirty} />
    {error && <div role="alert" className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle className="h-5 w-5 shrink-0" /><div><p className="font-semibold">Контент не сохранён</p><p className="mt-1">{error}</p></div></div>}
    {saved && <div aria-live="polite" className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" />Контент сохранён</div>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <div className="min-w-0 space-y-5">
        <Card><CardHeader><CardTitle>Главный экран</CardTitle><CardDescription>Первое сообщение и основное действие страницы.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><FormField label="Надзаголовок" htmlFor="generic-eyebrow"><Input id="generic-eyebrow" value={content.hero.eyebrow} onChange={(event) => setContent({ ...content, hero: { ...content.hero, eyebrow: event.target.value } })} /></FormField><FormField label="Текст кнопки" htmlFor="generic-action-label"><Input id="generic-action-label" value={content.hero.primaryAction.label} onChange={(event) => setContent({ ...content, hero: { ...content.hero, primaryAction: { ...content.hero.primaryAction, label: event.target.value } } })} /></FormField><div className="md:col-span-2"><FormField label="Заголовок" htmlFor="generic-title"><Input id="generic-title" value={content.hero.title} onChange={(event) => setContent({ ...content, hero: { ...content.hero, title: event.target.value } })} /></FormField></div><div className="md:col-span-2"><FormField label="Краткое описание" htmlFor="generic-summary"><textarea id="generic-summary" rows={4} value={content.hero.summary} onChange={(event) => setContent({ ...content, hero: { ...content.hero, summary: event.target.value } })} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></FormField></div><div className="md:col-span-2"><FormField label="Ссылка кнопки" htmlFor="generic-action-href"><Input id="generic-action-href" className="font-mono" value={content.hero.primaryAction.href} onChange={(event) => setContent({ ...content, hero: { ...content.hero, primaryAction: { ...content.hero.primaryAction, href: event.target.value } } })} /></FormField></div></CardContent></Card>
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold">Разделы страницы</h2><p className="text-sm text-muted-foreground">Меняйте порядок, копируйте и удаляйте блоки.</p></div><Button type="button" variant="outline" size="sm" onClick={() => setContent({ ...content, sections: [...content.sections, { id: newId(), title: '', body: '', items: [] }] })}><Plus className="mr-2 h-4 w-4" />Добавить</Button></div>
        {content.sections.map((section, index) => <RepeatableCard key={section.id} title={section.title || `Раздел ${index + 1}`} first={index === 0} last={index === content.sections.length - 1} onMoveUp={() => setContent({ ...content, sections: move(content.sections, index, -1) })} onMoveDown={() => setContent({ ...content, sections: move(content.sections, index, 1) })} onDuplicate={() => setContent({ ...content, sections: [...content.sections.slice(0, index + 1), { ...section, id: newId(), title: `${section.title} — копия` }, ...content.sections.slice(index + 1)] })} onDelete={() => setContent({ ...content, sections: content.sections.filter((_, itemIndex) => itemIndex !== index) })}><div className="space-y-4"><FormField label="Название" htmlFor={`section-title-${section.id}`}><Input id={`section-title-${section.id}`} value={section.title} onChange={(event) => updateSection(index, { ...section, title: event.target.value })} /></FormField><FormField label="Описание" htmlFor={`section-body-${section.id}`}><textarea id={`section-body-${section.id}`} rows={5} value={section.body} onChange={(event) => updateSection(index, { ...section, body: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></FormField><StringListEditor label="Пункты" values={section.items} onChange={(items) => updateSection(index, { ...section, items })} /></div></RepeatableCard>)}
        <Card><CardHeader><CardTitle>Оформление</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><FormField label="Тема" htmlFor="generic-theme"><select id="generic-theme" value={settings.theme} onChange={(event) => setSettings({ ...settings, theme: event.target.value as 'light' | 'dark' })} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="light">Светлая</option><option value="dark">Тёмная</option></select></FormField><FormField label="Акцентный цвет" htmlFor="generic-accent"><Input id="generic-accent" type="color" value={settings.accent} onChange={(event) => setSettings({ ...settings, accent: event.target.value })} className="h-10 p-1" /></FormField></CardContent></Card>
      </div>
      <GenericPreview content={content} settings={settings} siteUrl={siteUrl} />
    </div>
    <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border bg-card/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between"><div aria-live="polite" className="flex items-center gap-2 text-sm">{dirty ? <><span className="h-2 w-2 rounded-full bg-amber-500" />Есть несохранённые изменения</> : <span className="text-muted-foreground">Все изменения сохранены</span>}</div><Button type="submit" disabled={saving || !dirty}><Save className="mr-2 h-4 w-4" />{saving ? 'Сохраняем…' : 'Сохранить контент'}</Button></div>
  </form>
}
