import Link from "next/link";
import { GraduationCap, Heart, Mail, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SupportDrawer } from "@/components/marketing/support-drawer";

const footerLinks = [
  { label: "Mission", href: "#mission" },
  { label: "Curriculum", href: "#curriculum" },
  { label: "Login", href: "/login" },
];

export function Footer() {
  return (
    <footer className="border-t bg-[#0b1e3d]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Spring Up</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-blue-200/60">
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
                    className="text-sm text-blue-200/60 transition-colors duration-200 hover:text-sky-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <SupportDrawer>
                  <button className="text-sm text-pink-400 transition-colors hover:text-pink-300">
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
              <li className="flex items-start gap-2.5 text-sm text-blue-200/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                Senior Correctional Centre, Roman Ridge, Accra, Ghana
              </li>
              <li className="flex items-center gap-2.5 text-sm text-blue-200/60">
                <Mail className="h-4 w-4 shrink-0 text-sky-400" />
                springupproject@gmail.com
              </li>
            </ul>
            <div className="mt-5">
              <SupportDrawer>
                <Button
                  size="sm"
                  className="gap-1.5 bg-pink-500/20 text-pink-400 transition-all duration-200 hover:scale-[1.02] hover:bg-pink-500/30 active:scale-[0.98]"
                >
                  <Heart className="h-3.5 w-3.5" />
                  Donate
                </Button>
              </SupportDrawer>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-blue-200/40">
            &copy; {new Date().getFullYear()} Project Spring Up. All rights
            reserved. Built with purpose in Accra, Ghana.
          </p>
        </div>
      </div>
    </footer>
  );
}
