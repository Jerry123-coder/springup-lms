import {
  Monitor,
  Briefcase,
  HeartHandshake,
  BookOpen,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const pillars = [
  {
    title: "Digital Literacy",
    description:
      "Essential ICT skills — from Microsoft Word and Excel to basic operating system fluency — forming the bedrock of modern competence.",
    icon: Monitor,
    iconBg: "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
    highlights: ["Microsoft Word", "Microsoft Excel", "Basic OS Skills"],
    className: "md:col-span-2",
  },
  {
    title: "Career Readiness",
    description:
      "Practical tools to compete in the workforce. Presentations, prompt engineering, and graphic design for the AI age.",
    icon: Briefcase,
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
    highlights: ["Slide Design", "Prompt Engineering", "Graphic Design"],
    className: "md:col-span-1",
  },
  {
    title: "Life Skills & Values",
    description:
      "Building character alongside competence. Professional etiquette, ethical discipline, and the soft skills that define leaders.",
    icon: HeartHandshake,
    iconBg: "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
    highlights: ["Professional Etiquette", "Ethics", "Discipline"],
    className: "md:col-span-1",
  },
  {
    title: "Cultural Identity",
    description:
      "Reconnecting with heritage through African literature and cultural storytelling — because knowing where you come from shapes where you go.",
    icon: BookOpen,
    iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
    highlights: ["African Literature", "Heritage Building", "Storytelling"],
    className: "md:col-span-2",
  },
] as const;

export function PillarsGrid() {
  return (
    <section id="curriculum" className="border-b py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Our Curriculum
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The 4 Pillars
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every course at Spring Up falls under one of four pillars, designed
            to provide a holistic path from learning to reintegration.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card
              key={pillar.title}
              className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${pillar.className}`}
            >
              <CardHeader>
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${pillar.iconBg}`}
                >
                  <pillar.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{pillar.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {pillar.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {pillar.highlights.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors duration-200 group-hover:border-sky-200 group-hover:bg-sky-50 dark:group-hover:border-sky-800 dark:group-hover:bg-sky-950/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
