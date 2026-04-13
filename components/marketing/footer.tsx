import Link from "next/link";
import { GraduationCap, Heart, Mail, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SupportDrawer } from "@/components/marketing/support-drawer";

const footerLinks = [
  { label: "Mission", href: "/?section=mission" },
  { label: "Curriculum", href: "/?section=curriculum" },
  { label: "Impact", href: "/?section=impact" },
  { label: "Login", href: "/login" },
];

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #001a16 0%, #002219 50%, #001a16 100%)" }}
    >
      {/* Warm glow top-right */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle at center, rgba(255,204,170,0.4) 0%, transparent 65%)",
        }}
      />
      {/* Teal glow bottom-left */}
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle at center, rgba(148,211,193,0.4) 0%, transparent 65%)",
        }}
      />
      {/* Divider rim */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                <GraduationCap className="h-5 w-5 text-[#94d3c1]" />
              </div>
              <span className="font-display text-lg font-bold text-white">Spring Up</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[#c8ebe2]/70">
              Shaping Destinies through Digital Literacy. Empowering the youth
              of Ghana&apos;s Senior Correctional Centre with skills, values, and purpose.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#94d3c1]/70">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#c8ebe2]/65 transition-colors duration-200 hover:text-[#94d3c1]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <SupportDrawer>
                  <button className="text-sm text-[#c8ebe2]/65 transition-colors hover:text-[#94d3c1]">
                    Support Us
                  </button>
                </SupportDrawer>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#94d3c1]/70">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-[#c8ebe2]/65">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#94d3c1]" />
                Senior Correctional Centre, Roman Ridge, Accra, Ghana
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[#c8ebe2]/65">
                <Mail className="h-4 w-4 shrink-0 text-[#94d3c1]" />
                <a
                  href="mailto:springupproject@gmail.com"
                  className="transition-colors hover:text-[#94d3c1]"
                >
                  springupproject@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-5">
              <SupportDrawer>
                <Button
                  size="sm"
                  className="gap-1.5 bg-gradient-primary text-[#f0f7f5] shadow-sm transition-all duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
                >
                  <Heart className="h-3.5 w-3.5" />
                  Donate
                </Button>
              </SupportDrawer>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-[#94d3c1]/40">
            &copy; {new Date().getFullYear()} Project Spring Up. All rights reserved.
            Built with purpose in Accra, Ghana.
          </p>
        </div>
      </div>
    </footer>
  );
}
