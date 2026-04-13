import Link from "next/link";
import { GraduationCap, AlertCircle, CheckCircle2 } from "lucide-react";

import { SubmitButton } from "@/components/ui/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login, signup } from "@/lib/actions/auth";
import { getSiteUrl } from "@/lib/site-url";
import { safeAppRedirectPath } from "@/lib/safe-redirect";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
    tab?: string;
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isSignUp = params.tab === "signup";
  const next = safeAppRedirectPath(params.next ?? null, getSiteUrl()) ?? undefined;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-12 pt-4">
      <Card className="relative w-full max-w-sm border-white/15 bg-card/80 shadow-xl shadow-black/20 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-900/30">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-xl">
            {isSignUp ? "Create account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Sign up for the Spring Up portal"
              : "Sign in to the Spring Up portal"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {params.error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {params.error}
            </div>
          )}

          {params.message && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {params.message}
            </div>
          )}

          {isSignUp ? (
            <form action={signup} className="space-y-4">
              {next ? <input type="hidden" name="next" value={next} /> : null}
              <div className="space-y-2">
                <label
                  htmlFor="full_name"
                  className="text-sm font-medium leading-none"
                >
                  Full Name
                </label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Kwame Mensah"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>
              <SubmitButton className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
                Create Account
              </SubmitButton>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
                >
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <form action={login} className="space-y-4">
              {next ? <input type="hidden" name="next" value={next} /> : null}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none"
                  >
                    Password
                  </label>
                  <Link
                    href="/login/forgot-password"
                    className="text-xs font-medium text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your password"
                  required
                />
              </div>
              <SubmitButton className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
                Sign In
              </SubmitButton>
              <p className="text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/login?tab=signup"
                  className="text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
                >
                  Sign up
                </Link>
              </p>
            </form>
          )}

          {/* <div className="mt-6">
            <Button variant="outline" className="w-full border-white/20 bg-white/5" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
