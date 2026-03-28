"use client";

import { motion } from "framer-motion";
import { Download, Mail, Github, Send } from "lucide-react";
import { generatePDF } from "@/lib/generate-pdf";
import { generateDOCX } from "@/lib/generate-docx";
import { ParallaxText } from "@/components/ui/ParallaxText";
import { FadeInSlide } from "@/components/ui/FadeInSlide";

interface ResumeClientProps {
  resume: any;
}

export default function ResumeClient({ resume }: ResumeClientProps) {
  const handleDownloadPDF = async () => {
    await generatePDF();
  };

  const handleDownloadDOCX = async () => {
    await generateDOCX();
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="container mx-auto max-w-4xl py-12">
        <ParallaxText speed={0.3}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-8 text-center"
          >
            Резюме
          </motion.h1>
        </ParallaxText>

        {/* О себе */}
        <ParallaxText speed={0.2}>
          <FadeInSlide delay={0.1} direction="up" distance={30}>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">О себе</h2>
              <p className="text-muted-foreground">{resume.about}</p>
            </section>
          </FadeInSlide>
        </ParallaxText>

        {/* Навыки */}
        <ParallaxText speed={0.15}>
          <FadeInSlide delay={0.2} direction="up" distance={30}>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Навыки</h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-4 py-2 rounded-lg bg-primary/20 text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </FadeInSlide>
        </ParallaxText>

        {/* Опыт работы */}
        <ParallaxText speed={0.1}>
          <FadeInSlide delay={0.3} direction="up" distance={30}>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Опыт работы</h2>
              <div className="space-y-6">
                {resume.experience && resume.experience.map((job: any) => (
                  <div key={job.id} className="border-l-2 border-primary pl-6">
                    <h3 className="text-xl font-semibold">{job.position}</h3>
                    <p className="text-muted-foreground">{job.company}</p>
                    <p className="text-sm text-muted-foreground mb-3">{job.period}</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {job.description.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </FadeInSlide>
        </ParallaxText>

        {/* Образование */}
        <ParallaxText speed={0.1}>
          <FadeInSlide delay={0.4} direction="up" distance={30}>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Образование</h2>
              <div className="space-y-4">
                {resume.education && resume.education.map((edu: any) => (
                  <div key={edu.id} className="border-l-2 border-primary pl-6">
                    <h3 className="text-xl font-semibold">{edu.degree}</h3>
                    <p className="text-muted-foreground">{edu.institution}</p>
                    {edu.specialty && (
                      <p className="text-sm text-muted-foreground">{edu.specialty}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{edu.year}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeInSlide>
        </ParallaxText>

        {/* Курсы повышения квалификации */}
        {resume.courses && resume.courses.length > 0 && (
          <ParallaxText speed={0.05}>
            <FadeInSlide delay={0.45} direction="up" distance={30}>
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Повышение квалификации, курсы</h2>
                <div className="space-y-4">
                  {resume.courses.map((course: any) => (
                    <div key={course.id} className="border-l-2 border-primary pl-6">
                      <h3 className="text-xl font-semibold">{course.title}</h3>
                      <p className="text-muted-foreground">{course.institution}</p>
                      {course.specialty && (
                        <p className="text-sm text-muted-foreground">{course.specialty}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{course.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            </FadeInSlide>
          </ParallaxText>
        )}

        {/* Контакты */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Контакты</h2>
          <div className="flex flex-col gap-3">
            <a
              href={`mailto:${resume.contacts?.email}`}
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-5 h-5" />
              {resume.contacts?.email}
            </a>
            {resume.contacts?.github && (
              <a
                href={resume.contacts.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
            )}
            {resume.contacts?.telegram && (
              <a
                href={`https://t.me/${resume.contacts.telegram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Send className="w-5 h-5" />
                {resume.contacts.telegram}
              </a>
            )}
          </div>
        </motion.section>

        {/* Кнопки скачивания */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            Скачать PDF
          </button>
          <button
            onClick={handleDownloadDOCX}
            className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Download className="w-5 h-5" />
            Скачать DOCX
          </button>
        </motion.div>
      </div>
    </div>
  );
}
