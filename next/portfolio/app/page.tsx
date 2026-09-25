import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { getAllContent } from "@/lib/api-client";
import type { Project } from "@/data/projects";

// Отключаем кэширование для динамических данных
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const content = await getAllContent();
  const featuredProject = content.projects.find((project: Project) => project.id === content.workContext.featuredProjectId)
    ?? content.projects.at(-1);

  return (
    <>
      <HeroSection hero={content.hero} workContext={content.workContext} featuredProject={featuredProject} />
      <AboutSection profile={content.homeProfile} />
      <ProjectsSection projects={content.projects} />
    </>
  );
}
