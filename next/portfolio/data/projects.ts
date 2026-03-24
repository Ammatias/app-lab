export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "E-commerce Platform",
    description: "Полнофункциональная платформа электронной коммерции с корзиной, оплатой и админ-панелью",
    tech: ["Next.js", "TypeScript", "Stripe", "Prisma"],
    github: "https://github.com",
    demo: "https://example.com",
  },
  {
    id: "2",
    title: "Task Manager",
    description: "Приложение для управления задачами с drag-and-drop и реальным временем",
    tech: ["React", "Node.js", "Socket.io", "MongoDB"],
    github: "https://github.com",
    demo: "https://example.com",
  },
  {
    id: "3",
    title: "Weather Dashboard",
    description: "Интерактивная панель погоды с прогнозом и картами",
    tech: ["Vue.js", "TypeScript", "OpenWeather API"],
    github: "https://github.com",
    demo: "https://example.com",
  },
];
