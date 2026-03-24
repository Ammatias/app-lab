"use client";

import { motion } from "framer-motion";
import { resume } from "@/data/resume";
import { Download, Mail, Github, Send } from "lucide-react";
import { generatePDF } from "@/lib/generate-pdf";
import { generateDOCX } from "@/lib/generate-docx";

export default function ResumePage() {
  const handleDownloadPDF = async () => {
    await generatePDF();
  };

  const handleDownloadDOCX = async () => {
    await generateDOCX();
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="container mx-auto max-w-4xl py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-8 text-center"
        >
          Резюме
        </motion.h1>

        {/* О себе */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-4">О себе</h2>
          <p className="text-muted-foreground">{resume.about}</p>
        </motion.section>

        {/* Навыки */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-4">Навыки</h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 rounded-lg bg-primary/20 text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Опыт работы */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Опыт работы</h2>
          <div className="space-y-6">
            {resume.experience.map((job) => (
              <div key={job.id} className="border-l-2 border-primary pl-6">
                <h3 className="text-xl font-semibold">{job.position}</h3>
                <p className="text-muted-foreground">{job.company}</p>
                <p className="text-sm text-muted-foreground mb-3">{job.period}</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {job.description.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Образование */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Образование</h2>
          <div className="space-y-4">
            {resume.education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-primary pl-6">
                <h3 className="text-xl font-semibold">{edu.degree}</h3>
                <p className="text-muted-foreground">{edu.institution}</p>
                <p className="text-sm text-muted-foreground">{edu.year}</p>
              </div>
            ))}
          </div>
        </motion.section>

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
              href={`mailto:${resume.contacts.email}`}
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-5 h-5" />
              {resume.contacts.email}
            </a>
            <a
              href={resume.contacts.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
            {resume.contacts.telegram && (
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
