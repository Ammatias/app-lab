"use client";

import { Project } from "@/data/projects";
import { ExternalLink, Github } from "lucide-react";

interface ProjectInfoProps {
  project: Project;
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <div className="space-y-6">
      {/* Описание */}
      {project.fullDescription && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-primary">📖 Описание</h3>
          <p className="text-muted-foreground">{project.fullDescription}</p>
        </div>
      )}

      {/* Технологии */}
      {project.tech && project.tech.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">🛠 Технологии</h3>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Особенности */}
      {project.features && project.features.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">📁 Особенности</h3>
          <ul className="space-y-2">
            {project.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-primary mt-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ссылки */}
      {(project.github || project.demo) && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">🔗 Ссылки</h3>
          <div className="flex gap-4">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Demo
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
