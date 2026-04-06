import Link from "next/link";
import { ArrowRight, Library } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * stitch: restructured_learning_hub_web — bridge from main_dashboard to full catalog.
 */
export function StudentDashboardCatalogPromo() {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-card px-6 py-8 shadow-ambient sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
        <div className="flex min-w-0 gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-sm">
            <Library className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Explore
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Course catalog
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Learning paths, pillar filters, and search—everything you need to
              navigate the full programme in one dedicated space.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/student/catalog"
          className={cn(
            buttonVariants({ size: "lg", variant: "ghost" }),
            "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-8 text-primary-foreground shadow-sm hover:bg-gradient-primary hover:opacity-90 lg:w-auto"
          )}
        >
          Enter catalog
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
