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
  title: "Привет, я Дмитрий",
  subtitle: "Full-stack разработчик, создающий современные веб-приложения с фокусом на производительность и пользовательский опыт",
  ctaPrimary: {
    text: "Посмотреть проекты",
    href: "#projects",
  },
  ctaSecondary: {
    text: "Резюме",
    href: "/resume",
  },
};
