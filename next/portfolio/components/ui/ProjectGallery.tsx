"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ProjectGalleryProps {
  screenshots: string[];
  projectTitle: string;
}

export function ProjectGallery({ screenshots, projectTitle }: ProjectGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const galleryId = useId();

  if (screenshots.length === 0) return null;

  const nextSlide = () => setCurrentIndex((current) => (current + 1) % screenshots.length);
  const prevSlide = () => setCurrentIndex((current) => (current - 1 + screenshots.length) % screenshots.length);
  const imageId = `${galleryId}-image`;

  return (
    <section
      className="relative mb-8"
      aria-label={`Галерея проекта «${projectTitle}»`}
      aria-roledescription="карусель"
    >
      <div id={imageId} className="relative h-64 w-full overflow-hidden rounded-2xl border border-border bg-background md:h-[28rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            initial={reduceMotion ? false : { opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -32 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
            className="absolute inset-0"
          >
            <Image
              src={screenshots[currentIndex]}
              alt={`${projectTitle}: изображение ${currentIndex + 1} из ${screenshots.length}`}
              fill
              sizes="(min-width: 1024px) 896px, (min-width: 640px) calc(100vw - 7rem), calc(100vw - 2.5rem)"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {screenshots.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-controls={imageId}
            aria-label="Предыдущее изображение"
            className="absolute left-3 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white backdrop-blur transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-controls={imageId}
            aria-label="Следующее изображение"
            className="absolute right-3 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white backdrop-blur transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}

      {screenshots.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2" aria-label="Выбор изображения">
          {screenshots.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-controls={imageId}
              aria-label={`Показать изображение ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
              className={`min-h-11 min-w-11 rounded-full p-[1.125rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                index === currentIndex ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="block h-2 w-2 rounded-full bg-current" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        Изображение {currentIndex + 1} из {screenshots.length}
      </p>
    </section>
  );
}
