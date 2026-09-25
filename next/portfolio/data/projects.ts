export interface Project {
  id: string;
  title: string;
  description: string;
  role?: string;
  result?: string;
  fullDescription?: string;
  tech: string[];
  features?: string[];
  github?: string;
  demo?: string;
  screenshots?: string[];
}

export const projects: Project[] = [
  {
    id: "demo-project",
    title: "Демонстрационная веб-платформа",
    description: "Пример full-stack проекта с управляемым контентом и контейнерным развёртыванием.",
    role: "Архитектура · Full-stack разработка",
    result: "Единое адаптивное приложение с понятной структурой данных и процессом публикации.",
    fullDescription: "Замените этот демонстрационный кейс собственным проектом, описав задачу, роль, результат и ключевые технические решения.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Docker"],
    features: [
      "Адаптивный интерфейс",
      "Управляемый контент",
      "Типизированный API",
      "Контейнерное развёртывание",
    ],
    github: "https://github.com/your-username/your-repository",
    demo: "https://portfolio.example.com",
    screenshots: [],
  },
];
