import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MasterySparkline } from "@/components/mastery-sparkline";
import { prisma } from "@/lib/db";
import { HISTORY_DAYS, masteryHistoryByTopic } from "@/lib/mastery-history";

export const dynamic = "force-dynamic";

function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeEase(ease: number): number {
  return Math.max(0, Math.min(1, (ease - 1.3) / (3.0 - 1.3)));
}

function dayLabel(n: number): string {
  if (n === 1) return "den";
  if (n >= 2 && n <= 4) return "dny";
  return "dní";
}

export default async function DashboardPage() {
  const [topics, attempts, history] = await Promise.all([
    prisma.topic.findMany({
      include: {
        questions: { include: { mastery: true } },
      },
    }),
    prisma.attempt.findMany({
      orderBy: { answeredAt: "desc" },
      select: { answeredAt: true },
    }),
    masteryHistoryByTopic(),
  ]);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const topicRows = topics
    .map((t) => {
      const total = t.questions.length;
      const seen = t.questions.filter((q) => q.mastery).length;
      const masterySum = t.questions.reduce(
        (acc, q) => acc + (q.mastery ? normalizeEase(q.mastery.ease) : 0),
        0,
      );
      const masteryPct = total > 0 ? (masterySum / total) * 100 : 0;
      const due = t.questions.filter(
        (q) => !q.mastery || q.mastery.dueAt <= endOfToday,
      ).length;
      return {
        id: t.id,
        nameCs: t.nameCs,
        total,
        seen,
        masteryPct,
        due,
        history: history.get(t.id) ?? null,
      };
    })
    .sort((a, b) => {
      if (b.due !== a.due) return b.due - a.due;
      if (a.masteryPct !== b.masteryPct) return a.masteryPct - b.masteryPct;
      return a.nameCs.localeCompare(b.nameCs, "cs");
    });

  const totalDue = topicRows.reduce((s, t) => s + t.due, 0);
  const totalQuestions = topicRows.reduce((s, t) => s + t.total, 0);

  const daySet = new Set(attempts.map((a) => localDayKey(a.answeredAt)));
  let streak = 0;
  const cursor = new Date();
  if (!daySet.has(localDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daySet.has(localDayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-prose">
          <h1 className="text-3xl font-semibold tracking-tight">
            Masérská zkouška
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Adaptivní trénink na profesní kvalifikaci NSK 69-037-M.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/review"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Chybovník
          </Link>
          <Link
            href="/quiz"
            className={buttonVariants({ size: "lg" })}
          >
            {totalDue > 0 ? "Spustit trénink" : "Zkusit otázku"}
          </Link>
        </div>
      </header>

      <section className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:col-span-2">
          <div className="text-xs font-medium uppercase tracking-wide text-primary">
            K opakování dnes
          </div>
          <div className="mt-2 text-5xl font-semibold tabular-nums text-primary">
            {totalDue}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Série
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">
              {streak}
            </span>
            <span className="text-sm text-muted-foreground">
              {dayLabel(streak)} po sobě
            </span>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Otázek v databázi
          </div>
          <div className="mt-2 text-2xl font-medium tabular-nums text-muted-foreground">
            {totalQuestions}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Zvládnutí podle okruhu
        </h2>
        {topicRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Zatím nejsou nasazené žádné okruhy.
          </p>
        ) : (
          <ul className="space-y-2">
            {topicRows.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/quiz?topic=${t.id}`}
                  className="block rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-base font-medium tracking-tight">
                      {t.nameCs}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {t.seen}/{t.total} · {Math.round(t.masteryPct)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500"
                        style={{ width: `${t.masteryPct}%` }}
                      />
                    </div>
                    <MasterySparkline
                      values={
                        t.history ??
                        (Array.from({ length: HISTORY_DAYS }, () => null) as (
                          | number
                          | null
                        )[])
                      }
                      ariaLabel={`Průměrná známka ${t.nameCs} za posledních ${HISTORY_DAYS} dní`}
                    />
                  </div>
                  {t.due > 0 && (
                    <div className="mt-1.5 text-xs text-muted-foreground">
                      {t.due} k opakování
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
