export interface HeroData {
  title: string;
  subtitle: string;
  ctaPrimary: {
    text: string;
    href: string;
  };
  ctaSecondary: {
    text: string;
    href: string;
  };
}

export const hero: HeroData = {
  title: "Создаю понятные веб-системы от интерфейса до инфраструктуры",
  subtitle: "Демонстрационный профиль full-stack разработчика. Замените тексты, проекты и контакты собственными данными.",
  ctaPrimary: {
    text: "Посмотреть проекты",
    href: "#projects",
  },
  ctaSecondary: {
    text: "Открыть резюме",
    href: "/resume",
  },
};
