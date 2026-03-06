import { CheckCircle } from "lucide-react";

const values = [
  "Digital skills training in a resource-limited environment",
  "Certified instructors with real-world industry experience",
  "Culturally relevant curriculum rooted in African identity",
  "Mentorship and career guidance beyond the classroom",
  "A pathway to reintegration through education",
];

export function MissionSection() {
  return (
    <section className="border-b py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Visual accent — gradient card grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <p className="text-center text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                120+
                <span className="mt-1 block text-xs font-medium tracking-wide text-muted-foreground">
                  Students Trained
                </span>
              </p>
            </div>
            <div className="mt-8 flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <p className="text-center text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                4
                <span className="mt-1 block text-xs font-medium tracking-wide text-muted-foreground">
                  Curriculum Pillars
                </span>
              </p>
            </div>
            <div className="-mt-6 flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <p className="text-center text-3xl font-extrabold text-violet-600 dark:text-violet-400">
                92%
                <span className="mt-1 block text-xs font-medium tracking-wide text-muted-foreground">
                  Completion Rate
                </span>
              </p>
            </div>
            <div className="mt-2 flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <p className="text-center text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                1,200+
                <span className="mt-1 block text-xs font-medium tracking-wide text-muted-foreground">
                  Lesson Hours
                </span>
              </p>
            </div>
          </div>

          {/* Text content */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
              Our Mission
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              More Than Education —{" "}
              <span className="text-sky-600 dark:text-sky-400">
                A Second Chance
              </span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Project Spring Up operates inside Ghana&apos;s Senior Correctional
              Centre in Roman Ridge, Accra. We believe that every young person —
              regardless of their past — deserves access to quality education and
              the tools to build a dignified future.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our programme combines hands-on digital skills training with life
              coaching, career readiness workshops, and a deep reconnection with
              African cultural identity. We don&apos;t just teach computers — we
              build character, confidence, and community.
            </p>

            <ul className="mt-8 space-y-3">
              {values.map((v) => (
                <li key={v} className="flex items-start gap-3 transition-transform duration-200 hover:translate-x-1">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-sm text-foreground/80">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
