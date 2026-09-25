import type { HomeProfile } from "@/data/home-profile";

interface AboutSectionProps {
  profile: HomeProfile;
}

const principles = [
  "Понимаю среду, в которой работает продукт",
  "Собираю интерфейс, данные и инфраструктуру в одну систему",
  "Оставляю после себя управляемое и документированное решение",
];

export function AboutSection({ profile }: AboutSectionProps) {
  return (
    <section id="about" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl border-y border-border py-14 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-20">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Обо мне</p>
            <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Разработка без отрыва от реальной эксплуатации
            </h2>
            <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {profile.about}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Компетенции</h3>
              <div className="mt-5 border-t border-border">
                {profile.competencies.map((skill, index) => (
                  <div key={skill} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border py-3.5">
                    <span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sm leading-5">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Подход</h3>
              <ol className="mt-5 space-y-3">
                {principles.map((principle, index) => (
                  <li key={principle} className="rounded-2xl border border-border bg-card/60 p-5">
                    <span className="font-mono text-xs text-primary">0{index + 1}</span>
                    <p className="mt-3 text-sm leading-6">{principle}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
