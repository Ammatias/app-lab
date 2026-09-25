'use client'

import { useState } from 'react'
import { ExternalLink, Monitor, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ContentData, SettingsData } from '@/components/editor/types'
import { cn } from '@/lib/utils'

export type PortfolioPreviewSection = 'hero' | 'resume' | 'projects' | 'appearance'

export function PortfolioPreview({ content, settings, siteUrl, activeSection }: { content: ContentData; settings: SettingsData; siteUrl: string; activeSection: PortfolioPreviewSection }) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const dark = settings.theme === 'dark'
  return (
    <aside className="xl:sticky xl:top-6 xl:self-start" aria-label="Предпросмотр сайта">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex gap-1">
            <Button type="button" size="icon" variant={device === 'desktop' ? 'secondary' : 'ghost'} onClick={() => setDevice('desktop')} aria-label="Предпросмотр на компьютере"><Monitor className="h-4 w-4" /></Button>
            <Button type="button" size="icon" variant={device === 'mobile' ? 'secondary' : 'ghost'} onClick={() => setDevice('mobile')} aria-label="Предпросмотр на телефоне"><Smartphone className="h-4 w-4" /></Button>
          </div>
          <Button variant="ghost" size="sm" asChild><a href={siteUrl} target="_blank" rel="noopener noreferrer">Открыть сайт<ExternalLink className="ml-2 h-4 w-4" /></a></Button>
        </div>
        <div className="overflow-auto bg-muted p-3">
          <div className={cn('mx-auto min-h-[34rem] overflow-hidden rounded-xl border shadow-sm transition-[max-width] duration-300', device === 'mobile' ? 'max-w-[22rem]' : 'max-w-full', dark ? 'bg-[#0d1117] text-white' : 'bg-white text-[#18202b]')}>
            <div className="border-b border-current/10 px-5 py-3 text-xs font-semibold">ПОРТФОЛИО</div>
            <div aria-live="polite" aria-atomic="true">
              {activeSection === 'hero' && <HeroPreview content={content} />}
              {activeSection === 'resume' && <ResumePreview content={content} />}
              {activeSection === 'projects' && <ProjectsPreview content={content} />}
              {activeSection === 'appearance' && <AppearancePreview content={content} settings={settings} />}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">Предпросмотр следует за выбранным разделом и показывает изменения до сохранения. Точные анимации и стили проверяйте на опубликованном сайте.</p>
    </aside>
  )
}

function HeroPreview({ content }: { content: ContentData }) {
  const focusedProject = content.projects.find((project) => project.id === content.workContext.featuredProjectId) ?? content.projects.at(-1)
  return <section className="px-5 py-10 sm:px-8"><PreviewEyebrow>Главная</PreviewEyebrow><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{content.hero.title || 'Заголовок сайта'}</h2><p className="mt-4 max-w-xl text-sm leading-6 opacity-70">{content.hero.subtitle || 'Краткое описание специализации и ценности.'}</p><div className="mt-6 flex flex-wrap gap-2"><span className="rounded-lg bg-[#4657d9] px-3 py-2 text-xs font-semibold text-white">{content.hero.ctaPrimary.text || 'Основное действие'}</span><span className="rounded-lg border border-current/20 px-3 py-2 text-xs">{content.hero.ctaSecondary.text || 'Дополнительное действие'}</span></div><div className="mt-7 rounded-2xl border border-current/10 bg-current/[0.03] p-4"><div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em]"><span>{content.workContext.title || 'Рабочий контур'}</span><span className="text-emerald-400">● {content.workContext.status || 'online'}</span></div><p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7d8cff]">{content.workContext.focusLabel || 'Сейчас в фокусе'}</p><p className="mt-1 text-sm font-semibold">{focusedProject?.title || 'Последний проект'}</p><div className="mt-3 border-t border-current/10">{content.workContext.layers.slice(0, 4).map((layer, index) => <div key={layer.id} className="flex justify-between gap-3 border-b border-current/10 py-2 text-[10px]"><span className="font-semibold">{String(index + 1).padStart(2, '0')} · {layer.label}</span><span className="text-right opacity-60">{layer.value}</span></div>)}</div>{content.workContext.note && <p className="mt-3 text-[10px] leading-4 opacity-60">{content.workContext.note}</p>}</div><div className="mt-8 border-t border-current/10 pt-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-55">Обо мне</p><p className="mt-3 text-sm leading-6 opacity-70">{content.homeProfile.about || 'Отдельное описание для главной страницы.'}</p><div className="mt-4 flex flex-wrap gap-1.5">{content.homeProfile.competencies.slice(0, 8).map((skill) => <span key={skill} className="rounded-full bg-current/10 px-2.5 py-1 text-[10px] font-medium">{skill}</span>)}</div></div></section>
}

