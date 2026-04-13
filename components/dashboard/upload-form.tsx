"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { FileUp, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadSubmission } from "@/lib/actions/student";

const ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,image/jpeg,image/png,image/webp";

const ACCEPT_LABEL =
  "PDF, Word, PowerPoint, Excel, images (JPG, PNG), or text — max 15 MB typical";

export function UploadForm({
  lessonId,
  courseId,
  className,
  hasExistingSubmission = false,
}: {
  lessonId: string;
  courseId?: string;
  className?: string;
  /** When true, copy explains this upload replaces the previous file shown above. */
  hasExistingSubmission?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const setFileFromList = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    inputRef.current.files = dt.files;
    setFileName(file.name);
  }, []);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await uploadSubmission(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          hasExistingSubmission
            ? "Assignment updated — your latest file was saved."
            : "Assignment uploaded successfully."
        );
        setFileName(null);
        formRef.current?.reset();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className={cn("space-y-4", className)}
    >
      <input type="hidden" name="lesson_id" value={lessonId} />
      {courseId ? <input type="hidden" name="course_id" value={courseId} /> : null}

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) setFileFromList(file);
        }}
        className={cn(
          "relative flex min-h-[min(12rem,40svh)] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          "border-border bg-muted/30 hover:bg-muted/45",
          isDragging && "border-primary/50 bg-primary/5 ring-2 ring-primary/20",
          isPending && "pointer-events-none opacity-70"
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name="file"
          required
          accept={ACCEPT}
          className="sr-only"
          aria-label="Choose file to upload"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm">
          <FileUp className="h-6 w-6" aria-hidden />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">
          Drop your file here, or{" "}
          <span className="text-primary underline decoration-primary/30 underline-offset-2">
            browse
          </span>
        </p>
        <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
          {ACCEPT_LABEL}
        </p>
        {hasExistingSubmission ? (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-500" />
            Uploading again replaces your previous file for this lesson.
          </p>
        ) : null}
      </div>

      {fileName && !isPending ? (
        <div className="flex items-center gap-2 rounded-xl bg-secondary/80 px-3 py-2 text-sm text-secondary-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 truncate font-medium">{fileName}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {fileName ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-12 rounded-xl sm:mr-auto"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              formRef.current?.reset();
              setFileName(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            Clear selection
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="ghost"
          loading={isPending}
          disabled={isPending || !fileName}
          className="min-h-12 rounded-xl bg-gradient-primary px-8 font-medium text-primary-foreground shadow-sm hover:bg-gradient-primary hover:opacity-90"
        >
          {isPending ? "Uploading…" : hasExistingSubmission ? "Submit latest file" : "Submit assignment"}
        </Button>
      </div>
    </form>
  );
}
