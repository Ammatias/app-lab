'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

interface HeroData {
  title: string
  subtitle: string
  ctaPrimary: { text: string; href: string }
  ctaSecondary: { text: string; href: string }
}

interface Experience {
  id: string
  position: string
  company: string
  period: string
  description: string[]
}

interface Education {
  id: string
  degree: string
  institution: string
  year: string
  specialty?: string
}

interface Course {
  id: string
  year: string
  title: string
  institution: string
  specialty?: string
}

interface Contacts {
  email: string
  github?: string
  telegram?: string
  phone?: string
}

interface ResumeData {
  about: string
  skills: string[]
  experience: Experience[]
  education: Education[]
  courses: Course[]
  contacts: Contacts
}

interface ProjectData {
  id: string
  title: string
  description: string
  fullDescription?: string
  tech: string[]
  features?: string[]
  github?: string
  demo?: string
  screenshots?: string[]
}

interface ContentData {
  hero: HeroData
  resume: ResumeData
  projects: ProjectData[]
}

interface SettingsData {
  theme: 'dark' | 'light'
  colors: Record<string, string>
}

interface EditContentFormProps {
  projectSlug: string
  initialContent?: ContentData
  initialSettings?: SettingsData
}

export function EditContentForm({ projectSlug, initialContent, initialSettings }: EditContentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'hero' | 'resume' | 'projects' | 'settings'>('hero')

  const [hero, setHero] = useState<HeroData>(initialContent?.hero || {
    title: '',
    subtitle: '',
    ctaPrimary: { text: '', href: '' },
    ctaSecondary: { text: '', href: '' }
  })

  const [resume, setResume] = useState<ResumeData>(initialContent?.resume || {
    about: '',
    skills: [],
    experience: [],
    education: [],
    courses: [],
    contacts: { email: '', github: '', telegram: '', phone: '' }
  })

  const [projects, setProjects] = useState<ProjectData[]>(initialContent?.projects || [])

  const [theme, setTheme] = useState<'dark' | 'light'>(initialSettings?.theme || 'dark')

  const [skillsInput, setSkillsInput] = useState(resume.skills.join(', '))

  useEffect(() => {
    if (initialContent?.resume) {
      setSkillsInput(initialContent.resume.skills.join(', '))
    }
  }, [initialContent])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const content: ContentData = {
      hero,
      resume: {
        ...resume,
        skills: skillsInput.split(',').map(s => s.trim()).filter(s => s),
      },
      projects,
    }

    const settings: SettingsData = {
      theme,
      colors: initialSettings?.colors || {},
    }

    try {
      const response = await fetch(`/api/public/${projectSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, settings }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update content')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Hero Section
  const renderHeroSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section</CardTitle>
        <CardDescription>Main page header and subtitle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="hero-title" className="text-sm font-medium">Title</label>
          <Input
            id="hero-title"
            value={hero.title}
            onChange={(e) => setHero({ ...hero, title: e.target.value })}
            placeholder="Привет, я Дмитрий"
            className="bg-background text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="hero-subtitle" className="text-sm font-medium">Subtitle</label>
          <Input
            id="hero-subtitle"
            value={hero.subtitle}
            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
            placeholder="Full-stack разработчик"
            className="bg-background text-foreground"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="cta-primary-text" className="text-sm font-medium">CTA Primary Text</label>
            <Input
              id="cta-primary-text"
              value={hero.ctaPrimary.text}
              onChange={(e) => setHero({ ...hero, ctaPrimary: { ...hero.ctaPrimary, text: e.target.value } })}
              placeholder="Посмотреть проекты"
              className="bg-background text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cta-primary-href" className="text-sm font-medium">CTA Primary URL</label>
            <Input
              id="cta-primary-href"
              value={hero.ctaPrimary.href}
              onChange={(e) => setHero({ ...hero, ctaPrimary: { ...hero.ctaPrimary, href: e.target.value } })}
              placeholder="#projects"
              className="bg-background text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="cta-secondary-text" className="text-sm font-medium">CTA Secondary Text</label>
            <Input
              id="cta-secondary-text"
              value={hero.ctaSecondary.text}
              onChange={(e) => setHero({ ...hero, ctaSecondary: { ...hero.ctaSecondary, text: e.target.value } })}
              placeholder="Резюме"
              className="bg-background text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cta-secondary-href" className="text-sm font-medium">CTA Secondary URL</label>
            <Input
              id="cta-secondary-href"
              value={hero.ctaSecondary.href}
              onChange={(e) => setHero({ ...hero, ctaSecondary: { ...hero.ctaSecondary, href: e.target.value } })}
              placeholder="/resume"
              className="bg-background text-foreground"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Resume Section
  const renderResumeSection = () => (
    <div className="space-y-6">
      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Personal information and summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="resume-about" className="text-sm font-medium">About</label>
            <textarea
              id="resume-about"
              value={resume.about}
              onChange={(e) => setResume({ ...resume, about: e.target.value })}
              placeholder="О себе..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="resume-skills" className="text-sm font-medium">Skills (comma-separated)</label>
            <Input
              id="resume-skills"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="JavaScript, TypeScript, React"
              className="bg-background text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Experience</CardTitle>
              <CardDescription>Work experience</CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setResume({
                ...resume,
                experience: [...resume.experience, { id: Date.now().toString(), position: '', company: '', period: '', description: [] }]
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {resume.experience.map((job, index) => (
            <div key={job.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Experience #{index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setResume({
                    ...resume,
                    experience: resume.experience.filter(e => e.id !== job.id)
                  })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    value={job.position}
                    onChange={(e) => {
                      const newExperience = [...resume.experience]
                      newExperience[index].position = e.target.value
                      setResume({ ...resume, experience: newExperience })
                    }}
                    placeholder="Инженер-программист"
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    value={job.company}
                    onChange={(e) => {
                      const newExperience = [...resume.experience]
                      newExperience[index].company = e.target.value
                      setResume({ ...resume, experience: newExperience })
                    }}
                    placeholder="Company name"
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Period</label>
                <Input
                  value={job.period}
                  onChange={(e) => {
                    const newExperience = [...resume.experience]
                    newExperience[index].period = e.target.value
                    setResume({ ...resume, experience: newExperience })
                  }}
                  placeholder="Март 2026 — Настоящее время"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (one per line)</label>
                <textarea
                  value={job.description.join('\n')}
                  onChange={(e) => {
                    const newExperience = [...resume.experience]
                    newExperience[index].description = e.target.value.split('\n').filter(l => l.trim())
                    setResume({ ...resume, experience: newExperience })
                  }}
                  placeholder="Описание обязанностей..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Education</CardTitle>
              <CardDescription>Educational background</CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setResume({
                ...resume,
                education: [...resume.education, { id: Date.now().toString(), degree: '', institution: '', year: '', specialty: '' }]
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {resume.education.map((edu, index) => (
            <div key={edu.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Education #{index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setResume({
                    ...resume,
                    education: resume.education.filter(e => e.id !== edu.id)
                  })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Degree</label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => {
                      const newEducation = [...resume.education]
                      newEducation[index].degree = e.target.value
                      setResume({ ...resume, education: newEducation })
                    }}
                    placeholder="Среднее специальное"
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Input
                    value={edu.year}
                    onChange={(e) => {
                      const newEducation = [...resume.education]
                      newEducation[index].year = e.target.value
                      setResume({ ...resume, education: newEducation })
                    }}
                    placeholder="2023"
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution</label>
                <Input
                  value={edu.institution}
                  onChange={(e) => {
                    const newEducation = [...resume.education]
                    newEducation[index].institution = e.target.value
                    setResume({ ...resume, education: newEducation })
                  }}
                  placeholder="АУ «Ханты-Мансийский технолого-педагогический колледж»"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialty</label>
                <Input
                  value={edu.specialty || ''}
                  onChange={(e) => {
                    const newEducation = [...resume.education]
                    newEducation[index].specialty = e.target.value
                    setResume({ ...resume, education: newEducation })
                  }}
                  placeholder="Информационные системы и программирование"
                  className="bg-background text-foreground"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Courses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Professional development courses</CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setResume({
                ...resume,
                courses: [...resume.courses, { id: Date.now().toString(), year: '', title: '', institution: '', specialty: '' }]
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {resume.courses.map((course, index) => (
            <div key={course.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Course #{index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setResume({
                    ...resume,
                    courses: resume.courses.filter(c => c.id !== course.id)
                  })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={course.title}
                    onChange={(e) => {
                      const newCourses = [...resume.courses]
                      newCourses[index].title = e.target.value
                      setResume({ ...resume, courses: newCourses })
                    }}
                    placeholder="Системный администратор"
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Input
                    value={course.year}
                    onChange={(e) => {
                      const newCourses = [...resume.courses]
                      newCourses[index].year = e.target.value
                      setResume({ ...resume, courses: newCourses })
                    }}
                    placeholder="2023"
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution</label>
                <Input
                  value={course.institution}
                  onChange={(e) => {
                    const newCourses = [...resume.courses]
                    newCourses[index].institution = e.target.value
                    setResume({ ...resume, courses: newCourses })
                  }}
                  placeholder="АУ «Ханты-Мансийский технолого-педагогический колледж»"
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialty</label>
                <Input
                  value={course.specialty || ''}
                  onChange={(e) => {
                    const newCourses = [...resume.courses]
                    newCourses[index].specialty = e.target.value
                    setResume({ ...resume, courses: newCourses })
                  }}
                  placeholder="Администрирование информационно-коммуникационных систем"
                  className="bg-background text-foreground"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>Contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="contact-email" className="text-sm font-medium">Email</label>
              <Input
                id="contact-email"
                value={resume.contacts.email}
                onChange={(e) => setResume({ ...resume, contacts: { ...resume.contacts, email: e.target.value } })}
                placeholder="email@example.com"
                type="email"
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-phone" className="text-sm font-medium">Phone</label>
              <Input
                id="contact-phone"
                value={resume.contacts.phone || ''}
                onChange={(e) => setResume({ ...resume, contacts: { ...resume.contacts, phone: e.target.value } })}
                placeholder="+7 (999) 000-00-00"
                className="bg-background text-foreground"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="contact-github" className="text-sm font-medium">GitHub</label>
              <Input
                id="contact-github"
                value={resume.contacts.github || ''}
                onChange={(e) => setResume({ ...resume, contacts: { ...resume.contacts, github: e.target.value } })}
                placeholder="https://github.com/username"
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-telegram" className="text-sm font-medium">Telegram</label>
              <Input
                id="contact-telegram"
                value={resume.contacts.telegram || ''}
                onChange={(e) => setResume({ ...resume, contacts: { ...resume.contacts, telegram: e.target.value } })}
                placeholder="@username"
                className="bg-background text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Settings
  const renderSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Theme and appearance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="theme" className="text-sm font-medium">Theme</label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
          >
            <option value="dark" className="bg-background text-foreground">Dark</option>
            <option value="light" className="bg-background text-foreground">Light</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )

  // Projects Section
  const renderProjectsSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Manage your portfolio projects</CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setProjects([
                ...projects,
                {
                  id: Date.now().toString(),
                  title: 'New Project',
                  description: 'Project description',
                  fullDescription: '',
                  tech: [],
                  features: [],
                  github: '',
                  demo: '',
                  screenshots: []
                }
              ])}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {projects.map((project, pIndex) => (
            <div key={project.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Project #{pIndex + 1}: {project.title}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setProjects(projects.filter(p => p.id !== project.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={project.title}
                    onChange={(e) => {
                      const newProjects = [...projects]
                      newProjects[pIndex].title = e.target.value
                      setProjects(newProjects)
                    }}
                    placeholder="Project Title"
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Demo URL</label>
                  <Input
                    value={project.demo || ''}
                    onChange={(e) => {
                      const newProjects = [...projects]
                      newProjects[pIndex].demo = e.target.value
                      setProjects(newProjects)
                    }}
                    placeholder="https://..."
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={project.description}
                  onChange={(e) => {
                    const newProjects = [...projects]
                    newProjects[pIndex].description = e.target.value
                    setProjects(newProjects)
                  }}
                  placeholder="Short description..."
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Description</label>
                <textarea
                  value={project.fullDescription || ''}
                  onChange={(e) => {
                    const newProjects = [...projects]
                    newProjects[pIndex].fullDescription = e.target.value
                    setProjects(newProjects)
                  }}
                  placeholder="Full project description..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">GitHub URL</label>
                  <Input
                    value={project.github || ''}
                    onChange={(e) => {
                      const newProjects = [...projects]
                      newProjects[pIndex].github = e.target.value
                      setProjects(newProjects)
                    }}
                    placeholder="https://github.com/..."
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tech Stack (comma-separated)</label>
                  <Input
                    value={project.tech?.join(', ') || ''}
                    onChange={(e) => {
                      const newProjects = [...projects]
                      newProjects[pIndex].tech = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      setProjects(newProjects)
                    }}
                    placeholder="Next.js, TypeScript, ..."
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Features (one per line)</label>
                <textarea
                  value={project.features?.join('\n') || ''}
                  onChange={(e) => {
                    const newProjects = [...projects]
                    newProjects[pIndex].features = e.target.value.split('\n').filter(l => l.trim())
                    setProjects(newProjects)
                  }}
                  placeholder="Feature 1&#10;Feature 2"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Screenshot Paths (one per line)</label>
                <textarea
                  value={project.screenshots?.join('\n') || ''}
                  onChange={(e) => {
                    const newProjects = [...projects]
                    newProjects[pIndex].screenshots = e.target.value.split('\n').filter(l => l.trim())
                    setProjects(newProjects)
                  }}
                  placeholder="/projects/project-name/hero.png&#10;/projects/project-name/screenshot-1.png"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground font-mono"
                />
              </div>

              {project.screenshots && project.screenshots.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preview:</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {project.screenshots.map((screenshot, sIndex) => (
                      <div key={sIndex} className="relative aspect-video bg-muted rounded-md overflow-hidden">
                        <img
                          src={screenshot}
                          alt={`Screenshot ${sIndex + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {projects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No projects yet. Click "Add Project" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          type="button"
          variant={activeTab === 'hero' ? 'default' : 'outline'}
          onClick={() => setActiveTab('hero')}
        >
          Hero Section
        </Button>
        <Button
          type="button"
          variant={activeTab === 'resume' ? 'default' : 'outline'}
          onClick={() => setActiveTab('resume')}
        >
          Resume
        </Button>
        <Button
          type="button"
          variant={activeTab === 'projects' ? 'default' : 'outline'}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </Button>
        <Button
          type="button"
          variant={activeTab === 'settings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-500">
          Content saved successfully!
        </div>
      )}

      {activeTab === 'hero' && renderHeroSection()}
      {activeTab === 'resume' && renderResumeSection()}
      {activeTab === 'projects' && renderProjectsSection()}
      {activeTab === 'settings' && renderSettings()}

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/projects">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