function ResumePreview({ content }: { content: ContentData }) {
  const resume = content.resume
  return <section className="px-5 py-8 sm:px-8"><PreviewEyebrow>Резюме</PreviewEyebrow><h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Опыт и компетенции</h2><p className="mt-4 text-sm leading-6 opacity-70">{resume.about || 'Краткий рассказ о специалисте появится здесь.'}</p><div className="mt-5 flex flex-wrap gap-1.5">{resume.skills.slice(0, 8).map((skill) => <span key={skill} className="rounded-full bg-current/10 px-2.5 py-1 text-[10px] font-medium">{skill}</span>)}</div><div className="mt-7 space-y-3">{resume.experience.slice(0, 3).map((item) => <article key={item.id} className="border-l-2 border-[#4657d9] pl-4"><p className="text-sm font-semibold">{item.position || 'Должность'}</p><p className="mt-1 text-xs opacity-60">{item.company || 'Организация'} · {item.period || 'Период'}</p></article>)}{resume.experience.length === 0 && <p className="rounded-xl border border-dashed border-current/20 p-4 text-xs opacity-60">Добавьте опыт работы — он появится здесь.</p>}</div><div className="mt-7 border-t border-current/10 pt-4 text-xs opacity-65"><p>{resume.contacts.email || 'email@example.com'}</p>{resume.contacts.phone && <p className="mt-1">{resume.contacts.phone}</p>}</div></section>
}

function ProjectsPreview({ content }: { content: ContentData }) {
  return <section className="px-5 py-8 sm:px-8"><div className="flex items-end justify-between"><div><PreviewEyebrow>Практика</PreviewEyebrow><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Проекты</h2></div><span className="font-mono text-xs opacity-50">{content.projects.length}</span></div><div className="mt-5 grid gap-3">{content.projects.slice(0, 4).map((project, index) => <article key={project.id} className="rounded-xl border border-current/10 p-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-50">Case {String(index + 1).padStart(2, '0')}</p><p className="mt-2 font-semibold">{project.title || 'Без названия'}</p><dl className="mt-3 grid gap-2 text-xs"><div><dt className="font-mono uppercase tracking-[0.12em] opacity-45">Задача</dt><dd className="mt-1 line-clamp-2 leading-5 opacity-70">{project.description || 'Описание задачи'}</dd></div>{project.role && <div><dt className="font-mono uppercase tracking-[0.12em] opacity-45">Роль</dt><dd className="mt-1 opacity-70">{project.role}</dd></div>}{project.result && <div><dt className="font-mono uppercase tracking-[0.12em] opacity-45">Результат</dt><dd className="mt-1 line-clamp-2 opacity-70">{project.result}</dd></div>}</dl></article>)}{content.projects.length === 0 && <p className="rounded-xl border border-dashed border-current/20 p-4 text-xs opacity-60">Добавьте проект — карточка появится здесь.</p>}</div></section>
}

function AppearancePreview({ content, settings }: { content: ContentData; settings: SettingsData }) {
  return <section className="px-5 py-8 sm:px-8"><PreviewEyebrow>Оформление</PreviewEyebrow><div className="mt-4 rounded-2xl border border-current/10 p-5"><p className="text-xs font-medium opacity-55">Текущая тема</p><div className="mt-3 flex items-center gap-3"><span className="h-10 w-10 rounded-full border border-current/20 bg-current" /><div><p className="font-semibold">{settings.theme === 'dark' ? 'Тёмная' : 'Светлая'}</p><p className="text-xs opacity-60">Предпросмотр обновляется сразу</p></div></div></div><div className="mt-5 rounded-2xl bg-[#4657d9] p-5 text-white"><p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">Акцент интерфейса</p><p className="mt-3 text-xl font-semibold tracking-[-0.03em]">{content.hero.title || 'Портфолио'}</p><span className="mt-4 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#2636ad]">{content.hero.ctaPrimary.text || 'Основное действие'}</span></div></section>
}

function PreviewEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-55">{children}</p>
}
