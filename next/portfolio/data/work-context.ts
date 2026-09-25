export interface WorkContextLayer {
  id: string;
  label: string;
  value: string;
}

export interface WorkContextData {
  title: string;
  status: string;
  focusLabel: string;
  featuredProjectId: string;
  note: string;
  layers: WorkContextLayer[];
}

export const workContext: WorkContextData = {
  title: "Рабочий контур",
  status: "online",
  focusLabel: "Сейчас в фокусе",
  featuredProjectId: "demo-project",
  note: "Демонстрационный контур показывает, как связать интерфейс, данные и эксплуатацию.",
  layers: [
    { id: "interface", label: "Интерфейс", value: "Next.js · TypeScript" },
    { id: "system", label: "Система", value: "API · PostgreSQL · Docker" },
    { id: "operations", label: "Эксплуатация", value: "Серверы · сети · поддержка" },
  ],
};
