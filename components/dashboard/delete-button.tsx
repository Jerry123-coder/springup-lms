"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  hiddenFields,
  label,
}: {
  action: (fd: FormData) => Promise<{ error?: string | null; success?: boolean }>;
  hiddenFields: Record<string, string>;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (!confirm(`Delete this ${label.toLowerCase()}? This cannot be undone.`))
      return;

    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${label} deleted`);
      }
    });
  }

  return (
    <form action={handleSubmit}>
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={isPending}
        className="h-7 w-7 text-destructive hover:text-destructive"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        <span className="sr-only">Delete {label}</span>
      </Button>
    </form>
  );
}
