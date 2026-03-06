import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Before Spring Up, I had never touched a computer. Now I can type a full document in Microsoft Word, create spreadsheets, and I am learning how to use AI to research. It has changed how I see my future.",
    name: "Daniel A.",
    role: "Student, Cohort 2",
    accent: "border-l-sky-500",
    initials: "DA",
    color: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    quote:
      "Watching these young men go from not knowing how to open a browser to building their own presentations — that transformation is what keeps us going. Spring Up proves that potential has no postcode.",
    name: "Phoebe France",
    role: "Programme Director",
    accent: "border-l-emerald-500",
    initials: "PF",
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    quote:
      "The cultural identity classes gave me something I didn't know I was missing. Reading about African writers who overcame hardship made me realise my story isn't over — it's just beginning.",
    name: "Emmanuel K.",
    role: "Student, Cohort 1",
    accent: "border-l-amber-500",
    initials: "EK",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-b bg-muted/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Voices of Spring Up
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Stories from the Programme
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Real words from students and staff at the Senior Correctional
            Centre. Names have been changed to protect privacy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className={`group rounded-2xl border-l-4 ${t.accent} bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8`}
            >
              <Quote className="mb-4 h-8 w-8 text-sky-300 transition-transform duration-300 group-hover:scale-110 dark:text-sky-600" />
              <blockquote className="mb-6 text-sm leading-relaxed text-foreground/80">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-transform duration-300 group-hover:scale-110 ${t.color}`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
