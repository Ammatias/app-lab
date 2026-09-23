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
