import { UserPlus, BookOpen, PenTool, Award } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Enrolment",
    description:
      "Young men at the Senior Correctional Centre are enrolled into the Spring Up programme with their own learning portal account.",
    icon: UserPlus,
    color: "bg-sky-500",
  },
  {
    step: "02",
    title: "Learn",
    description:
      "Students work through structured lessons across our 4 pillars — from Excel spreadsheets to African literature — at their own pace with instructor guidance.",
    icon: BookOpen,
    color: "bg-blue-600",
  },
  {
    step: "03",
    title: "Submit & Practice",
    description:
      "Each module includes hands-on assignments. Students upload their work directly through the platform for instructor review and feedback.",
    icon: PenTool,
    color: "bg-emerald-500",
  },
  {
    step: "04",
    title: "Grow & Certify",
    description:
      "Instructors grade submissions and provide personalised feedback. Upon completion, students earn a recognised certificate of achievement.",
    icon: Award,
    color: "bg-amber-500",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            The Journey
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            How Spring Up Works
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            A simple, structured path from enrolment to certification — designed
            for an environment where every resource counts.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-4">
          {/* Connecting line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-0.5 bg-gradient-to-r from-sky-200 via-blue-200 to-emerald-200 dark:from-sky-800 dark:via-blue-800 dark:to-emerald-800 md:block" />

          {steps.map((s) => (
            <div key={s.step} className="group relative text-center transition-all duration-300 hover:-translate-y-1">
              <div className="mx-auto mb-5 flex h-[6.5rem] w-[6.5rem] flex-col items-center justify-center rounded-2xl border-2 border-border bg-card shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-sky-200 dark:group-hover:border-sky-800">
                <div
                  className={`mb-1.5 flex h-10 w-10 items-center justify-center rounded-lg text-white transition-transform duration-300 group-hover:scale-110 ${s.color}`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Step {s.step}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
