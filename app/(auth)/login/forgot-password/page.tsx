import { ArrowLeft, AlertCircle, CheckCircle2, GraduationCap } from "lucide-react";

import { LoadingLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/actions/auth";

interface Props {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-12 pt-4">
      <Card className="relative w-full max-w-sm border-white/15 bg-card/80 shadow-xl shadow-black/20 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-900/30">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter the email you use for Spring Up. We&apos;ll send you a link to
            choose a new password.
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

          <form action={requestPasswordReset} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <SubmitButton className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
              Send reset link
            </SubmitButton>
          </form>

          <LoadingLink
            href="/login"
            variant="ghost"
            className="mt-4 w-full gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </LoadingLink>
        </CardContent>
      </Card>
    </div>
  );
}
