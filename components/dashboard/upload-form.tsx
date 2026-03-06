"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadSubmission } from "@/lib/actions/student";

export function UploadForm({ lessonId }: { lessonId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await uploadSubmission(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Assignment uploaded successfully!");
        setFileName(null);
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <input type="hidden" name="lesson_id" value={lessonId} />
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            type="file"
            name="file"
            required
            className="cursor-pointer"
            onChange={(e) =>
              setFileName(e.target.files?.[0]?.name ?? null)
            }
          />
        </div>
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : fileName ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isPending ? "Uploading..." : "Submit"}
        </Button>
      </div>
      {fileName && !isPending && (
        <p className="text-xs text-muted-foreground">
          Selected: {fileName}
        </p>
      )}
    </form>
  );
}
