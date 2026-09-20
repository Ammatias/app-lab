'use client'

import { useState } from 'react'
import { AlertCircle, BriefcaseBusiness, CheckCircle2, FileUser, LayoutTemplate, Palette, Plus, Save } from 'lucide-react'
import { NavigationGuard } from '@/components/forms/navigation-guard'
import { PortfolioPreview } from '@/components/editor/portfolio-preview'
import { RepeatableCard } from '@/components/editor/repeatable-card'
import { StringListEditor } from '@/components/editor/string-list-editor'
import type { ContentData, Course, EditorMediaItem, Education, Experience, PortfolioProjectData, SettingsData } from '@/components/editor/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type { ContentData, SettingsData } from '@/components/editor/types'

type Section = 'hero' | 'resume' | 'projects' | 'appearance'

const sections = [
  { id: 'hero' as const, label: 'Главная', description: 'Заголовок и действия', icon: LayoutTemplate },
  { id: 'resume' as const, label: 'Резюме', description: 'Опыт и контакты', icon: FileUser },
  { id: 'projects' as const, label: 'Проекты', description: 'Работы и галереи', icon: BriefcaseBusiness },
  { id: 'appearance' as const, label: 'Оформление', description: 'Тема сайта', icon: Palette },
]

const defaults: ContentData = {
  hero: { title: '', subtitle: '', ctaPrimary: { text: '', href: '' }, ctaSecondary: { text: '', href: '' } },
  resume: { about: '', skills: [], experience: [], education: [], courses: [], contacts: { email: '', github: '', telegram: '', phone: '' } },
  projects: [],
}

