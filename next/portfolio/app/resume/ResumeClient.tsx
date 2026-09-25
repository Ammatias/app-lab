"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, Github, LoaderCircle, Mail, Phone, Send } from "lucide-react";
import { generatePDF } from "@/lib/generate-pdf";
import { generateDOCX } from "@/lib/generate-docx";
import { ParallaxText } from "@/components/ui/ParallaxText";
import { FadeInSlide } from "@/components/ui/FadeInSlide";
import type { Resume } from "@/data/resume";

interface ResumeClientProps {
  resume: Resume;
}

type ExportFormat = "PDF" | "DOCX";

interface ExportState {
  format: ExportFormat | null;
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

const initialExportState: ExportState = { format: null, status: "idle", message: "" };

export default function ResumeClient({ resume }: ResumeClientProps) {
  const [exportState, setExportState] = useState<ExportState>(initialExportState);
  const reduceMotion = useReducedMotion();

  const handleDownload = async (format: ExportFormat) => {
    setExportState({ format, status: "loading", message: `Формируем ${format}…` });

    try {
      if (format === "PDF") {
        await generatePDF(resume);
      } else {
        await generateDOCX(resume);
      }
      setExportState({
        format,
        status: "success",
        message: `${format} сформирован и передан браузеру для скачивания.`,
      });
    } catch (error) {
      console.error(`Failed to generate ${format}:`, error);
      setExportState({
        format,
        status: "error",
        message: `Не удалось сформировать ${format}. Попробуйте ещё раз.`,
      });
    }
  };

  const isExporting = exportState.status === "loading";

  return (
    <div className="min-h-screen px-4 pt-24 sm:px-6">
      <div className="mx-auto max-w-5xl py-12 sm:py-16">
        <ParallaxText speed={0.2}>
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5 }}
            className="grid gap-6 border-b border-border pb-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-end"
          >
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Профессиональный профиль</p>
              <h1 className="mt-4 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">Резюме</h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:justify-self-end md:text-lg">
              Опыт на стыке разработки, инфраструктуры и ежедневной эксплуатации информационных систем.
            </p>
          </motion.header>
        </ParallaxText>

        <FadeInSlide delay={0.08} direction="up" distance={24}>
          <section className="grid gap-6 border-b border-border py-12 lg:grid-cols-[14rem_1fr]">
            <h2 className="text-xl font-semibold">О себе</h2>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">{resume.about}</p>
          </section>
        </FadeInSlide>

        <FadeInSlide delay={0.12} direction="up" distance={24}>
          <section className="grid gap-6 border-b border-border py-12 lg:grid-cols-[14rem_1fr]">
            <h2 className="text-xl font-semibold">Компетенции</h2>
            <ul className="flex flex-wrap gap-2" aria-label="Профессиональные навыки">
              {resume.skills.map((skill) => (
                <li key={skill} className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground">
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        </FadeInSlide>

        <FadeInSlide delay={0.16} direction="up" distance={24}>
          <section className="border-b border-border py-12">
            <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
              <h2 className="text-xl font-semibold">Опыт работы</h2>
              <ol className="space-y-5">
                {resume.experience.map((job, index) => (
                  <li key={job.id} className="rounded-3xl border border-border bg-card/65 p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-primary">
                          Позиция {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">{job.position}</h3>
                        <p className="mt-1 text-muted-foreground">{job.company}</p>
                      </div>
                      <p className="shrink-0 rounded-full border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground">
                        {job.period}
                      </p>
                    </div>
                    <ul className="mt-6 grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
                      {job.description.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </FadeInSlide>

        <FadeInSlide delay={0.2} direction="up" distance={24}>
          <div className="grid gap-10 border-b border-border py-12 md:grid-cols-2">
            <section>
              <h2 className="text-xl font-semibold">Образование</h2>
              <div className="mt-6 space-y-5">
                {resume.education.map((education) => (
                  <article key={education.id} className="border-l-2 border-primary pl-5">
                    <h3 className="font-semibold">{education.degree}</h3>
                    <p className="mt-1 leading-6 text-muted-foreground">{education.institution}</p>
                    {education.specialty && <p className="mt-2 text-sm leading-6 text-muted-foreground">{education.specialty}</p>}
                    <p className="mt-2 font-mono text-xs text-primary">{education.year}</p>
                  </article>
                ))}
              </div>
            </section>

            {resume.courses.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">Курсы</h2>
                <div className="mt-6 space-y-5">
                  {resume.courses.map((course) => (
                    <article key={course.id} className="border-l-2 border-primary pl-5">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="mt-1 leading-6 text-muted-foreground">{course.institution}</p>
                      {course.specialty && <p className="mt-2 text-sm leading-6 text-muted-foreground">{course.specialty}</p>}
                      <p className="mt-2 font-mono text-xs text-primary">{course.year}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </FadeInSlide>

        <FadeInSlide delay={0.24} direction="up" distance={24}>
          <div className="border-b border-border py-8">
            <h2 className="text-xl font-semibold">Связь</h2>
          </div>
          <section className="grid gap-8 py-12 lg:grid-cols-[14rem_1fr]">
            <div>
              <h2 className="text-xl font-semibold">Контакты</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Удобные способы связаться или сохранить резюме.</p>
            </div>
            <div>
              <address className="grid gap-3 not-italic sm:grid-cols-2">
                <a href={`mailto:${resume.contacts.email}`} className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                  {resume.contacts.email}
                </a>
                {resume.contacts.phone && (
                  <a href={`tel:${resume.contacts.phone.replace(/[^+\d]/g, "")}`} className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                    {resume.contacts.phone}
                  </a>
                )}
                {resume.contacts.github && (
                  <a href={resume.contacts.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Github className="h-5 w-5 text-primary" aria-hidden="true" />
                    GitHub
                  </a>
                )}
                {resume.contacts.telegram && (
                  <a href={`https://t.me/${resume.contacts.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Send className="h-5 w-5 text-primary" aria-hidden="true" />
                    {resume.contacts.telegram}
                  </a>
                )}
              </address>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {(["PDF", "DOCX"] as const).map((format) => {
                  const loading = isExporting && exportState.format === format;
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => handleDownload(format)}
                      disabled={isExporting}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-55 disabled:hover:translate-y-0"
                    >
                      {loading ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
                      {loading ? `Готовим ${format}…` : `Скачать ${format}`}
                    </button>
                  );
                })}
              </div>

              <p
                className={`mt-4 min-h-6 text-sm ${exportState.status === "error" ? "text-red-400" : "text-muted-foreground"}`}
                role={exportState.status === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {exportState.message}
              </p>
            </div>
          </section>
        </FadeInSlide>
      </div>
    </div>
  );
}
