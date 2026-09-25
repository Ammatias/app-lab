export interface HeroData {
  title: string
  subtitle: string
  ctaPrimary: { text: string; href: string }
  ctaSecondary: { text: string; href: string }
}

export interface HomeProfileData {
  about: string
  competencies: string[]
}

export interface WorkContextData {
  title: string
  status: string
  focusLabel: string
  featuredProjectId: string
  note: string
  layers: Array<{ id: string; label: string; value: string }>
}

export interface Experience {
  id: string
  position: string
  company: string
  period: string
  description: string[]
}

export interface Education {
  id: string
  degree: string
  institution: string
  year: string
  specialty?: string
}

export interface Course {
  id: string
  year: string
  title: string
  institution: string
  specialty?: string
}

export interface Contacts {
  email: string
  github?: string
  telegram?: string
  phone?: string
}

export interface ResumeData {
  about: string
  skills: string[]
  experience: Experience[]
  education: Education[]
  courses: Course[]
  contacts: Contacts
}

export interface PortfolioProjectData {
  id: string
  title: string
  description: string
  role?: string
  result?: string
  fullDescription?: string
  tech: string[]
  features?: string[]
  github?: string
  demo?: string
  screenshots?: string[]
}

export interface ContentData {
  hero: HeroData
  homeProfile: HomeProfileData
  workContext: WorkContextData
  resume: ResumeData
  projects: PortfolioProjectData[]
}

export interface SettingsData {
  theme: 'dark' | 'light'
  colors: Record<string, string>
}

export interface EditorMediaItem {
  id: string
  url: string
  alt: string | null
}
