import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SupportDrawer } from "@/components/marketing/support-drawer";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[#0f2847] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="group mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/15 transition-all duration-300 hover:scale-110">
          <Heart className="h-7 w-7 text-pink-400 transition-transform duration-500 group-hover:scale-110" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Every Skill Learned Is a{" "}
          <span className="bg-linear-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
            Life Changed
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-blue-200/60">
          Your support provides laptops, internet access, learning materials,
          and instructor training for young men who deserve a second chance.
          Even a small contribution creates ripples of transformation.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <SupportDrawer>
            <Button
              size="lg"
              className="w-full gap-2 bg-sky-500 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-sky-400 active:scale-[0.98] sm:w-auto"
            >
              <Heart className="h-4 w-4" />
              Donate Now
            </Button>
          </SupportDrawer>

          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 border-white/20 bg-white/5 text-base text-blue-100 transition-all duration-200 hover:scale-[1.02] hover:bg-white/10 hover:text-white active:scale-[0.98] sm:w-auto"
            asChild
          >
            <Link href="/login">
              Join as Volunteer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-xs text-blue-300/40">
          All donations go directly to programme operations at the Senior
          Correctional Centre, Roman Ridge, Accra, Ghana.
        </p>
      </div>
    </section>
  );
}
