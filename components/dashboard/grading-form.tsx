"use client";

import { useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gradeSubmission } from "@/lib/actions/instructor";

export function GradingForm({ submissionId }: { submissionId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await gradeSubmission(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Submission graded successfully!");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="submission_id" value={submissionId} />

      <div className="space-y-2">
        <label htmlFor="grade" className="text-sm font-medium">
          Grade (0–100)
        </label>
        <Input
          id="grade"
          name="grade"
          type="number"
          min={0}
          max={100}
          placeholder="85"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="feedback" className="text-sm font-medium">
          Feedback
        </label>
        <textarea
          id="feedback"
          name="feedback"
          rows={4}
          placeholder="Great work! Consider improving..."
          disabled={isPending}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full gap-2">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {isPending ? "Submitting..." : "Submit Grade"}
      </Button>
    </form>
  );
}
