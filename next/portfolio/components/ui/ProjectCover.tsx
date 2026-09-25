import type { Project } from "@/data/projects";

interface ProjectCoverProps {
  project: Project;
  index: number;
}

export function ProjectCover({ project, index }: ProjectCoverProps) {
  const isAdmin = project.title.toLocaleLowerCase("ru").includes("администратор");
  const labels = isAdmin ? ["Сайты", "Контент", "Медиа", "Публикация"] : ["Интерфейс", "CMS", "Резюме", "Проекты"];

  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_52%_46%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_38%),linear-gradient(145deg,var(--card),var(--background))] p-5 sm:p-7">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:2rem_2rem]" />
      <svg className="absolute inset-0 h-full w-full text-primary/35" viewBox="0 0 640 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M320 198 140 102M320 198 500 96M320 198 148 308M320 198 502 306" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="7 8" />
        <circle cx="320" cy="198" r="74" fill="none" stroke="currentColor" strokeWidth="1" opacity=".55" />
        <circle cx="320" cy="198" r="100" fill="none" stroke="currentColor" strokeWidth="1" opacity=".2" />
      </svg>

      <div className="relative grid h-full grid-cols-[1fr_auto_1fr] grid-rows-2 items-center gap-x-4 gap-y-12">
        {labels.map((label, labelIndex) => {
          const positions = ["col-start-1 row-start-1", "col-start-3 row-start-1", "col-start-1 row-start-2", "col-start-3 row-start-2"];
          return <span key={label} className={`${positions[labelIndex]} justify-self-center rounded-full border border-border bg-background/75 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground shadow-sm backdrop-blur sm:text-xs`}>{label}</span>;
        })}
        <div className="col-start-2 row-span-2 row-start-1 flex h-28 w-28 flex-col items-center justify-center self-center rounded-full border border-primary/35 bg-background/80 text-center shadow-[0_0_60px_-18px_var(--primary)] backdrop-blur sm:h-36 sm:w-36">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-primary">System / {String(index + 1).padStart(2, "0")}</span>
          <span className="mt-2 max-w-24 text-sm font-semibold leading-tight tracking-[-0.03em] sm:max-w-28 sm:text-base">{project.title}</span>
        </div>
      </div>
    </div>
  );
}
