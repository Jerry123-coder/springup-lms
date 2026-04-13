"use client";

import {
  useTransition,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type LoadingLinkProps = VariantProps<typeof buttonVariants> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "href"> & {
    href: string;
    children: ReactNode;
  };

/** Client navigation with a loading spinner until the route transition runs (same-tab). */
export function LoadingLink({
  href,
  className,
  variant,
  size,
  children,
  disabled,
  ...props
}: LoadingLinkProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      onClick={() => startTransition(() => router.push(href))}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span className="contents [&_svg]:hidden">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
