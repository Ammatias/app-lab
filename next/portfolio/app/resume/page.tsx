import { Download, Mail, Github, Send } from "lucide-react";
import { generatePDF } from "@/lib/generate-pdf";
import { generateDOCX } from "@/lib/generate-docx";
import { ParallaxText } from "@/components/ui/ParallaxText";
import { FadeInSlide } from "@/components/ui/FadeInSlide";
import { getAllContent } from "@/lib/api-client";
import ResumeClient from "./ResumeClient";

// Отключаем кэширование для динамических данных
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ResumePage() {
  const content = await getAllContent();
  const resume = content.resume;

  if (!resume) {
    return <div>Loading...</div>;
  }

  return <ResumeClient resume={resume} />;
}
