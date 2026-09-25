export interface HomeProfile {
  about: string;
  competencies: string[];
}

export const homeProfile: HomeProfile = {
  about:
    "Демонстрационный профиль разработчика, который объединяет интерфейсы, API, данные и инфраструктуру в одну поддерживаемую систему.",
  competencies: [
    "Full-stack разработка",
    "Next.js и TypeScript",
    "Проектирование API и данных",
    "Серверная инфраструктура",
    "Docker и контейнеризация",
    "Сети и инфраструктура",
    "Интеграции и автоматизация",
    "Поддержка после запуска",
  ],
};
