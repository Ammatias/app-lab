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
    id: "1",
    title: "Портфолио",
    description: "Личный сайт-портфолио разработчика на Next.js с современным дизайном, плавными анимациями и функционалом скачивания резюме в PDF и DOCX",
    role: "Автор · Full-stack разработка и UI",
    result: "Единый адаптивный сайт с управляемым контентом и экспортом резюме в PDF/DOCX.",
    fullDescription: "Современный сайт-портфолио с 3D анимациями, переключением темы, parallax эффектами и функционалом скачивания резюме в PDF/DOCX. Полностью адаптивный дизайн и оптимизированная производительность. Сайт включает в себя главную страницу с проектами и страницу резюме с возможностью скачивания в различных форматах.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js"],
    features: [
      "3D-топология узлов и связей на Three.js",
      "Переключение тёмной/светлой темы",
      "Parallax эффекты для заголовков",
      "Fade + Slide анимации при скролле",
      "Генерация резюме в PDF и DOCX",
      "Полная адаптивность под все устройства",
    ],
    github: "https://github.com/Ammatias/app-lab/tree/main/next/portfolio",
    demo: "https://portfolio.ammatias.ru",
    screenshots: [
      "https://admin.web.ammatias.ru/m/v3A9FOPxQqCpsBNNYS6WGw",
      "https://admin.web.ammatias.ru/m/FvJ4QACJT2KmA6VWBH14mQ",
      "https://admin.web.ammatias.ru/m/5_C6TJaqQNuCrQg0siw6gw",
      "https://admin.web.ammatias.ru/m/gaC1FN1GTwm5B2aXZRBWqA",
      "https://admin.web.ammatias.ru/m/hxXJUwhYRf6fq0fwqXiRXg",
      "https://admin.web.ammatias.ru/m/VfaG23hQRjecoI7Wvpjs5Q",
    ],
  },
  {
    id: "it-portal",
    title: "ИТ-портал",
    description: "Единое рабочее пространство ИТ-отдела для сервисов, оборудования, справочника и повседневных операций.",
    role: "Соавтор · Архитектура, full-stack и интеграции",
    result: "Разрозненные инструменты и данные собраны в одном адаптивном интерфейсе с единым контуром доступа.",
    fullDescription: "Внутренний ИТ-портал объединяет оперативную картину инфраструктуры, каталог рабочих сервисов, учёт оборудования, телефонный справочник, инструкции и интеграции с системами управления. Публичная версия проекта полностью обезличена, использует синтетические данные и запускается как самостоятельный демонстрационный контур без доступа к рабочей среде.",
    tech: ["React", "Vite", "Rust", "Axum", "PostgreSQL", "Docker", "Authentik", "Tactical RMM"],
    features: [
      "Единый dashboard состояния ИТ-сервисов",
      "Каталог сервисов и база знаний",
      "Учёт оборудования и расходных материалов",
      "Телефонный справочник со статусами рабочих станций",
      "Единый вход через OIDC",
      "Интеграции с удалённым управлением и сетевой инфраструктурой",
      "Адаптивный интерфейс для desktop и mobile",
      "Безопасная публичная demo-конфигурация",
    ],
    github: "https://github.com/Ammatias/app-lab/tree/main/it-portal",
    screenshots: [],
  },
];
