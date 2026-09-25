import type { Metadata } from "next";
import { getAllContent } from "@/lib/api-client";
import ResumeClient from "./ResumeClient";

export const metadata: Metadata = {
  title: "Резюме",
  description: "Демонстрационное резюме full-stack разработчика: опыт, компетенции и образование.",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "Резюме full-stack разработчика",
    description: "Опыт в full-stack разработке, инфраструктуре и эксплуатации информационных систем.",
    url: "/resume",
  },
};

// Отключаем кэширование для динамических данных
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ResumePage() {
  const content = await getAllContent();
  const resume = content.resume;

  if (!resume) {
    return (
      <section className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center px-6 pt-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Резюме недоступно</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Данные пока не опубликованы</h1>
        <p className="mt-4 leading-7 text-muted-foreground">Попробуйте обновить страницу позже или воспользуйтесь контактами на главной.</p>
      </section>
    );
  }

  return <ResumeClient resume={resume} />;
}
