import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const LIMIT = 20;

function formatAnsweredAt(d: Date): string {
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
  });
}

export default async function ReviewPage() {
  const misses = await prisma.attempt.findMany({
    where: { correct: false },
    orderBy: { answeredAt: "desc" },
    take: LIMIT * 4,
    include: {
      question: {
        include: { topic: true },
      },
    },
  });

  const latestByQuestion = new Map<
    string,
    (typeof misses)[number]
  >();
  for (const m of misses) {
    if (!latestByQuestion.has(m.questionId)) {
      latestByQuestion.set(m.questionId, m);
    }
    if (latestByQuestion.size >= LIMIT) break;
  }
  const items = Array.from(latestByQuestion.values());

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Chybovník
          </h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Posledních {LIMIT} otázek, které jsi zodpověděl špatně. Projdi si
            správné odpovědi a vysvětlení.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium underline underline-offset-4 hover:text-foreground"
        >
          ← Přehled
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Zatím žádné chyby k procvičení. Až něco zkazíš, najdeš to tady.
        </p>
      ) : (
        <ol className="space-y-4">
          {items.map((m) => {
            const q = m.question;
            return (
              <li
                key={m.id}
                className="rounded-lg border bg-card px-5 py-4"
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {q.topic.nameCs}
                  </span>
                  <span className="tabular-nums">
                    {formatAnsweredAt(m.answeredAt)}
                  </span>
                </div>
                <p className="max-w-prose text-base font-medium leading-snug tracking-tight text-balance">
                  {q.stemCs}
                </p>
                <div className="mt-3 rounded-md border border-green-700/40 bg-green-50 px-3 py-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Správná odpověď
                  </div>
                  <p className="mt-1 max-w-prose text-sm leading-relaxed">
                    {q.correctAnswer}
                  </p>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Vysvětlení
                  </div>
                  <p className="mt-1 max-w-prose text-sm leading-relaxed">
                    {q.explanationCs}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
