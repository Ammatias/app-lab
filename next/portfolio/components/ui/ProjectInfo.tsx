"use client";

import { ExternalLink, Github } from "lucide-react";
import type { Project } from "@/data/projects";

interface ProjectInfoProps {
  project: Project;
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <div className="space-y-8">
      {(project.role || project.result) && (
        <dl className="grid gap-4 sm:grid-cols-2">
          {project.role && (
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <dt className="font-mono text-xs uppercase tracking-[0.16em] text-primary">Моя роль</dt>
              <dd className="mt-3 text-sm leading-6">{project.role}</dd>
            </div>
          )}
          {project.result && (
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <dt className="font-mono text-xs uppercase tracking-[0.16em] text-primary">Результат</dt>
              <dd className="mt-3 text-sm leading-6">{project.result}</dd>
            </div>
          )}
        </dl>
      )}

      {project.fullDescription && (
        <section>
          <h3 className="text-lg font-semibold">О проекте</h3>
          <p className="mt-3 leading-7 text-muted-foreground">{project.fullDescription}</p>
        </section>
      )}

      {project.features && project.features.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold">Ключевые возможности</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {project.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.tech.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold">Технологии</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span key={tech} className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
        </section>
      )}

      {(project.github || project.demo) && (
        <section className="border-t border-border pt-6">
          <h3 className="sr-only">Ссылки проекта</h3>
          <div className="flex flex-wrap gap-3">
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub
              </a>
            )}
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Открыть сайт
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
