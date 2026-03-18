import Link from "next/link";
import { GraduationCap, Heart, Mail, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SupportDrawer } from "@/components/marketing/support-drawer";

const footerLinks = [
  { label: "Mission", href: "/#mission" },
  { label: "Curriculum", href: "/#curriculum" },
  { label: "Login", href: "/login" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#071a33]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.14)_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.10)_0%,transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-sky-400 to-emerald-400">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Spring Up</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-blue-100/70">
              Shaping Destinies through Digital Literacy. Empowering the youth
              of Ghana&apos;s Senior Correctional Centre with skills, values,
              and purpose.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-200/80">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-100/70 transition-colors duration-200 hover:text-sky-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <SupportDrawer>
                  <button className="text-sm text-blue-100/70 transition-colors hover:text-sky-300">
                    Support Us
                  </button>
                </SupportDrawer>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-200/80">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-blue-100/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                Senior Correctional Centre, Roman Ridge, Accra, Ghana
              </li>
              <li className="flex items-center gap-2.5 text-sm text-blue-100/70">
                <Mail className="h-4 w-4 shrink-0 text-sky-300" />
                <a
                  href="mailto:springupproject@gmail.com"
                  className="transition-colors hover:text-sky-300"
                >
                  springupproject@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-5">
              <SupportDrawer>
                <Button
                  size="sm"
                  className="gap-1.5 bg-sky-500 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-sky-400 active:scale-[0.98]"
                >
                  <Heart className="h-3.5 w-3.5" />
                  Donate
                </Button>
              </SupportDrawer>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-blue-100/45">
            &copy; {new Date().getFullYear()} Project Spring Up. All rights
            reserved. Built with purpose in Accra, Ghana.
          </p>
        </div>
      </div>
    </footer>
  );
}
