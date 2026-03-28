export interface ThemeConfig {
  dark: {
    name: string;
    label: string;
  };
  light: {
    name: string;
    label: string;
  };
}

export const themeConfig: ThemeConfig = {
  dark: {
    name: "dark",
    label: "Тёмная",
  },
  light: {
    name: "light",
    label: "Светлая",
  },
};
