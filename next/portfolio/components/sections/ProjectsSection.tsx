"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Project } from "@/data/projects";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import { FadeInSlide } from "@/components/ui/FadeInSlide";
import { ProjectModal } from "@/components/ui/ProjectModal";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <section id="projects" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
          >
            Проекты
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <FadeInSlide
                key={project.id}
                delay={index * 0.1}
                direction="up"
                distance={40}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedProject(project)}
                  className="p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  {/* Главное изображение (hero) */}
                  {project.screenshots && project.screenshots.length > 0 && (
                    <div className="mb-4">
                      <div className="relative w-full h-40 rounded-lg overflow-hidden bg-background">
                        <Image
                          src={project.screenshots[0]}
                          alt={`${project.title} hero`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Demo
                      </a>
                    )}
                  </div>
                </motion.div>
              </FadeInSlide>
            ))}
          </div>
        </div>
      </section>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
