import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { SessionStats } from "@/lib/session";
import type {
  AggregateCounts,
  QuestionWithContext,
  Topic,
} from "@/lib/storage/types";
import { QuizForm } from "./quiz-form";

export type QuizViewData = {
  scopedTopic: Topic | null;
  picked: QuestionWithContext | null;
  counts: AggregateCounts;
  session: SessionStats;
  nextDueAt: Date | undefined;
  now: Date;
  atCap: boolean;
  exhausted: boolean;
};

export function QuizView({
  data,
  onNext,
}: {
  data: QuizViewData;
  onNext?: () => void;
}) {
  const {
    scopedTopic,
    picked,
    counts,
    session,
    nextDueAt,
    now,
    atCap,
    exhausted,
  } = data;
  const dueToday = counts.totalDue;

  if ((atCap || exhausted) && session.count > 0) {
    const continueParams = new URLSearchParams();
    if (scopedTopic) continueParams.set("topic", scopedTopic.id);
    continueParams.set("since", now.toISOString());
    const continueHref = `/quiz?${continueParams.toString()}`;

    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        {scopedTopic && (
          <div className="mb-3 text-sm font-medium text-muted-foreground">
            {scopedTopic.nameCs}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {exhausted ? "Hotovo pro teď" : "Pauza se hodí"}
        </h1>
        <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
          {exhausted
            ? `Odpověděl jsi ${attemptLabel(session.count)} v této sérii${
                scopedTopic ? " v tomto okruhu" : ""
              }. Další opakování přijdou postupně ${nextDueAtLabel(nextDueAt)}.`
            : `Odpovědi se ti kupí — v téhle sérii už jich je ${session.count}. Krátká pauza pomůže udržet pozornost. Můžeš klidně pokračovat, pokud chceš.`}
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryStat label="Otázek" value={String(session.count)} />
          <SummaryStat
            label="Úspěšnost"
            value={`${Math.round(session.accuracy * 100)} %`}
          />
          <SummaryStat label="Okruhů" value={String(session.topics.length)} />
          <SummaryStat
            label={exhausted ? "Zbývá dnes" : "Dnes ještě"}
            value={String(dueToday)}
          />
        </dl>

        {session.topics.length > 0 && (
          <p className="mt-6 max-w-prose text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Okruhy:</span>{" "}
            {session.topics.join(" · ")}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Zpět na přehled
          </Link>
          {!exhausted && (
            <Link
              href={continueHref}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Pokračovat
            </Link>
          )}
          {exhausted && scopedTopic && (
            <Link
              href="/quiz"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Trénink napříč okruhy
            </Link>
          )}
        </div>
      </main>
    );
  }

  if (!picked) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        {scopedTopic && (
          <div className="mb-3 text-sm font-medium text-muted-foreground">
            {scopedTopic.nameCs}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {scopedTopic
            ? "V tomto okruhu je teď klid"
            : "Dnes už máš všechno projeté"}
        </h1>
        <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
          {scopedTopic
            ? "Otázky z tohoto okruhu čekají, až jim vyprší termín opakování. Zkus jiný okruh nebo si projdi chybovník."
            : "Všechny otázky jsou zatím mimo termín opakování. Vrať se později, nebo si mezitím projdi chybovník."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Zpět na přehled
          </Link>
          {scopedTopic ? (
            <Link
              href="/quiz"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Trénink napříč okruhy
            </Link>
          ) : (
            <Link
              href="/review"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Chybovník
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span className="flex min-w-0 items-center gap-2 font-medium">
          <span className="truncate">{picked.topic.nameCs}</span>
          {scopedTopic && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              okruh
            </span>
          )}
          {dueToday > 0 && (
            <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums">
              {dueToday} k opakování
            </span>
          )}
        </span>
        <Link
          href="/"
          className="shrink-0 rounded-sm underline underline-offset-4 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          Přehled
        </Link>
      </div>
      <QuizForm
        questionId={picked.id}
        kind={picked.kind}
        stemCs={picked.stemCs}
        choices={picked.choices}
        correctAnswer={picked.correctAnswer}
        explanationCs={picked.explanationCs}
        onNext={onNext}
      />
    </main>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function attemptLabel(n: number): string {
  if (n === 1) return "1 otázku";
  if (n >= 2 && n <= 4) return `${n} otázky`;
  return `${n} otázek`;
}

function nextDueAtLabel(next: Date | undefined): string {
  if (!next) return "později";
  const diffMs = next.getTime() - Date.now();
  const diffH = diffMs / (60 * 60 * 1000);
  if (diffH < 1) return "během hodiny";
  if (diffH < 24) return `za ${Math.round(diffH)} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return "zítra";
  if (diffD >= 2 && diffD <= 4) return `za ${diffD} dny`;
  return `za ${diffD} dní`;
}
