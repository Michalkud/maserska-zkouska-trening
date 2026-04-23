"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  questionId: string;
  kind: "mc" | "open";
  stemCs: string;
  choices: string[] | null;
  correctAnswer: string;
  explanationCs: string;
};

export function QuizForm({
  questionId,
  kind,
  stemCs,
  choices,
  correctAnswer,
  explanationCs,
}: Props) {
  const router = useRouter();
  const startRef = useRef<number>(Date.now());
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState<{ correct: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startRef.current = Date.now();
  }, [questionId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "TEXTAREA" ||
        (target?.tagName === "INPUT" &&
          (target as HTMLInputElement).type !== "radio") ||
        target?.isContentEditable === true;

      if (e.key === "Escape") {
        e.preventDefault();
        router.push("/");
        return;
      }

      if (graded) {
        if (e.key === "Enter" || e.key === "n" || e.key === "N") {
          e.preventDefault();
          next();
        }
        return;
      }

      if (kind === "mc" && choices) {
        const idx = Number(e.key);
        if (Number.isInteger(idx) && idx >= 1 && idx <= choices.length) {
          e.preventDefault();
          setAnswer(choices[idx - 1]);
          return;
        }
        if (e.key === "Enter" && !isTyping && answer && !submitting) {
          e.preventDefault();
          submitMc();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function postAttempt(body: Record<string, unknown>) {
    setSubmitting(true);
    await fetch("/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
  }

  async function submitMc() {
    if (!answer) return;
    const correct = answer === correctAnswer;
    setGraded({ correct });
    await postAttempt({
      questionId,
      userAnswer: answer,
      responseTimeMs: Date.now() - startRef.current,
    });
  }

  async function selfGrade(grade: number) {
    setGraded({ correct: grade >= 3 });
    await postAttempt({
      questionId,
      userAnswer: answer,
      selfGrade: grade,
      responseTimeMs: Date.now() - startRef.current,
    });
  }

  function next() {
    router.refresh();
    setAnswer("");
    setRevealed(false);
    setGraded(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="max-w-prose text-2xl font-semibold leading-snug tracking-tight text-balance">
        {stemCs}
      </h1>

      {kind === "mc" && choices && (
        <fieldset
          className="space-y-2"
          disabled={submitting || graded !== null}
        >
          {choices.map((c) => {
            const isSelected = answer === c;
            const showResult = graded !== null;
            const isCorrect = showResult && c === correctAnswer;
            const isWrongChoice =
              showResult && isSelected && c !== correctAnswer;
            return (
              <label
                key={c}
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
                  !showResult && isSelected ? "border-primary bg-muted" : "",
                  isCorrect ? "border-green-700 bg-green-50" : "",
                  isWrongChoice ? "border-destructive bg-destructive/10" : "",
                  showResult ? "cursor-default" : "hover:bg-muted/60",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="choice"
                  value={c}
                  checked={isSelected}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="mt-1.5"
                />
                <span className="text-base leading-relaxed">{c}</span>
              </label>
            );
          })}
        </fieldset>
      )}

      {kind === "open" && (
        <textarea
          className="w-full min-h-[160px] rounded-lg border bg-background p-3 text-sm leading-relaxed outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          placeholder="Napiš odpověď vlastními slovy…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={revealed}
        />
      )}

      {!graded && kind === "mc" && (
        <Button onClick={submitMc} disabled={!answer || submitting}>
          Odeslat
        </Button>
      )}

      {!graded && kind === "open" && !revealed && (
        <Button
          onClick={() => setRevealed(true)}
          disabled={!answer.trim() || submitting}
        >
          Zobrazit správnou odpověď
        </Button>
      )}

      {!graded && kind === "open" && revealed && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Správná odpověď
            </div>
            <p className="mt-1.5 max-w-prose text-sm leading-relaxed">
              {correctAnswer}
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Jak jsi odpověděl ve srovnání se správnou odpovědí?
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="destructive"
                onClick={() => selfGrade(1)}
                disabled={submitting}
              >
                Špatně
              </Button>
              <Button
                variant="outline"
                onClick={() => selfGrade(3)}
                disabled={submitting}
              >
                Částečně
              </Button>
              <Button
                variant="outline"
                onClick={() => selfGrade(4)}
                disabled={submitting}
              >
                Dobře
              </Button>
              <Button onClick={() => selfGrade(5)} disabled={submitting}>
                Snadné
              </Button>
            </div>
          </div>
        </div>
      )}

      {graded && (
        <div className="space-y-4 rounded-lg border bg-muted/40 p-5">
          <div
            className={
              graded.correct
                ? "text-sm font-medium text-green-700"
                : "text-sm font-medium text-destructive"
            }
          >
            {graded.correct ? "✓ Správně" : "✗ Špatně"}
          </div>
          {kind === "mc" && !graded.correct && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Správná odpověď
              </div>
              <p className="mt-1.5 max-w-prose text-sm leading-relaxed">
                {correctAnswer}
              </p>
            </div>
          )}
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vysvětlení
            </div>
            <p className="mt-1.5 max-w-prose text-sm leading-relaxed">
              {explanationCs}
            </p>
          </div>
          <Button onClick={next}>Další otázka →</Button>
        </div>
      )}

      <ShortcutHints kind={kind} graded={graded !== null} />
    </div>
  );
}

function ShortcutHints({
  kind,
  graded,
}: {
  kind: "mc" | "open";
  graded: boolean;
}) {
  const hints: { keys: string[]; label: string }[] = [];
  if (!graded && kind === "mc") {
    hints.push({ keys: ["1", "–", "4"], label: "volba" });
    hints.push({ keys: ["Enter"], label: "odeslat" });
  }
  if (graded) {
    hints.push({ keys: ["N", "Enter"], label: "další" });
  }
  hints.push({ keys: ["Esc"], label: "přehled" });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-muted-foreground">
      {hints.map((h, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {h.keys.map((k, j) => (
            <kbd
              key={j}
              className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] leading-none text-foreground"
            >
              {k}
            </kbd>
          ))}
          <span>{h.label}</span>
        </span>
      ))}
    </div>
  );
}
