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
    specialty?: string;
  }[];
  courses: {
    id: string;
    year: string;
    title: string;
    institution: string;
    specialty?: string;
  }[];
  contacts: {
    email: string;
    github?: string;
    linkedin?: string;
    telegram?: string;
    phone?: string;
  };
}

export const resume: Resume = {
  about: "Демонстрационный профиль разработчика. Замените этот текст собственной профессиональной информацией.",
  skills: ["TypeScript", "Next.js", "Node.js", "PostgreSQL", "Docker"],
  experience: [
    {
      id: "demo-experience",
      position: "Full-stack разработчик",
      company: "Пример компании",
      period: "2024 — настоящее время",
      description: [
        "Разработка и сопровождение веб-приложений",
        "Автоматизация сборки и развёртывания",
      ],
    },
  ],
  education: [
    {
      id: "demo-education",
      degree: "Профессиональное образование",
      institution: "Пример учебного заведения",
      year: "2024",
      specialty: "Информационные технологии",
    },
  ],
  courses: [
    {
      id: "demo-course",
      year: "2024",
      title: "Современная веб-разработка",
      institution: "Пример учебного центра",
    },
  ],
  contacts: {
    email: "developer@example.com",
    github: "https://github.com/your-username/",
    telegram: "@your-telegram",
    phone: "+0 000 000 00 00",
  },
};
