import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";

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
  const [topics, attempts] = await Promise.all([
    prisma.topic.findMany({
      include: {
        questions: { include: { mastery: true } },
      },
    }),
    prisma.attempt.findMany({
      orderBy: { answeredAt: "desc" },
      select: { answeredAt: true },
    }),
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
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Masérská zkouška
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Adaptivní trénink na profesní kvalifikaci NSK 69-037-M.
          </p>
        </div>
        <Link
          href="/quiz"
          className={buttonVariants({ size: "lg" })}
        >
          {totalDue > 0 ? "Spustit trénink" : "Zkusit otázku"}
        </Link>
      </header>

      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            K opakování dnes
          </div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
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
        <div className="rounded-lg border bg-card p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Otázek v databázi
          </div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
            {totalQuestions}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Zvládnutí podle okruhu
        </h2>
        {topicRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Zatím nejsou nasazené žádné okruhy.
          </p>
        ) : (
          <ul className="space-y-3">
            {topicRows.map((t) => (
              <li key={t.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium">{t.nameCs}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t.seen}/{t.total} · {Math.round(t.masteryPct)}%
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{ width: `${t.masteryPct}%` }}
                  />
                </div>
                {t.due > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {t.due} k opakování
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
