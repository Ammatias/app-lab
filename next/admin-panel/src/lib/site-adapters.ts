import { z } from 'zod'

const actionSchema = z.object({ text: z.string(), href: z.string() }).strict()
const experienceSchema = z.object({
  id: z.string(), position: z.string(), company: z.string(), period: z.string(), description: z.array(z.string()),
}).strict()
const educationSchema = z.object({
  id: z.string(), degree: z.string(), institution: z.string(), year: z.string(), specialty: z.string().optional(),
}).strict()
const courseSchema = z.object({
  id: z.string(), title: z.string(), institution: z.string(), year: z.string(), specialty: z.string().optional(),
}).strict()
const portfolioProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  fullDescription: z.string().optional(),
  tech: z.array(z.string()),
  features: z.array(z.string()).optional(),
  github: z.string().optional(),
  demo: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
}).strict()

export const portfolioContentSchema = z.object({
  hero: z.object({ title: z.string(), subtitle: z.string(), ctaPrimary: actionSchema, ctaSecondary: actionSchema }).strict(),
  resume: z.object({
    about: z.string(),
    skills: z.array(z.string()),
    experience: z.array(experienceSchema),
    education: z.array(educationSchema),
    courses: z.array(courseSchema),
    contacts: z.object({
      email: z.string(), github: z.string().optional(), telegram: z.string().optional(), phone: z.string().optional(),
    }).strict(),
  }).strict(),
  projects: z.array(portfolioProjectSchema),
}).strict()

export const portfolioSettingsSchema = z.object({
  theme: z.enum(['dark', 'light']),
  colors: z.record(z.string(), z.string()),
}).strict()

export const genericContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string(),
    title: z.string(),
    summary: z.string(),
    primaryAction: z.object({ label: z.string(), href: z.string() }).strict(),
  }).strict(),
  sections: z.array(z.object({
    id: z.string(), title: z.string(), body: z.string(), items: z.array(z.string()),
  }).strict()),
}).strict()

export const genericSettingsSchema = z.object({
  theme: z.enum(['dark', 'light']),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Accent must be a six-digit hex color'),
}).strict()

export type SiteType = 'portfolio' | 'generic'
export type GenericContentData = z.infer<typeof genericContentSchema>
export type GenericSettingsData = z.infer<typeof genericSettingsSchema>

export const siteTypeSchema = z.enum(['portfolio', 'generic'])

export const portfolioDefaults = {
  content: {
    hero: { title: '', subtitle: '', ctaPrimary: { text: '', href: '' }, ctaSecondary: { text: '', href: '' } },
    resume: { about: '', skills: [], experience: [], education: [], courses: [], contacts: { email: '', github: '', telegram: '', phone: '' } },
    projects: [],
  },
  settings: { theme: 'dark', colors: {} },
} satisfies { content: z.infer<typeof portfolioContentSchema>; settings: z.infer<typeof portfolioSettingsSchema> }

export const genericDefaults = {
  content: {
    hero: { eyebrow: 'Новый сайт', title: 'Расскажите о главном', summary: 'Коротко объясните ценность сайта для посетителя.', primaryAction: { label: 'Связаться', href: '#contact' } },
    sections: [{ id: 'about', title: 'О проекте', body: 'Добавьте описание проекта, услуги или продукта.', items: [] }],
  },
  settings: { theme: 'light', accent: '#2563eb' },
} satisfies { content: GenericContentData; settings: GenericSettingsData }

const adapters = {
  portfolio: {
    type: 'portfolio', label: 'Портфолио', description: 'Резюме, проекты и галереи работ.',
    contentSchema: portfolioContentSchema, settingsSchema: portfolioSettingsSchema,
    defaults: portfolioDefaults,
  },
  generic: {
    type: 'generic', label: 'Универсальный сайт', description: 'Главный экран и свободный набор контентных секций.',
    contentSchema: genericContentSchema, settingsSchema: genericSettingsSchema,
    defaults: genericDefaults,
  },
} as const

export function getSiteAdapter(siteType: string) {
  return siteTypeSchema.safeParse(siteType).success ? adapters[siteType as SiteType] : null
}

export function getSiteContentSummary(siteType: string, content: unknown) {
  if (siteType === 'portfolio') {
    const parsed = portfolioContentSchema.safeParse(content)
    if (!parsed.success) return { label: 'Разделы', value: '—', note: 'структура требует проверки' }

    const projectsCount = parsed.data.projects.length
    return {
      label: 'Разделы',
      value: 3,
      note: `главная, резюме · ${projectsCount} ${pluralize(projectsCount, 'проект', 'проекта', 'проектов')}`,
    }
  }

  if (siteType === 'generic') {
    const parsed = genericContentSchema.safeParse(content)
    if (!parsed.success) return { label: 'Разделы', value: '—', note: 'структура требует проверки' }

    const sectionCount = parsed.data.sections.length + 1
    return {
      label: 'Разделы',
      value: sectionCount,
      note: `${sectionCount} ${pluralize(sectionCount, 'контентный блок', 'контентных блока', 'контентных блоков')}`,
    }
  }

  return { label: 'Контент', value: '—', note: 'неизвестный тип сайта' }
}

function pluralize(value: number, one: string, few: string, many: string) {
  const lastTwo = value % 100
  const last = value % 10
  if (lastTwo >= 11 && lastTwo <= 14) return many
  if (last === 1) return one
  if (last >= 2 && last <= 4) return few
  return many
}

export const siteTypeOptions = Object.values(adapters).map(({ type, label, description }) => ({ type, label, description }))
