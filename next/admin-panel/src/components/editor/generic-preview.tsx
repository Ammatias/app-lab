import type { GenericContentData, GenericSettingsData } from '@/lib/site-adapters'

export function GenericPreview({ content, settings, siteUrl }: { content: GenericContentData; settings: GenericSettingsData; siteUrl: string }) {
  const dark = settings.theme === 'dark'
  return (
    <aside className="xl:sticky xl:top-6 xl:self-start" aria-label="Предпросмотр сайта">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3"><div><p className="text-sm font-semibold">Предпросмотр</p><p className="max-w-52 truncate text-xs text-muted-foreground">{siteUrl}</p></div><span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wider">Универсальный</span></div>
        <div className={dark ? 'bg-[#101722] text-white' : 'bg-[#f7f8fb] text-[#172033]'}>
          <div className="min-h-[24rem] p-6" style={{ '--preview-accent': settings.accent } as React.CSSProperties}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: settings.accent }}>{content.hero.eyebrow || 'Новый сайт'}</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em]">{content.hero.title || 'Заголовок страницы'}</h2>
            <p className={dark ? 'mt-3 text-sm leading-6 text-slate-300' : 'mt-3 text-sm leading-6 text-slate-600'}>{content.hero.summary || 'Описание появится здесь.'}</p>
            {content.hero.primaryAction.label && <span className="mt-5 inline-flex rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: settings.accent }}>{content.hero.primaryAction.label}</span>}
            <div className="mt-8 space-y-3">{content.sections.map((section) => <section key={section.id} className={dark ? 'rounded-xl border border-white/10 bg-white/5 p-4' : 'rounded-xl border bg-white p-4'}><h3 className="font-semibold">{section.title || 'Без названия'}</h3><p className={dark ? 'mt-2 text-xs leading-5 text-slate-300' : 'mt-2 text-xs leading-5 text-slate-600'}>{section.body || 'Описание раздела'}</p>{section.items.length > 0 && <ul className="mt-3 space-y-1 text-xs">{section.items.slice(0, 3).map((item, index) => <li key={`${item}-${index}`}>— {item}</li>)}</ul>}</section>)}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
