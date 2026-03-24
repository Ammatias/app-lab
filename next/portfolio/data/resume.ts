export interface Resume {
  about: string;
  skills: string[];
  experience: {
    id: string;
    position: string;
    company: string;
    period: string;
    description: string[];
  }[];
  education: {
    id: string;
    degree: string;
    institution: string;
    year: string;
  }[];
  contacts: {
    email: string;
    github: string;
    linkedin?: string;
    telegram?: string;
  };
}

export const resume: Resume = {
  about: "Full-stack разработчик с опытом создания современных веб-приложений. Увлечен созданием красивых и функциональных интерфейсов.",
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "PostgreSQL",
    "GraphQL",
    "Git",
  ],
  experience: [
    {
      id: "1",
      position: "Frontend Developer",
      company: "Tech Company",
      period: "2023 - Настоящее время",
      description: [
        "Разработка SPA на React и Next.js",
        "Оптимизация производительности",
        "Внедрение TypeScript",
      ],
    },
    {
      id: "2",
      position: "Junior Developer",
      company: "StartUp",
      period: "2021 - 2023",
      description: [
        "Создание лендингов и сайтов",
        "Работа с REST API",
        "Участие в код-ревью",
      ],
    },
  ],
  education: [
    {
      id: "1",
      degree: "Бакалавр информатики",
      institution: "МГТУ им. Баумана",
      year: "2021",
    },
  ],
  contacts: {
    email: "example@email.com",
    github: "https://github.com",
    telegram: "@username",
  },
};
