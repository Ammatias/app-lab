import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { getAllContent } from "@/lib/api-client";

// Отключаем кэширование для динамических данных
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const content = await getAllContent();

  return (
    <>
      <HeroSection hero={content.hero} />
      <ProjectsSection projects={content.projects} />
    </>
  );
}
