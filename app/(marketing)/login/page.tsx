import Link from "next/link";
import { GraduationCap, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login, signup } from "@/lib/actions/auth";

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
  const next = params.next;

  return (
    <div className="relative flex min-h-[calc(100svh-8rem)] items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#0f2847]/5 via-transparent to-emerald-50/50" />

      <Card className="relative w-full max-w-sm border-sky-100 shadow-lg shadow-sky-500/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-sky-400 to-emerald-400">
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
            <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
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
              <Button
                type="submit"
                className="w-full bg-sky-500 text-white hover:bg-sky-400"
              >
                Create Account
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-sky-600 underline-offset-4 hover:underline"
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
                  placeholder="Your password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-sky-500 text-white hover:bg-sky-400"
              >
                Sign In
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/login?tab=signup"
                  className="text-sky-600 underline-offset-4 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </form>
          )}

          <div className="mt-6">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
