import Link from "next/link";
import { prisma } from "@/lib/db";
import { pickNextQuestion, type SelectorQuestion } from "@/lib/selector";
import { QuizForm } from "./quiz-form";

export const dynamic = "force-dynamic";

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string | string[] }>;
}) {
  const params = await searchParams;
  const topicParam = Array.isArray(params.topic) ? params.topic[0] : params.topic;

  const scopedTopic = topicParam
    ? await prisma.topic.findUnique({ where: { id: topicParam } })
    : null;
  const scopeId = scopedTopic?.id ?? null;

  const questions = await prisma.question.findMany({
    where: scopeId ? { topicId: scopeId } : undefined,
    include: { topic: true, mastery: true },
  });

  const candidates: SelectorQuestion[] = questions.map((q) => ({
    id: q.id,
    topicId: q.topicId,
    topicWeight: q.topic.weight,
    mastery: q.mastery
      ? { ease: q.mastery.ease, dueAt: q.mastery.dueAt }
      : null,
  }));

  const picked = pickNextQuestion(candidates);

  if (!picked) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        {scopedTopic && (
          <div className="mb-3 text-sm font-medium text-muted-foreground">
            {scopedTopic.nameCs}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">
          Žádné otázky k opakování
        </h1>
        <p className="mt-3 text-muted-foreground">
          {scopedTopic
            ? "V tomto okruhu nejsou aktuálně otázky k opakování. Zkus jiný okruh nebo se vrať později."
            : "Všechny otázky jsou aktuálně mimo termín opakování. Vrať se později."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium underline underline-offset-4"
        >
          ← Zpět na přehled
        </Link>
      </main>
    );
  }

  const full = questions.find((q) => q.id === picked.id)!;
  const choices: string[] | null = full.choices
    ? (JSON.parse(full.choices) as string[])
    : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between text-sm text-muted-foreground">
        <span className="font-medium">
          {full.topic.nameCs}
          {scopedTopic && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              okruh
            </span>
          )}
        </span>
        <Link
          href="/"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Přehled
        </Link>
      </div>
      <QuizForm
        questionId={full.id}
        kind={full.kind as "mc" | "open"}
        stemCs={full.stemCs}
        choices={choices}
        correctAnswer={full.correctAnswer}
        explanationCs={full.explanationCs}
      />
    </main>
  );
}
