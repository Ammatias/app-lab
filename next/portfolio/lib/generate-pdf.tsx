"use client";

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { ResumeDocument } from "@/components/resume/ResumeDocument";
import type { Resume } from "@/data/resume";

export async function generatePDF(resume: Resume) {
  const blob = await pdf(<ResumeDocument resume={resume} />).toBlob();
  saveAs(blob, "Резюме Имя Фамилия.pdf");
}
