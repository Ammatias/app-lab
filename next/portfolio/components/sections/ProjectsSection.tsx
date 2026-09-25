"use client";

import { useState } from "react";
import { ArrowUpRight, ExternalLink, Github } from "lucide-react";
import type { Project } from "@/data/projects";
import { FadeInSlide } from "@/components/ui/FadeInSlide";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { ProjectCover } from "@/components/ui/ProjectCover";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <section id="projects" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 border-b border-border pb-10 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] md:items-end">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Практика</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Проекты</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:justify-self-end md:text-lg">
              Не просто список технологий, а задачи, принятые решения и результат, который можно проверить.
            </p>
          </div>

          <div className="divide-y divide-border">
            {projects.map((project, index) => (
              <FadeInSlide key={project.id} delay={index * 0.08} direction="up" distance={28}>
                <article className="grid gap-8 py-12 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:py-16">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[1.75rem] border border-border bg-card">
                    <ProjectCover project={project} index={index} />
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <h3 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{project.title}</h3>

                    <dl className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <dt className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">Задача</dt>
                        <dd className="mt-2 text-base leading-7 text-muted-foreground">{project.description}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">Моя роль</dt>
                        <dd className="mt-2 text-sm leading-6">{project.role || "Разработка и развитие проекта"}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">Результат</dt>
                        <dd className="mt-2 text-sm leading-6">{project.result || project.features?.[0] || "Рабочее решение готово к использованию"}</dd>
                      </div>
                    </dl>

                    <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-5">
                      <span className="mr-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">Стек</span>
                      {project.tech.slice(0, 5).map((tech) => (
                        <span key={tech} className="text-xs text-muted-foreground">{tech}</span>
                      ))}
                      {project.tech.length > 5 && <span className="font-mono text-xs text-primary">+{project.tech.length - 5}</span>}
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
                      <button
                        type="button"
                        onClick={() => setSelectedProject(project)}
                        className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                        aria-haspopup="dialog"
                        aria-controls="project-dialog"
                        aria-expanded={selectedProject?.id === project.id}
                      >
                        Подробнее
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                      </button>
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                          aria-label={`${project.title}: открыть исходный код на GitHub`}
                        >
                          <Github className="h-4 w-4" aria-hidden="true" />
                          GitHub
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                          aria-label={`${project.title}: открыть работающий сайт`}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          Demo
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </FadeInSlide>
            ))}
          </div>

          {projects.length === 0 && (
            <p className="mt-10 rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Проекты скоро появятся здесь.
            </p>
          )}
        </div>
      </section>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}