const newId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
const move = <T,>(items: T[], index: number, delta: -1 | 1) => {
  const target = index + delta
  if (target < 0 || target >= items.length) return items
  const next = [...items]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export function EditContentForm({
  projectSlug,
  siteUrl,
  initialContent,
  initialSettings,
  availableMedia,
}: {
  projectSlug: string
  siteUrl: string
  initialContent?: ContentData
  initialSettings?: SettingsData
  availableMedia: EditorMediaItem[]
}) {
  const initial = initialContent || defaults
  const initialAppearance: SettingsData = initialSettings || { theme: 'dark', colors: {} }
  const [content, setContent] = useState<ContentData>(initial)
  const [settings, setSettings] = useState<SettingsData>(initialAppearance)
  const [section, setSection] = useState<Section>('hero')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify({ content: initial, settings: initialAppearance }))
  const payload = { content, settings }
  const isDirty = JSON.stringify(payload) !== savedSnapshot

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const response = await fetch(`/api/public/${projectSlug}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || result.error || 'Не удалось сохранить контент')
      setSavedSnapshot(JSON.stringify(payload))
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить контент')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <NavigationGuard when={isDirty} />
      {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">Контент не сохранён</p><p className="mt-1">{error}</p></div></div>}
      {saved && <div aria-live="polite" className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" />Контент сохранён</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="min-w-0 space-y-5">
          <nav aria-label="Разделы контента" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
            {sections.map((item) => {
              const Icon = item.icon
              return <button key={item.id} type="button" onClick={() => setSection(item.id)} aria-current={section === item.id ? 'page' : undefined} className={cn('flex min-h-16 items-center gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', section === item.id ? 'border-primary bg-accent text-accent-foreground' : 'bg-card hover:bg-muted')}><Icon className="h-5 w-5 shrink-0" /><span><span className="block text-sm font-semibold">{item.label}</span><span className="mt-0.5 block text-xs opacity-70">{item.description}</span></span></button>
            })}
          </nav>

          {section === 'hero' && <HeroEditor value={content.hero} onChange={(hero) => setContent({ ...content, hero })} />}
          {section === 'resume' && <ResumeEditor value={content.resume} onChange={(resume) => setContent({ ...content, resume })} />}
          {section === 'projects' && <ProjectsEditor values={content.projects} media={availableMedia} onChange={(projects) => setContent({ ...content, projects })} />}
          {section === 'appearance' && <AppearanceEditor value={settings} onChange={setSettings} />}
        </div>
        <PortfolioPreview content={content} settings={settings} siteUrl={siteUrl} activeSection={section} />
      </div>

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border bg-card/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="flex items-center gap-2 text-sm">{isDirty ? <><span className="h-2 w-2 rounded-full bg-amber-500" /><span>Есть несохранённые изменения</span></> : <span className="text-muted-foreground">Все изменения сохранены</span>}</div>
        <Button type="submit" disabled={saving || !isDirty}><Save className="mr-2 h-4 w-4" />{saving ? 'Сохраняем…' : 'Сохранить контент'}</Button>
      </div>
    </form>
  )
}

function HeroEditor({ value, onChange }: { value: ContentData['hero']; onChange: (value: ContentData['hero']) => void }) {
  return <Card><CardHeader><CardTitle>Главный экран</CardTitle><CardDescription>Первое сообщение, которое видит посетитель.</CardDescription></CardHeader><CardContent className="grid gap-5 md:grid-cols-2"><div className="md:col-span-2"><FormField label="Заголовок" htmlFor="hero-title"><Input id="hero-title" value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} /></FormField></div><div className="md:col-span-2"><FormField label="Подзаголовок" htmlFor="hero-subtitle"><textarea id="hero-subtitle" value={value.subtitle} onChange={(event) => onChange({ ...value, subtitle: event.target.value })} rows={4} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></FormField></div><CtaFields prefix="primary" label="Основное действие" value={value.ctaPrimary} onChange={(ctaPrimary) => onChange({ ...value, ctaPrimary })} /><CtaFields prefix="secondary" label="Дополнительное действие" value={value.ctaSecondary} onChange={(ctaSecondary) => onChange({ ...value, ctaSecondary })} /></CardContent></Card>
}

function CtaFields({ prefix, label, value, onChange }: { prefix: string; label: string; value: { text: string; href: string }; onChange: (value: { text: string; href: string }) => void }) {
  return <fieldset className="space-y-4 rounded-xl border p-4"><legend className="px-1 text-sm font-semibold">{label}</legend><FormField label="Текст кнопки" htmlFor={`${prefix}-text`}><Input id={`${prefix}-text`} value={value.text} onChange={(event) => onChange({ ...value, text: event.target.value })} /></FormField><FormField label="Ссылка" htmlFor={`${prefix}-href`}><Input id={`${prefix}-href`} value={value.href} onChange={(event) => onChange({ ...value, href: event.target.value })} className="font-mono" /></FormField></fieldset>
}

function ResumeEditor({ value, onChange }: { value: ContentData['resume']; onChange: (value: ContentData['resume']) => void }) {
  const updateExperience = (index: number, item: Experience) => onChange({ ...value, experience: value.experience.map((current, itemIndex) => itemIndex === index ? item : current) })
  return <div className="space-y-5">
    <Card><CardHeader><CardTitle>О себе и навыки</CardTitle></CardHeader><CardContent className="space-y-5"><FormField label="О себе" htmlFor="resume-about"><textarea id="resume-about" value={value.about} onChange={(event) => onChange({ ...value, about: event.target.value })} rows={6} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></FormField><StringListEditor label="Навыки" values={value.skills} onChange={(skills) => onChange({ ...value, skills })} placeholder="Например, Docker" /></CardContent></Card>
    <SectionHeading title="Опыт работы" action={() => onChange({ ...value, experience: [...value.experience, { id: newId(), position: '', company: '', period: '', description: [] }] })} />
    {value.experience.map((item, index) => <RepeatableCard key={item.id} title={item.position || `Место работы ${index + 1}`} subtitle={item.company} first={index === 0} last={index === value.experience.length - 1} onMoveUp={() => onChange({ ...value, experience: move(value.experience, index, -1) })} onMoveDown={() => onChange({ ...value, experience: move(value.experience, index, 1) })} onDuplicate={() => onChange({ ...value, experience: [...value.experience.slice(0, index + 1), { ...item, id: newId() }, ...value.experience.slice(index + 1)] })} onDelete={() => onChange({ ...value, experience: value.experience.filter((_, itemIndex) => itemIndex !== index) })}><div className="grid gap-4 md:grid-cols-2"><FormField label="Должность" htmlFor={`position-${item.id}`}><Input id={`position-${item.id}`} value={item.position} onChange={(event) => updateExperience(index, { ...item, position: event.target.value })} /></FormField><FormField label="Организация" htmlFor={`company-${item.id}`}><Input id={`company-${item.id}`} value={item.company} onChange={(event) => updateExperience(index, { ...item, company: event.target.value })} /></FormField><div className="md:col-span-2"><FormField label="Период" htmlFor={`period-${item.id}`}><Input id={`period-${item.id}`} value={item.period} onChange={(event) => updateExperience(index, { ...item, period: event.target.value })} /></FormField></div></div><StringListEditor label="Обязанности и результаты" values={item.description} onChange={(description) => updateExperience(index, { ...item, description })} /></RepeatableCard>)}
    <SimpleRecords title="Образование" items={value.education} kind="education" onChange={(education) => onChange({ ...value, education })} />
    <SimpleRecords title="Курсы" items={value.courses} kind="course" onChange={(courses) => onChange({ ...value, courses })} />
    <Card><CardHeader><CardTitle>Контакты</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">{(['email', 'phone', 'github', 'telegram'] as const).map((field) => <FormField key={field} label={{ email: 'Email', phone: 'Телефон', github: 'GitHub', telegram: 'Telegram' }[field]} htmlFor={`contact-${field}`}><Input id={`contact-${field}`} value={value.contacts[field] || ''} onChange={(event) => onChange({ ...value, contacts: { ...value.contacts, [field]: event.target.value } })} /></FormField>)}</CardContent></Card>
  </div>
}

function SimpleRecords<T extends Education | Course>({ title, items, kind, onChange }: { title: string; items: T[]; kind: 'education' | 'course'; onChange: (items: T[]) => void }) {
  const blank = (kind === 'education' ? { id: newId(), degree: '', institution: '', year: '', specialty: '' } : { id: newId(), title: '', institution: '', year: '', specialty: '' }) as T
  return <div className="space-y-3"><SectionHeading title={title} action={() => onChange([...items, blank])} />{items.map((item, index) => <RepeatableCard key={item.id} title={('degree' in item ? item.degree : item.title) || `${title}: запись ${index + 1}`} subtitle={item.institution} first={index === 0} last={index === items.length - 1} onMoveUp={() => onChange(move(items, index, -1))} onMoveDown={() => onChange(move(items, index, 1))} onDuplicate={() => onChange([...items.slice(0, index + 1), { ...item, id: newId() }, ...items.slice(index + 1)])} onDelete={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}><div className="grid gap-4 md:grid-cols-2"><FormField label={kind === 'education' ? 'Квалификация' : 'Название'} htmlFor={`${kind}-title-${item.id}`}><Input id={`${kind}-title-${item.id}`} value={'degree' in item ? item.degree : item.title} onChange={(event) => onChange(items.map((current, itemIndex) => itemIndex === index ? ({ ...current, [kind === 'education' ? 'degree' : 'title']: event.target.value } as T) : current))} /></FormField><FormField label="Год" htmlFor={`${kind}-year-${item.id}`}><Input id={`${kind}-year-${item.id}`} value={item.year} onChange={(event) => onChange(items.map((current, itemIndex) => itemIndex === index ? { ...current, year: event.target.value } : current))} /></FormField><FormField label="Организация" htmlFor={`${kind}-institution-${item.id}`}><Input id={`${kind}-institution-${item.id}`} value={item.institution} onChange={(event) => onChange(items.map((current, itemIndex) => itemIndex === index ? { ...current, institution: event.target.value } : current))} /></FormField><FormField label="Специальность" htmlFor={`${kind}-specialty-${item.id}`}><Input id={`${kind}-specialty-${item.id}`} value={item.specialty || ''} onChange={(event) => onChange(items.map((current, itemIndex) => itemIndex === index ? { ...current, specialty: event.target.value } : current))} /></FormField></div></RepeatableCard>)}</div>
}

function ProjectsEditor({ values, media, onChange }: { values: PortfolioProjectData[]; media: EditorMediaItem[]; onChange: (values: PortfolioProjectData[]) => void }) {
  const update = (index: number, project: PortfolioProjectData) => onChange(values.map((current, itemIndex) => itemIndex === index ? project : current))
  return <div className="space-y-4"><SectionHeading title="Проекты портфолио" action={() => onChange([...values, { id: newId(), title: '', description: '', fullDescription: '', tech: [], features: [], github: '', demo: '', screenshots: [] }])} />{values.map((project, index) => <RepeatableCard key={project.id} title={project.title || `Проект ${index + 1}`} subtitle={project.description} first={index === 0} last={index === values.length - 1} onMoveUp={() => onChange(move(values, index, -1))} onMoveDown={() => onChange(move(values, index, 1))} onDuplicate={() => onChange([...values.slice(0, index + 1), { ...project, id: newId(), title: `${project.title} — копия` }, ...values.slice(index + 1)])} onDelete={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}><div className="grid gap-4 md:grid-cols-2"><FormField label="Название" htmlFor={`project-title-${project.id}`}><Input id={`project-title-${project.id}`} value={project.title} onChange={(event) => update(index, { ...project, title: event.target.value })} /></FormField><FormField label="Demo URL" htmlFor={`project-demo-${project.id}`}><Input id={`project-demo-${project.id}`} value={project.demo || ''} onChange={(event) => update(index, { ...project, demo: event.target.value })} /></FormField><div className="md:col-span-2"><FormField label="Краткое описание" htmlFor={`project-description-${project.id}`}><textarea id={`project-description-${project.id}`} value={project.description} onChange={(event) => update(index, { ...project, description: event.target.value })} rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></FormField></div><div className="md:col-span-2"><FormField label="Полное описание" htmlFor={`project-full-${project.id}`}><textarea id={`project-full-${project.id}`} value={project.fullDescription || ''} onChange={(event) => update(index, { ...project, fullDescription: event.target.value })} rows={5} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></FormField></div><FormField label="GitHub URL" htmlFor={`project-github-${project.id}`}><Input id={`project-github-${project.id}`} value={project.github || ''} onChange={(event) => update(index, { ...project, github: event.target.value })} /></FormField></div><StringListEditor label="Технологии" values={project.tech || []} onChange={(tech) => update(index, { ...project, tech })} /><StringListEditor label="Ключевые возможности" values={project.features || []} onChange={(features) => update(index, { ...project, features })} /><div className="space-y-3"><StringListEditor label="Изображения проекта" values={project.screenshots || []} onChange={(screenshots) => update(index, { ...project, screenshots })} placeholder="URL изображения" />{media.length > 0 && <select defaultValue="" onChange={(event) => { const url = event.target.value; if (url && !project.screenshots?.includes(url)) update(index, { ...project, screenshots: [...(project.screenshots || []), url] }); event.target.value = '' }} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="" disabled>Добавить из медиатеки…</option>{media.map((image) => <option key={image.id} value={image.url}>{image.alt || image.url}</option>)}</select>}</div></RepeatableCard>)}{values.length === 0 && <Card><CardContent className="p-8 pt-8 text-center text-sm text-muted-foreground sm:p-8 sm:pt-8">Добавьте первый проект, чтобы он появился на сайте и в предпросмотре.</CardContent></Card>}</div>
}

function AppearanceEditor({ value, onChange }: { value: SettingsData; onChange: (value: SettingsData) => void }) {
  return <Card><CardHeader><CardTitle>Оформление</CardTitle><CardDescription>Базовая тема портфолио. Детальная палитра появится вместе со схемой site adapter.</CardDescription></CardHeader><CardContent><FormField label="Тема сайта" htmlFor="portfolio-theme"><select id="portfolio-theme" value={value.theme} onChange={(event) => onChange({ ...value, theme: event.target.value as 'dark' | 'light' })} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="dark">Тёмная</option><option value="light">Светлая</option></select></FormField></CardContent></Card>
}

function SectionHeading({ title, action }: { title: string; action: () => void }) {
  return <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2><Button type="button" variant="outline" size="sm" onClick={action}><Plus className="mr-2 h-4 w-4" />Добавить</Button></div>
}
