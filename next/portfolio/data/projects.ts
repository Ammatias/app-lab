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
    title: "Портфолио",
    description: "Личный сайт-портфолио разработчика на Next.js с современным дизайном, плавными анимациями и функционалом скачивания резюме в PDF и DOCX",
    fullDescription: "Современный сайт-портфолио с 3D анимациями, переключением темы, parallax эффектами и функционалом скачивания резюме в PDF/DOCX. Полностью адаптивный дизайн и оптимизированная производительность. Сайт включает в себя главную страницу с проектами и страницу резюме с возможностью скачивания в различных форматах.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js"],
    features: [
      "3D фон на Three.js (10 плавающих линий)",
      "Переключение тёмной/светлой темы",
      "Parallax эффекты для заголовков",
      "Fade + Slide анимации при скролле",
      "Генерация резюме в PDF и DOCX",
      "Полная адаптивность под все устройства",
    ],
    github: "https://github.com/your-username/your-repo",
    demo: "https://your-demo-url.example.com",
    screenshots: [
      "/projects/portfolio/hero.png",
      "/projects/portfolio/screenshot-1.png",
      "/projects/portfolio/screenshot-2.png",
      "/projects/portfolio/screenshot-3.png",
    ],
  },
];
