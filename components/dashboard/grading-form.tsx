"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { gradeSubmission } from "@/lib/actions/instructor";
import { cn } from "@/lib/utils";

const GRADE_PRESETS = [0, 25, 50, 60, 75, 80, 90, 100];

const RUBRIC_ITEMS = [
  "Assignment Completeness",
  "Accuracy & Understanding",
  "Presentation & Clarity",
  "Following Instructions",
];

export function GradingForm({
  submissionId,
  initialGrade,
  initialFeedback,
}: {
  submissionId: string;
  initialGrade?: number | null;
  initialFeedback?: string;
}) {
  const [grade, setGrade] = useState<number>(initialGrade ?? 80);
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [rubric, setRubric] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  function toggleRubric(item: string) {
    setRubric((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  function nudge(delta: number) {
    setGrade((prev) => Math.min(100, Math.max(0, prev + delta)));
  }

  function handleSubmit() {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("submission_id", submissionId);
      formData.append("grade", String(grade));
      formData.append("feedback", feedback);
      const result = await gradeSubmission(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Feedback submitted successfully!");
      }
    });
  }

  const gradeLabel =
    grade >= 90 ? "A" : grade >= 80 ? "B" : grade >= 70 ? "C" : grade >= 60 ? "D" : "F";

  const gradeColor =
    grade >= 80
      ? "text-primary"
      : grade >= 60
      ? "text-[#c9844a]"
      : "text-destructive";

  return (
    <div className="space-y-5">
      {/* ── Final Grade ──────────────────────────────── */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Final Grade
        </p>

        {/* Big grade display */}
        <div className="flex items-end gap-3">
          <div className="flex items-baseline gap-1">
            <span className={cn("font-display text-5xl font-bold tabular-nums leading-none", gradeColor)}>
              {grade}
            </span>
            <span className="text-base text-muted-foreground">/100</span>
          </div>
          <div className="mb-1 flex items-center gap-1.5">
            <span className={cn("rounded-lg px-2.5 py-1 text-sm font-bold", grade >= 80 ? "bg-gradient-primary text-[#f0f7f5]" : grade >= 60 ? "bg-secondary text-primary" : "bg-destructive/10 text-destructive")}>
              {gradeLabel}
            </span>
          </div>
        </div>

        {/* Slider */}
        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={100}
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
          <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground/60">
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
        </div>

        {/* Nudge buttons */}
        <div className="mt-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => nudge(-10)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            −10
          </button>
          <button
            type="button"
            onClick={() => nudge(-5)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold transition-colors hover:bg-muted-foreground/20"
          >
            −5
          </button>
          <button
            type="button"
            onClick={() => nudge(5)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold transition-colors hover:bg-muted-foreground/20"
          >
            +5
          </button>
          <button
            type="button"
            onClick={() => nudge(10)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold transition-colors hover:bg-primary/10 hover:text-primary"
          >
            +10
          </button>
        </div>

        {/* Presets */}
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Quick set
          </p>
          <div className="flex flex-wrap gap-1.5">
            {GRADE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setGrade(preset)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                  grade === preset
                    ? "bg-gradient-primary text-[#f0f7f5]"
                    : "bg-muted text-muted-foreground hover:bg-secondary hover:text-primary"
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* ── Rubric Checklist ─────────────────────────── */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Rubric Checklist
        </p>
        <div className="space-y-1.5">
          {RUBRIC_ITEMS.map((item) => {
            const checked = !!rubric[item];
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleRubric(item)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors",
                  checked ? "bg-secondary text-primary" : "hover:bg-muted/70 text-foreground"
                )}
              >
                <span className="shrink-0">
                  {checked ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </span>
                <span className="font-medium">{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* ── Constructive Feedback ────────────────────── */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Constructive Feedback
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Write detailed, actionable feedback for the student…"
          disabled={isPending}
          className="flex w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 text-xs leading-relaxed shadow-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* ── Submit ───────────────────────────────────── */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-[#f0f7f5] transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {isPending ? "Submitting…" : "Submit Feedback"}
      </button>
    </div>
  );
}
