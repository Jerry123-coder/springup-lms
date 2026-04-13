import { AlertCircle, GraduationCap } from "lucide-react";

import { LoadingLink } from "@/components/ui/loading-link";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/lib/actions/auth";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-12 pt-4">
      <Card className="relative w-full max-w-sm border-white/15 bg-card/80 shadow-xl shadow-black/20 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-900/30">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-xl">Choose a new password</CardTitle>
          <CardDescription>
            Use a password you haven&apos;t used here before. At least 6 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {params.error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {params.error}
            </div>
          )}

          <form action={updatePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                New password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirm_password"
                className="text-sm font-medium leading-none"
              >
                Confirm password
              </label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Repeat password"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            <SubmitButton className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
              Update password
            </SubmitButton>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            <LoadingLink
              href="/login"
              variant="link"
              className="h-auto p-0 text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
            >
              Back to sign in
            </LoadingLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
