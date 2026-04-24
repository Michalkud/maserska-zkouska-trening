import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  SESSION_CAP,
  SESSION_GAP_MS,
  computeSessionStats,
} from "@/lib/session";
import { storage } from "@/lib/storage";
import { QuizForm } from "./quiz-form";

export const dynamic = "force-dynamic";

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string | string[]; since?: string | string[] }>;
}) {
  const params = await searchParams;
  const topicParam = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const sinceParam = Array.isArray(params.since) ? params.since[0] : params.since;
  const sinceParsed = sinceParam ? new Date(sinceParam) : null;
  const since = sinceParsed && !Number.isNaN(sinceParsed.getTime()) ? sinceParsed : null;

  const allTopics = await storage.listTopics();
  const scopedTopic = topicParam
    ? allTopics.find((t) => t.id === topicParam) ?? null
    : null;
  const scopeId = scopedTopic?.id;

  const [picked, counts, recentAttempts] = await Promise.all([
    storage.getNextDueQuestion(scopeId ? { topicId: scopeId } : undefined),
    storage.getAggregateCounts(scopeId ? { topicId: scopeId } : undefined),
    storage.getRecentAttempts({ sinceMs: 4 * SESSION_GAP_MS }),
  ]);

  const session = computeSessionStats(recentAttempts, since);
  const dueToday = counts.totalDue;
  const now = new Date();

  const atCap = session.count >= SESSION_CAP;
  const exhausted = !picked;

  if ((atCap || exhausted) && session.count > 0) {
    const continueParams = new URLSearchParams();
    if (scopedTopic) continueParams.set("topic", scopedTopic.id);
    continueParams.set("since", now.toISOString());
    const continueHref = `/quiz?${continueParams.toString()}`;

    let nextDueAt: Date | undefined;
    if (exhausted) {
      const scopedQuestions = await storage.listQuestions(
        scopeId ? { topicId: scopeId } : undefined,
      );
      nextDueAt = scopedQuestions
        .map((q) => q.mastery?.dueAt)
        .filter((d): d is Date => !!d && d.getTime() > now.getTime())
        .sort((a, b) => a.getTime() - b.getTime())[0];
    }

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
          className="shrink-0 underline underline-offset-4 hover:text-foreground"
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
