import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MasterySparkline } from "@/components/mastery-sparkline";
import { storage, HISTORY_DAYS } from "@/lib/storage";

export const dynamic = "force-dynamic";

function dayLabel(n: number): string {
  if (n === 1) return "den";
  if (n >= 2 && n <= 4) return "dny";
  return "dní";
}

export default async function DashboardPage() {
  const [topics, streak, counts] = await Promise.all([
    storage.getMasteryByTopic({ historyDays: HISTORY_DAYS }),
    storage.getStreakDays(),
    storage.getAggregateCounts(),
  ]);

  const topicRows = [...topics].sort((a, b) => {
    if (b.due !== a.due) return b.due - a.due;
    if (a.masteryPct !== b.masteryPct) return a.masteryPct - b.masteryPct;
    return a.nameCs.localeCompare(b.nameCs, "cs");
  });

  const totalDue = counts.totalDue;
  const totalQuestions = counts.totalQuestions;

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
            {totalDue > 0 ? "Spustit trénink" : "Zkusit otázku navíc"}
          </Link>
        </div>
      </header>

      <section className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wide text-primary">
              {totalDue > 0 ? "K opakování dnes" : "Dnes splněno"}
            </div>
            {totalDue > 0 ? (
              <div className="mt-0.5 text-3xl font-semibold tabular-nums leading-none text-primary">
                {totalDue}
              </div>
            ) : (
              <p className="mt-1 text-sm font-medium leading-snug text-balance">
                Máš všechno za sebou.
              </p>
            )}
          </div>
          <div className="shrink-0 border-l border-primary/20 pl-4 text-right">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Série
            </div>
            <div className="mt-0.5 text-xl font-semibold tabular-nums leading-none">
              {streak}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {dayLabel(streak)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10 hidden gap-3 sm:grid sm:grid-cols-4">
        {totalDue > 0 ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:col-span-2">
            <div className="text-xs font-medium uppercase tracking-wide text-primary">
              K opakování dnes
            </div>
            <div className="mt-2 text-5xl font-semibold tabular-nums text-primary">
              {totalDue}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 sm:col-span-2">
            <div className="text-xs font-medium uppercase tracking-wide text-primary">
              Dnes splněno
            </div>
            <p className="mt-2 max-w-prose text-lg font-medium leading-snug tracking-tight text-balance">
              Máš všechno z dneška za sebou.
            </p>
            <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
              Další otázky se vrátí, až jim vyprší termín opakování. Můžeš si zkusit i něco navíc.
            </p>
          </div>
        )}
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
                      values={t.history}
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
