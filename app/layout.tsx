import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

/**
 * Self-hosted variable fonts (via @fontsource-variable/*) — no request to
 * fonts.googleapis.com, so dev/build work offline or behind strict firewalls.
 */
// Paths must be string literals (no path.join) so Next can analyze them at build time.
const fontSans = localFont({
  src: "../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: "200 800",
});

const fontDisplay = localFont({
  src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

export const metadata: Metadata = {
  title: "Spring Up LMS",
  description:
    "Empowering the youth of the Senior Correctional Centre with digital literacy and ethical values.",
  icons: {
    icon: [{ url: "/icon.svg" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          storageKey="springup-theme"
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
