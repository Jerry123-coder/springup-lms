import Link from "next/link";
import { GraduationCap } from "lucide-react";

/**
 * Auth routes (login, password reset) — no marketing navbar/footer.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col">
      {/* Layered textured background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(165deg, #04120e 0%, #0a2520 28%, #0d3a32 55%, #0f2e28 100%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(148,211,193,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(94,212,148,0.15),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(255,220,194,0.06),transparent)]" />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-white/90 transition-opacity hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
            <GraduationCap className="h-4 w-4 text-[#5dd494]" />
          </span>
          Spring Up
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">{children}</main>
    </div>
  );
}
