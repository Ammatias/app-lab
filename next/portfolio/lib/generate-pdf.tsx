"use client";

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { ResumeDocument } from "@/components/resume/ResumeDocument";

export async function generatePDF() {
  const blob = await pdf(<ResumeDocument />).toBlob();
  saveAs(blob, "Резюме Корчагин Д. А..pdf");
}
