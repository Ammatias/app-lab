export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  tech: string[];
  features?: string[];
  github?: string;
  demo?: string;
  screenshots?: string[];
}

export const projects: Project[] = [
  {
    id: "1",
    title: "Демонстрационный проект",
    description: "Пример проекта на Next.js для замены собственным содержимым.",
    fullDescription: "Обновите описание, ссылки и изображения перед публикацией своего портфолио.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    features: ["Адаптивный интерфейс", "Управление контентом", "Docker-развёртывание"],
    github: "https://github.com/your-username/your-repository",
    demo: "https://portfolio.example.com",
    screenshots: [],
  },
];
